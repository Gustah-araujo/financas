import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

type Props = PageProps<{ transactions: Transaction[]; accounts: Account[] }>;

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
 * Exibe tabela com data, descrição, conta, valor, status e ações de editar e excluir.
 */
export default function Index({ transactions }: Props) {
    const { flash } = usePage<Props>().props;

    /** Exclui uma transação após confirmação do usuário */
    function handleDelete(id: string, description: string) {
        if (!confirm(`Delete transaction "${description}"? This action cannot be undone.`)) {
            return;
        }
        router.delete(`/transactions/${id}`);
    }

    return (
        <MainLayout title="Transactions">
            <Head title="Transactions" />

            <div className="mx-auto max-w-5xl">
                {/* Flash message */}
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <i className="fa-solid fa-circle-check mr-2" />
                        {flash.success}
                    </div>
                )}

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

                {/* Table / Empty state */}
                {transactions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
                        <i className="fa-solid fa-receipt mb-3 text-4xl text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No transactions yet. Create your first transaction.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Account</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    >
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {formatDate(transaction.date)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {transaction.account?.name ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-red-600 dark:text-red-400">
                                            -{formatBalance(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {transaction.status === 'confirmed' ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Confirmed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/transactions/${transaction.id}/edit`}
                                                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                >
                                                    <i className="fa-solid fa-pen-to-square" />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(transaction.id, transaction.description)}
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
