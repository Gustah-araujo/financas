import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title: string;
}

/**
 * Layout para páginas de autenticação (login, registro).
 * Usa a mesma paleta de cores do MainLayout:
 *  - Fundo: bg-gray-100 / dark:bg-gray-900
 *  - Card: bg-white / dark:bg-gray-800 (mesma cor do header)
 */
export default function AuthLayout({ children, title }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {/* Logo */}
                <div className="mb-6 text-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        💰 Finanças
                    </span>
                    <h1 className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
                        {title}
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
