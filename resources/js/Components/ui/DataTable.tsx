import { forwardRef, ReactNode, useImperativeHandle, ForwardedRef, ReactElement } from 'react';
import { useDataTable, SortState, PaginatedMeta } from '@/Hooks/useDataTable';

/** Column definition for DataTable */
export interface Column<T> {
    /** Unique identifier — used as sort key when sortable */
    key: string;
    /** Header label displayed in <th> */
    label: string;
    /**
     * Custom cell renderer.
     * Falls back to `String(row[key])` when omitted.
     */
    render?: (row: T) => ReactNode;
    /** Enables server-side sorting when the header is clicked */
    sortable?: boolean;
    /** Additional Tailwind classes applied to every <td> in this column */
    className?: string;
    /** Additional Tailwind classes applied to the <th> */
    headerClassName?: string;
}

/** Imperative handle exposed via ref for external control */
export interface DataTableHandle {
    /** Manually trigger a data reload from the server */
    reload: () => void;
}

interface DataTableProps<T> {
    /** API endpoint URL (e.g. `/api/transactions`) */
    endpoint: string;
    /** Column definitions */
    columns: Column<T>[];
    /**
     * Extra static query params sent on every request.
     * Use `useMemo` on the parent to keep this reference stable
     * and avoid unnecessary re-fetches.
     */
    params?: Record<string, unknown>;
    /** Rows per page requested from the server (default: 15) */
    perPage?: number;
    /** Render a search input that filters results server-side */
    searchable?: boolean;
    /** Placeholder for the search input */
    searchPlaceholder?: string;
    /** Message shown when no rows are returned */
    emptyMessage?: string;
    /** Font Awesome icon class for the empty state (default: `fa-solid fa-inbox`) */
    emptyIcon?: string;
    /** Additional Tailwind classes for the outermost wrapper */
    className?: string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ column, sort }: { column: string; sort: SortState }) {
    if (sort.column !== column) {
        return <i className="fa-solid fa-sort ml-1.5 text-gray-400" aria-hidden="true" />;
    }
    return sort.direction === 'asc' ? (
        <i className="fa-solid fa-sort-up ml-1.5 text-indigo-500" aria-hidden="true" />
    ) : (
        <i className="fa-solid fa-sort-down ml-1.5 text-indigo-500" aria-hidden="true" />
    );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow({ columnCount }: { columnCount: number }) {
    return (
        <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700">
            {Array.from({ length: columnCount }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
                </td>
            ))}
        </tr>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    meta: PaginatedMeta;
    onPageChange: (page: number) => void;
}

function Pagination({ meta, onPageChange }: PaginationProps) {
    const { current_page, last_page, from, to, total } = meta;

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-3 dark:border-gray-700 sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                {from !== null && to !== null ? (
                    <>
                        Showing{' '}
                        <span className="font-medium text-gray-900 dark:text-white">{from}</span>
                        {' – '}
                        <span className="font-medium text-gray-900 dark:text-white">{to}</span>
                        {' of '}
                        <span className="font-medium text-gray-900 dark:text-white">{total}</span>{' '}
                        results
                    </>
                ) : (
                    '0 results'
                )}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    aria-label="Previous page"
                >
                    <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                    Prev
                </button>

                <span className="min-w-20 text-center text-sm text-gray-600 dark:text-gray-400">
                    Page {current_page} of {last_page}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    aria-label="Next page"
                >
                    Next
                    <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTableInner<T extends Record<string, unknown>>(
    {
        endpoint,
        columns,
        params,
        perPage = 15,
        searchable = false,
        searchPlaceholder = 'Search…',
        emptyMessage = 'No records found.',
        emptyIcon = 'fa-solid fa-inbox',
        className = '',
    }: DataTableProps<T>,
    ref: ForwardedRef<DataTableHandle>,
) {
    const { rows, meta, isLoading, sort, search, setPage, toggleSort, setSearch, reload } =
        useDataTable<T>({ endpoint, params, perPage });

    useImperativeHandle(ref, () => ({ reload }));

    const skeletonCount = Math.min(perPage, 8);

    return (
        <div
            className={`overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800 ${className}`}
        >
            {/* Search toolbar */}
            {searchable && (
                <div className="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
                    <div className="relative max-w-sm">
                        <i
                            className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={[
                                        'px-6 py-3',
                                        col.sortable
                                            ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200'
                                            : '',
                                        col.headerClassName ?? '',
                                    ].join(' ')}
                                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                                >
                                    {col.label}
                                    {col.sortable && (
                                        <SortIcon column={col.key} sort={sort} />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {isLoading ? (
                            Array.from({ length: skeletonCount }).map((_, i) => (
                                <SkeletonRow key={i} columnCount={columns.length} />
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length}>
                                    <div className="py-12 text-center">
                                        <i
                                            className={`${emptyIcon} mb-3 text-4xl text-gray-400 dark:text-gray-500`}
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {emptyMessage}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIndex) => (
                                <tr
                                    key={(row.id as string | number | undefined) ?? rowIndex}
                                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-6 py-4 text-gray-900 dark:text-gray-100 ${col.className ?? ''}`}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : String(row[col.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination — always shown when there is data */}
            {!isLoading && meta.total > 0 && (
                <Pagination meta={meta} onPageChange={setPage} />
            )}
        </div>
    );
}

/**
 * Generic server-driven data table.
 *
 * Fetches rows from `endpoint` with pagination, sorting, and optional search.
 * Use `ref` to imperatively call `reload()` after mutations.
 *
 * @example
 * ```tsx
 * const tableRef = useRef<DataTableHandle>(null);
 *
 * <DataTable<Transaction>
 *   ref={tableRef}
 *   endpoint="/api/transactions"
 *   params={useMemo(() => ({ account_id: id }), [id])}
 *   searchable
 *   columns={[
 *     { key: 'date', label: 'Date', sortable: true },
 *     { key: 'description', label: 'Description', sortable: true },
 *     { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
 *   ]}
 * />
 * ```
 */
export const DataTable = forwardRef(DataTableInner) as <T extends Record<string, unknown>>(
    props: DataTableProps<T> & { ref?: ForwardedRef<DataTableHandle> },
) => ReactElement | null;
