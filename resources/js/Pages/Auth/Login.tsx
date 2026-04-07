import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import { FormEvent } from 'react';

/** Campos do formulário de login */
interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

/**
 * Página de login.
 * Layout inline sem MainLayout — tela cheia centralizada.
 */
export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/login', {
            onError: () => reset('password'),
        });
    }

    return (
        <AuthLayout title="Entrar na sua conta">
            <Head title="Entrar" />

                    {/* Erro geral de credenciais */}
                    {errors.email && (
                        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                            {errors.email}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                autoComplete="current-password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Lembrar de mim */}
                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                            />
                            <label
                                htmlFor="remember"
                                className="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Lembrar de mim
                            </label>
                        </div>

                        {/* Botão submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Link para registro */}
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Não tem uma conta?{' '}
                        <Link
                            href="/register"
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Criar conta
                        </Link>
                    </p>
        </AuthLayout>
    );
}
