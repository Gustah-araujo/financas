---
name: react-patterns
description: "Padrões obrigatórios de código React/TypeScript para este projeto. Use quando: criar pages, componentes, hooks, layouts, types, utils. Contém exemplos concretos de Inertia.js, Tailwind CSS, TypeScript e estrutura de arquivos. Carregue ANTES de implementar qualquer arquivo TSX/TS."
---

# React Patterns — Finanças App

## Stack
- React 19, TypeScript 5, Inertia.js 2, Tailwind CSS 4
- Font Awesome Free (ícones)

---

## Estrutura de pastas

```
resources/js/
├── Pages/
│   ├── Dashboard.tsx
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── Transactions/
│       ├── Index.tsx
│       ├── Create.tsx
│       └── Edit.tsx
├── Components/
│   ├── ui/                    # Componentes genéricos reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   └── Transactions/          # Componentes específicos de domínio
│       └── TransactionRow.tsx
├── Hooks/
│   └── useTransactions.ts
├── Layouts/
│   └── MainLayout.tsx
├── Types/
│   └── index.ts               # Types e interfaces globais
└── lib/
    └── formatters.ts          # Utilitários puros
```

---

## TypeScript: Definição de tipos globais

```typescript
// resources/js/Types/index.ts

/** Usuário autenticado */
export interface User {
    id: string;
    name: string;
    email: string;
}

/** Props padrão compartilhadas via HandleInertiaRequests */
export interface PageProps {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

// Types por domínio (adicione conforme necessário)
export interface Transaction {
    id: string;
    description: string;
    amount: number;       // centavos (int)
    type: 'debit' | 'credit_card' | 'transfer';
    status: 'completed' | 'pending';
    occurred_at: string;  // 'YYYY-MM-DD'
    account?: Account;
    category?: Category;
}

export interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'wallet' | 'investment';
    balance: number;      // centavos (int)
}
```

**Regras:**
- Types em PascalCase, propriedades em camelCase
- Monetary values são `number` (int em centavos) — formatar somente na exibição
- Datas são `string` no formato `'YYYY-MM-DD'` ou ISO
- Relacionamentos opcionais com `?` (podem não vir carregados)

---

## Page Component

```typescript
// resources/js/Pages/Transactions/Index.tsx
import { Head } from '@inertiajs/react';
import { PageProps, Transaction } from '@/Types';
import MainLayout from '@/Layouts/MainLayout';
import { TransactionRow } from '@/Components/Transactions/TransactionRow';
import { Button } from '@/Components/ui/Button';
import { Link } from '@inertiajs/react';

/** Props passadas pelo TransactionController via Inertia */
interface TransactionsIndexProps extends PageProps {
    transactions: {
        data: Transaction[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
}

export default function Index({ transactions }: TransactionsIndexProps) {
    return (
        <MainLayout>
            <Head title="Transações" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Transações</h1>
                    <Link href={route('transactions.create')}>
                        <Button>Nova Transação</Button>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    {transactions.data.map((transaction) => (
                        <TransactionRow key={transaction.id} transaction={transaction} />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
```

**Regras:**
- `export default` para todas as Pages
- Props interface separada, nomeada `{NomeDaPágina}Props`
- Sempre use `<Head title="..." />` para o título
- Nunca use `<a href>` — sempre `<Link>` do Inertia

---

## Form com Inertia useForm

```typescript
// resources/js/Pages/Transactions/Create.tsx
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface CreateTransactionForm {
    description: string;
    amount: string;     // string no form, converta antes de submeter
    type: 'debit' | 'credit_card' | 'transfer';
    account_id: string;
    occurred_at: string;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<CreateTransactionForm>({
        description: '',
        amount: '',
        type: 'debit',
        account_id: '',
        occurred_at: new Date().toISOString().split('T')[0],
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('transactions.store'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                </label>
                <input
                    id="description"
                    type="text"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
            </div>

            <button type="submit" disabled={processing}>
                Salvar
            </button>
        </form>
    );
}
```

**Regras:**
- Use sempre `useForm` do Inertia para formulários com submit ao backend
- Nunca use `axios.post()` ou `fetch()` para submeter formulários
- Exiba `errors.{campo}` abaixo de cada input
- `processing` desabilita o botão durante o envio

---

## Componente UI genérico

```typescript
// resources/js/Components/ui/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/** Props do componente Button */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variante visual do botão */
    variant?: Variant;
    /** Tamanho do botão */
    size?: Size;
    children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeClasses: Record<Size, string> = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-4 py-2 text-sm',
    lg:  'px-6 py-3 text-base',
};

/**
 * Botão reutilizável com variantes e tamanhos.
 */
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
```

**Regras:**
- `export named` para componentes ui/
- Sempre `extends HTML*Attributes` para componentes de formulário — assim `onClick`, `disabled`, etc. funcionam automaticamente
- Use `Record<Variant, string>` para mapear variantes a classes

---

## Custom Hook

```typescript
// resources/js/Hooks/useFormatters.ts

/**
 * Formata um valor em centavos para exibição em BRL.
 *
 * @param cents - Valor em centavos
 * @returns String formatada (ex: "R$ 1.500,00")
 */
export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

/**
 * Formata uma data ISO para exibição localizada.
 *
 * @param date - String no formato 'YYYY-MM-DD'
 * @returns String formatada (ex: "06/04/2026")
 */
export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date + 'T00:00:00'));
}
```

**Regras:**
- Utilitários puros (sem hooks) ficam em `lib/`
- Custom hooks com estado/efeitos ficam em `Hooks/` com prefixo `use`
- JSDoc em todos os exports públicos

---

## Tailwind CSS: Padrões visuais

```typescript
// Padrões de layout
const pageWrapper = 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8';
const pageHeader  = 'mb-6 flex items-center justify-between';
const card        = 'overflow-hidden rounded-lg bg-white shadow';
const cardBody    = 'p-6';

// Padrões de formulário
const label       = 'block text-sm font-medium text-gray-700';
const input       = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
const inputError  = 'border-red-300 focus:border-red-500 focus:ring-red-500';
const errorText   = 'mt-1 text-sm text-red-600';
const formGroup   = 'space-y-4';

// Padrões de tabela
const table       = 'min-w-full divide-y divide-gray-200';
const tableHeader = 'bg-gray-50';
const tableRow    = 'hover:bg-gray-50 transition-colors';
const tableCell   = 'px-6 py-4 text-sm text-gray-900';
```

**Regras:**
- Cor primária: `indigo-*`
- Cor de perigo/erro: `red-*`
- Cor de sucesso: `green-*`
- Cor de aviso: `yellow-*`
- Textos: `gray-900` (primário), `gray-600` (secundário), `gray-400` (placeholder)
- Fundo da página: `gray-100`
- Cards: `bg-white shadow`

---

## Convenções de naming

| Artefato | Padrão | Exemplo |
|---|---|---|
| Page | PascalCase | `TransactionsIndex` |
| Componente UI | PascalCase | `Button`, `InputField` |
| Componente domínio | PascalCase | `TransactionRow` |
| Custom hook | camelCase + `use` | `useTransactionForm` |
| Type/Interface | PascalCase | `Transaction`, `PageProps` |
| Arquivo Page | PascalCase | `Index.tsx`, `Create.tsx` |
| Arquivo componente | PascalCase = componente | `Button.tsx` |
| Arquivo util | camelCase | `formatters.ts` |

---

## Inertia.js: Referência rápida

```typescript
import { usePage, useForm, router, Link, Head } from '@inertiajs/react';

// Acessar props da página
const { auth, flash } = usePage<PageProps>().props;

// Navegar programaticamente
router.visit(route('transactions.index'));
router.get(route('transactions.show', { transaction: id }));

// Deletar com method spoofing
router.delete(route('transactions.destroy', { transaction: id }), {
    onSuccess: () => { /* feedback */ },
});
```
