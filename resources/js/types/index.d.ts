import axios from 'axios';

declare global {
    interface Window {
        axios: typeof axios;
    }

    /** Sub-item de navegação da sidebar (sem ícone) */
    interface SidebarSubItem {
        label: string;
        url: string;
    }

    /** Item principal de navegação da sidebar */
    interface SidebarItem {
        icon: string;
        label: string;
        url: string;
        children: SidebarSubItem[];
    }

    /**
     * Props padrão compartilhadas via HandleInertiaRequests.
     * Pode ser extendido com props específicas de cada página.
     */
    type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
        auth: {
            user?: {
                name: string;
                email: string;
                avatar?: string;
            };
        };
        sidebar: SidebarItem[];
    };
}
