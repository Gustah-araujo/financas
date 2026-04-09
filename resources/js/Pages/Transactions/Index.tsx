import { useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { DataTable, DataTableHandle, Column } from '@/Components/ui/DataTable';

type Props = PageProps;
type TransactionRow = Transaction & Record<string, unknown>;

/** Formata um valor em centavos para o padrão BRL (ex: 10000 → R$ 100,00) */
function formatBalance(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

/** Formata uma data no formato Y-m-d para pt-BR (ex: 2026-04-08 → 08/04/2026) */
function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Página de listagem de transações.
 * Dados carregados via DataTable (GET /api/transactions).
 */
export default function Index() {
    const tableRef = useRef<DataTableHandle>(null);

    /** Exclui uma transação após confirmação do usuário e recarrega a tabela */
    function handleDelete(id: string, description: string) {
        window.Notifications.alert({
            title: 'Excluir transação?',
            description: `A transação "${description}" será removida permanentemente.`,
            icon: 'warning',
            confirmLabel: 'Excluir',
            cancelLabel: 'Cancelar',
            onConfirm: () => {
                router.delete(`/transactions/${id}`, {
                    onSuccess: () => tableRef.current?.reload(),
                });
            },
        });
    }

    const columns: Column<TransactionRow>[] = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {formatDate(row.date as string)}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            sortable: true,
            render: (row) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {row.description as string}
                </span>
            ),
        },
        {
            key: 'account',
            label: 'Account',
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {(row.account as Transaction['account'])?.name ?? '-'}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            className: 'text-right font-mono',
            headerClassName: 'text-right',
            render: (row) => (
                <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatBalance(row.amount as number)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (row) =>
                row.status === 'confirmed' ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Confirmed
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                        Pending
                    </span>
                ),
        },
        {
            key: 'actions',
            label: '',
            headerClassName: 'w-px',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/transactions/${row.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                    >
                        <i className="fa-solid fa-pen-to-square" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id as string, row.description as string)}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <i className="fa-solid fa-trash" />
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout title="Transactions">
            <Head title="Transactions" />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Transactions</h2>
                    <Link
                        href="/transactions/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <i className="fa-solid fa-plus" />
                        New Transaction
                    </Link>
                </div>

                <DataTable<TransactionRow>
                    ref={tableRef}
                    endpoint="/api/transactions"
                    columns={columns}
                    searchable
                    searchPlaceholder="Search transactions…"
                    emptyMessage="No transactions yet."
                    emptyIcon="fa-solid fa-receipt"
                />
            </div>
        </MainLayout>
    );
}
