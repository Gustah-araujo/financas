import { useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { DataTable, DataTableHandle, Column } from '@/Components/ui/DataTable';
import { formatCurrency, formatDate } from '@/utils/formatting';

type Props = PageProps;
type TransactionRow = Transaction & Record<string, unknown>;

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
            label: 'Data',
            sortable: true,
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {formatDate(row.date as string)}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Descrição',
            sortable: true,
            render: (row) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {row.description as string}
                </span>
            ),
        },
        {
            key: 'account',
            label: 'Conta',
            render: (row) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {(row.account as Transaction['account'])?.name ?? '-'}
                </span>
            ),
        },
        {
            key: 'amount',
            label: 'Valor',
            sortable: true,
            className: 'text-right font-mono',
            headerClassName: 'text-right',
            render: (row) => (
                <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(row.amount as number)}
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
                        Confirmado
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                        Pendente
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
                        Editar
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id as string, row.description as string)}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                        <i className="fa-solid fa-trash" />
                        Excluir
                    </button>
                </div>
            ),
        },
    ];

    return (
        <MainLayout title="Transações">
            <Head title="Transações" />

            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Transações</h2>
                    <Link
                        href="/transactions/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <i className="fa-solid fa-plus" />
                        Nova Transação
                    </Link>
                </div>

                <DataTable<TransactionRow>
                    ref={tableRef}
                    endpoint="/api/transactions"
                    columns={columns}
                    searchable
                    searchPlaceholder="Buscar transações…"
                    emptyMessage="Nenhuma transação cadastrada."
                    emptyIcon="fa-solid fa-receipt"
                />
            </div>
        </MainLayout>
    );
}
