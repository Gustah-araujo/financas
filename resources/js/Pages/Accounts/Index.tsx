import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

type Props = PageProps<{ accounts: Account[] }>;

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
 * Exibe tabela com nome, tipo e saldo, além de ações de editar e excluir.
 */
export default function Index({ accounts }: Props) {
    /** Exclui uma conta após confirmação do usuário */
    function handleDelete(id: string, name: string) {
        if (!confirm(`Delete account "${name}"? This action cannot be undone.`)) {
            return;
        }
        router.delete(`/accounts/${id}`);
    }

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

                {/* Table / Empty state */}
                {accounts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
                        <i className="fa-solid fa-piggy-bank mb-3 text-4xl text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No accounts yet. Create your first account.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {accounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {account.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {typeLabels[account.type]}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-900 dark:text-white">
                                            {formatBalance(account.balance)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/accounts/${account.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                >
                                                    <i className="fa-solid fa-pen-to-square" />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(account.id, account.name)}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                >
                                                    <i className="fa-solid fa-trash" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
