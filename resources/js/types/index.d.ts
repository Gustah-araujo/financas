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
        flash?: {
            success?: string;
            error?: string;
        };
    };

    /** Conta bancária pertencente a um workspace */
    interface Account {
        id: string;
        name: string;
        type: 'checking' | 'savings' | 'cash';
        /** Saldo em centavos (integer) */
        balance: number;
    }

    /** Transação financeira pertencente a um workspace */
    interface Transaction {
        id: string;
        workspace_id: string;
        account_id: string;
        type: 'debit' | 'credit_card' | 'transfer';
        /** Valor em centavos (integer) */
        amount: number;
        description: string;
        /** Data no formato Y-m-d */
        date: string;
        status: 'confirmed' | 'pending';
        account?: Account;
    }
}
