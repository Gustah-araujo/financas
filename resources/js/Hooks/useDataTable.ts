import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export interface PaginatedMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
}

export interface SortState {
    column: string | null;
    direction: 'asc' | 'desc';
}

export interface DataTableState<T> {
    rows: T[];
    meta: PaginatedMeta;
    isLoading: boolean;
    sort: SortState;
    page: number;
    search: string;
    setPage: (page: number) => void;
    toggleSort: (column: string) => void;
    setSearch: (search: string) => void;
    reload: () => void;
}

const DEFAULT_META: PaginatedMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: null,
    to: null,
};

interface UseDataTableOptions {
    /** The API endpoint to fetch rows from */
    endpoint: string;
    /** Extra static query params included in every request */
    params?: Record<string, unknown>;
    /** Rows per page sent to the server (default: 15) */
    perPage?: number;
}

/**
 * Manages server-side data fetching for DataTable.
 * Handles pagination, sorting, debounced search, and request cancellation.
 */
export function useDataTable<T>({
    endpoint,
    params = {},
    perPage = 15,
}: UseDataTableOptions): DataTableState<T> {
    const [rows, setRows] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginatedMeta>(DEFAULT_META);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPageState] = useState(1);
    const [search, setSearchState] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSortState] = useState<SortState>({ column: null, direction: 'asc' });

    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce search input by 400ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Stable key for params object to detect changes without reference equality issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const paramsKey = JSON.stringify(params);

    const fetchData = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);

        try {
            const response = await axios.get<PaginatedResponse<T>>(endpoint, {
                signal: controller.signal,
                params: {
                    ...params,
                    page,
                    per_page: perPage,
                    ...(debouncedSearch ? { search: debouncedSearch } : {}),
                    ...(sort.column ? { sort: sort.column, direction: sort.direction } : {}),
                },
            });

            setRows(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            if (axios.isCancel(error)) return;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, page, debouncedSearch, sort, perPage, paramsKey]);

    useEffect(() => {
        fetchData();
        return () => abortControllerRef.current?.abort();
    }, [fetchData]);

    function setPage(newPage: number) {
        setPageState(newPage);
    }

    function toggleSort(column: string) {
        setSortState((prev) => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
        setPageState(1);
    }

    function setSearch(value: string) {
        setSearchState(value);
        setPageState(1);
    }

    return {
        rows,
        meta,
        isLoading,
        sort,
        page,
        search,
        setPage,
        toggleSort,
        setSearch,
        reload: fetchData,
    };
}
