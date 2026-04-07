import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { FormEvent } from 'react';

/** Campos do formulário de registro */
interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

/**
 * Página de registro.
 * Layout inline sem MainLayout — tela cheia centralizada.
 */
export default function Register() {
    const { data, setData, post, processing, errors } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/register');
    }

    return (
        <AuthLayout title="Criar sua conta">
            <Head title="Criar conta" />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Nome
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                placeholder="Seu nome"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                placeholder="voce@exemplo.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                placeholder="Mínimo 8 caracteres"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirmação de senha */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Confirmar Senha
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                placeholder="Repita a senha"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Botão submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </form>

                    {/* Link para login */}
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Já tem uma conta?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Entrar
                        </Link>
                    </p>
        </AuthLayout>
    );
}
