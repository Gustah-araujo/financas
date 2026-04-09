import { useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { DataTable, DataTableHandle, Column } from '@/Components/ui/DataTable';

type Props = PageProps;
type AccountRow = Account & Record<string, unknown>;

/** Formata um valor em centavos para o padrão BRL (ex: 10000 → R$ 100,00) */
function formatBalance(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

/** Labels legíveis para cada tipo de conta */
const typeLabels: Record<Account['type'], string> = {
    checking: 'Checking',
    savings: 'Savings',
    cash: 'Cash',
};

/**
 * Página de listagem de contas bancárias.
 * Dados carregados via DataTable (GET /api/accounts).
 */
export default function Index() {
    const tableRef = useRef<DataTableHandle>(null);

    /** Exclui uma conta após confirmação do usuário e recarrega a tabela */
    function handleDelete(id: string, name: string) {
        window.Notifications.alert({
            title: 'Excluir conta?',
            description: `A conta "${name}" será removida permanentemente.`,
            icon: 'warning',
            confirmLabel: 'Excluir',
            cancelLabel: 'Cancelar',
            onConfirm: () => {
                router.delete(`/accounts/${id}`, {
                    onSuccess: () => tableRef.current?.reload(),
                });
            },
        });
    }

    const columns: Column<AccountRow>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (row) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {row.name as string}
                </span>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (row) => typeLabels[row.type as Account['type']] ?? String(row.type),
        },
        {
            key: 'balance',
            label: 'Balance',
            sortable: true,
            className: 'text-right font-mono',
            headerClassName: 'text-right',
            render: (row) => formatBalance(row.balance as number),
        },
        {
            key: 'actions',
            label: '',
            headerClassName: 'w-px',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/accounts/${row.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                    >
                        <i className="fa-solid fa-pen-to-square" />
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id as string, row.name as string)}
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
        <MainLayout title="Accounts">
            <Head title="Accounts" />

            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Accounts</h2>
                    <Link
                        href="/accounts/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <i className="fa-solid fa-plus" />
                        New Account
                    </Link>
                </div>

                <DataTable<AccountRow>
                    ref={tableRef}
                    endpoint="/api/accounts"
                    columns={columns}
                    searchable
                    searchPlaceholder="Search accounts…"
                    emptyMessage="No accounts yet. Create your first account."
                    emptyIcon="fa-solid fa-piggy-bank"
                />
            </div>
        </MainLayout>
    );
}
