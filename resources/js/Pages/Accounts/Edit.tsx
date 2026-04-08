import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

type Props = PageProps<{ account: Account }>;

interface AccountForm {
    name: string;
    type: Account['type'];
}

/**
 * Página de edição de conta bancária.
 * Pré-popula o formulário com os dados existentes e submete PUT para /accounts/{id}.
 */
export default function Edit({ account }: Props) {
    const { data, setData, put, processing, errors } = useForm<AccountForm>({
        name: account.name,
        type: account.type,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/accounts/${account.id}`);
    }

    return (
        <MainLayout title="Edit Account">
            <Head title="Edit Account" />

            <div className="mx-auto max-w-lg">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Account</h2>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                            )}
                        </div>

                        {/* Type */}
                        <div>
                            <label
                                htmlFor="type"
                                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Type
                            </label>
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as Account['type'])}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="checking">Checking</option>
                                <option value="savings">Savings</option>
                                <option value="cash">Cash</option>
                            </select>
                            {errors.type && (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.type}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                            <Link
                                href="/accounts"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
                            >
                                {processing && <i className="fa-solid fa-spinner fa-spin" />}
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
