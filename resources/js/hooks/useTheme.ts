import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

/**
 * Lê o tema inicial do localStorage ou detecta a preferência do sistema.
 * Usada como initializer function do useState para evitar leituras em cada render.
 *
 * @returns Tema inicial ('light' | 'dark')
 */
function getInitialTheme(): Theme {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Hook para gerenciar o tema (claro/escuro) da aplicação.
 *
 * - Persiste a preferência no localStorage (chave `theme`)
 * - Detecta preferência do sistema como fallback
 * - Adiciona/remove a classe `dark` no `document.documentElement`
 *
 * @returns `{ theme, toggleTheme }` — tema atual e função para alternar
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    /** Alterna entre tema claro e escuro. */
    function toggleTheme() {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }

    return { theme, toggleTheme };
}
