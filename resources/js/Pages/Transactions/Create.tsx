import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

type Props = PageProps<{ accounts: Account[] }>;

interface TransactionForm {
    account_id: string;
    /** Valor em reais (string) — convertido para centavos no submit */
    amount: string;
    description: string;
    date: string;
}

/**
 * Página de criação de transação.
 * O campo amount é inserido em reais e convertido para centavos antes do envio.
 * Submete POST para /transactions.
 */
export default function Create({ accounts }: Props) {
    const { data, setData, transform, post, processing, errors } = useForm<TransactionForm>({
        account_id: accounts[0]?.id ?? '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        transform((d) => ({
            ...d,
            amount: Math.round(parseFloat(d.amount || '0') * 100),
        }));
        post('/transactions');
    }

    return (
        <MainLayout title="Nova Transação">
            <Head title="Nova Transação" />

            <div className="mx-auto max-w-lg">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nova Transação</h2>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Account */}
                        <div>
                            <label
                                htmlFor="account_id"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Conta
                            </label>
                            <select
                                id="account_id"
                                value={data.account_id}
                                onChange={(e) => setData('account_id', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Selecione uma conta</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </select>
                            {errors.account_id && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.account_id}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label
                                htmlFor="amount"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Valor (R$)
                            </label>
                            <input
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                placeholder="0.00"
                            />
                            {errors.amount && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Descrição
                            </label>
                            <input
                                id="description"
                                type="text"
                                required
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                placeholder="ex: Compras no mercado"
                            />
                            {errors.description && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label
                                htmlFor="date"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Data
                            </label>
                            <input
                                id="date"
                                type="date"
                                required
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            {errors.date && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.date}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                            <Link
                                href="/transactions"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                            >
                                {processing && <i className="fa-solid fa-spinner fa-spin" />}
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
