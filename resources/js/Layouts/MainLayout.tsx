import { useState, useRef, useEffect, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

/** Props do MainLayout */
interface Props {
    children: ReactNode;
    /** Título exibido no header */
    title?: string;
}

/** Props da Sidebar */
interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

/**
 * Barra lateral de navegação com suporte a colapso.
 * Salva estado no localStorage e indica o item ativo pela URL atual.
 */
function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const { url, props } = usePage<PageProps>();
    const sidebar = props.sidebar;

    return (
        <aside
            className={`flex shrink-0 flex-col bg-gray-900 text-white transition-all duration-300 dark:bg-gray-950 ${
                collapsed ? 'w-16' : 'w-60'
            }`}
        >
            {/* Logo + botão de colapso */}
            <div className="flex h-16 items-center border-b border-gray-700/50 px-3">
                {!collapsed && (
                    <span className="select-none truncate text-base font-semibold">
                        💰 Finanças
                    </span>
                )}
                <button
                    onClick={onToggle}
                    className={`rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white ${
                        collapsed ? 'mx-auto' : 'ml-auto'
                    }`}
                    aria-label={collapsed ? 'Expandir sidebar' : 'Retrair sidebar'}
                >
                    <i className={`fa-solid text-sm ${collapsed ? 'fa-bars' : 'fa-chevron-left'}`} />
                </button>
            </div>

            {/* Itens de navegação */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {sidebar.map((item) => {
                    const isActive =
                        item.url === '/' ? url === '/' : url.startsWith(item.url);

                    return (
                        <div key={item.url}>
                            <Link
                                href={item.url}
                                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors ${
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <i className={`${item.icon} w-5 shrink-0 text-center text-base`} />
                                <span
                                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                                        collapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>

                            {!collapsed && item.children.length > 0 && (
                                <div className="mt-0.5 space-y-0.5">
                                    {item.children.map((child) => {
                                        const isChildActive = url.startsWith(child.url);
                                        return (
                                            <Link
                                                key={child.url}
                                                href={child.url}
                                                className={`flex items-center gap-2 rounded-lg py-2 pl-8 pr-2 text-sm transition-colors ${
                                                    isChildActive
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                            >
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="overflow-hidden whitespace-nowrap">
                                                    {child.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

/** Props do ProfileWidget */
interface ProfileWidgetProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

/**
 * Widget de perfil com dropdown para logout.
 * Fecha o dropdown ao clicar fora do container.
 */
function ProfileWidget({ user }: ProfileWidgetProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        /** Fecha o dropdown ao clicar fora */
        function handleOutsideClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const initials = user?.name
        ? user.name
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
        : '?';

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Menu do perfil"
                aria-expanded={open}
            >
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 object-cover" />
                ) : (
                    initials
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    role="menu"
                >
                    {user && (
                        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    )}
                    <div className="py-1">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <i className="fa-solid fa-right-from-bracket" />
                            Sair
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Props do Header */
interface HeaderProps {
    title?: string;
}

/**
 * Cabeçalho fixo com título da página, botão de alternância de tema e widget de perfil.
 */
function Header({ title }: HeaderProps) {
    const { props } = usePage<PageProps>();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                {title ?? 'Finanças'}
            </h1>

            <div className="flex items-center gap-3">
                <button
                    onClick={toggleTheme}
                    className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
                >
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                </button>

                <ProfileWidget user={props.auth?.user} />
            </div>
        </header>
    );
}

/**
 * Layout principal da aplicação com sidebar colapsável, header fixo e área de conteúdo.
 *
 * @param children - Conteúdo da página
 * @param title - Título exibido no header
 */
export default function MainLayout({ children, title }: Props) {
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem('sidebar') === 'collapsed',
    );

    function handleToggle() {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('sidebar', next ? 'collapsed' : 'expanded');
            return next;
        });
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Sidebar collapsed={collapsed} onToggle={handleToggle} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

