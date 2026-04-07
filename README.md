# Finanças

Aplicação de controle financeiro pessoal construída com **Laravel**, **Inertia.js** e **React + TypeScript**.

## Stack

- **Backend**: [Laravel 13](https://laravel.com/)
- **Frontend Bridge**: [Inertia.js](https://inertiajs.com/)
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **CSS**: [Tailwind CSS 4](https://tailwindcss.com/)

## Requisitos

- PHP ^8.3
- Composer
- Node.js ^18
- npm

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/Gustah-araujo/financas.git
cd financas

# 2. Instale as dependências PHP
composer install

# 3. Configure o ambiente
cp .env.example .env
php artisan key:generate

# 4. Configure o banco de dados (SQLite por padrão)
touch database/database.sqlite
php artisan migrate

# 5. Instale as dependências Node.js
npm install

# 6. Compile os assets
npm run build
# ou em modo de desenvolvimento:
npm run dev
```

## Desenvolvimento

```bash
# Iniciar todos os serviços em paralelo (servidor, fila, logs, vite)
composer run dev
```

Ou individualmente:

```bash
# Terminal 1 - Servidor Laravel
php artisan serve

# Terminal 2 - Vite (React/TypeScript)
npm run dev
```

## Testes

```bash
composer run test
```

## Estrutura do Frontend

```
resources/js/
├── app.tsx          # Entry point com Inertia + React
├── Pages/           # Páginas Inertia (um componente por rota)
│   └── Dashboard.tsx
├── Layouts/         # Layouts reutilizáveis
│   └── MainLayout.tsx
└── Components/      # Componentes compartilhados
```
