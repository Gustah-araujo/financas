---
name: database-patterns
description: "Padrões obrigatórios de banco de dados para este projeto. Use quando: criar migrations, definir schemas, adicionar colunas, criar indexes, definir foreign keys, nomear tabelas e colunas. Carregue ANTES de criar qualquer migration."
---

# Database Patterns — Finanças App

## Banco de dados
- Driver: MySQL (produção) / SQLite (desenvolvimento/testes)
- PHP 8.3 / Laravel 13 Migrations

---

## Estrutura obrigatória de toda tabela

Toda tabela deve ter:

```php
$table->uuid('id')->primary();         // UUID como PK (nunca auto-increment)
$table->uuid('workspace_id');          // Escopo do workspace (OBRIGATÓRIO)
$table->timestamps();                  // created_at, updated_at
// $table->softDeletes();              // Adicionar em tabelas com dados financeiros
```

---

## Exemplo completo de migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela de transações financeiras.
     * Armazena débitos, créditos de cartão e transferências.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            // Primary key
            $table->uuid('id')->primary();

            // Escopo obrigatório
            $table->uuid('workspace_id');

            // Foreign keys
            $table->uuid('account_id');
            $table->uuid('category_id')->nullable();
            $table->uuid('parent_id')->nullable();       // Para parcelamentos

            // Dados da transação
            $table->string('description');
            $table->integer('amount');                   // Centavos (nunca decimal/float)
            $table->string('type', 20);                  // debit | credit_card | transfer
            $table->string('status', 20)->default('completed'); // completed | pending

            // Datas
            $table->date('occurred_at');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();
            $table->foreign('account_id')->references('id')->on('accounts')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->foreign('parent_id')->references('id')->on('transactions')->nullOnDelete();

            $table->index(['workspace_id', 'occurred_at']);  // Query mais comum
            $table->index(['workspace_id', 'type']);
            $table->index(['workspace_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
```

---

## Valores monetários

**Regra absoluta: todo valor monetário é `integer` em centavos.**

```php
// CORRETO
$table->integer('amount');          // R$ 150,00 = 15000
$table->integer('balance');         // R$ 1.500,00 = 150000

// ERRADO
$table->decimal('amount', 10, 2);   // nunca float/decimal
$table->float('amount');
```

Motivo: evita problemas de precisão de ponto flutuante em cálculos financeiros.

---

## Naming conventions

| Artefato | Padrão | Exemplo |
|---|---|---|
| Tabela | snake_case, plural | `transactions`, `credit_card_invoices` |
| Coluna | snake_case, singular descritivo | `occurred_at`, `account_id` |
| FK | `{tabela_singular}_id` | `account_id`, `workspace_id` |
| Tabela pivot | alphabético, `_` separado | `workspace_users` |
| Index (simples) | automático pelo Laravel | — |
| Index (composto) | descreva nas queries mais comuns | `[workspace_id, occurred_at]` |

---

## Tipos de coluna por situação

| Dado | Tipo | Observação |
|---|---|---|
| ID | `uuid` | Nunca autoincrement |
| Texto curto (≤255) | `string` | Nome, descrição |
| Texto longo | `text` | Notas, observações |
| Enum fixo | `string` + Rule::in | type, status |
| Valor monetário | `integer` | Centavos |
| Porcentagem | `integer` | Basis points (100 = 1%) |
| Data | `date` | Sem hora: occurred_at, due_date |
| Data+hora | `timestamp` | Com hora: created_at, processed_at |
| Booleano | `boolean` | is_active, is_paid |
| JSON | `json` | Metadados, configs |

---

## Tabelas planejadas por domínio

### Identity & Access
```
workspaces          id, name, created_at, updated_at
workspace_users     workspace_id, user_id, role, joined_at
users               (padrão Laravel)
```

### Banking
```
accounts            id, workspace_id, name, type, balance, created_at, updated_at, deleted_at
```

### Transactions
```
transactions        id, workspace_id, account_id, category_id, parent_id,
                    description, amount, type, status, occurred_at,
                    created_at, updated_at, deleted_at
```

### Credit Card
```
credit_cards        id, workspace_id, name, limit, closing_day, due_day,
                    created_at, updated_at, deleted_at
credit_card_invoices id, workspace_id, credit_card_id, reference_month,
                     total_amount, status, due_date, paid_at,
                     created_at, updated_at
```

### Categorization
```
categories          id, workspace_id (nullable=global), parent_id, name, icon, color,
                    created_at, updated_at, deleted_at
```

---

## Regras de integridade referencial

```php
// workspace deletado → cascade em tudo
$table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();

// account deletada → cascade em transações
$table->foreign('account_id')->references('id')->on('accounts')->cascadeOnDelete();

// category deletada → null na transação (não deletar)
$table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();

// parent deletado → null no filho (parcelamento)
$table->foreign('parent_id')->references('id')->on('transactions')->nullOnDelete();
```

---

## Soft Deletes

Use `softDeletes()` em tabelas com dados financeiros para preservar histórico:
- `transactions`
- `accounts`
- `credit_cards`
- `categories`

**Não** usar soft deletes em:
- `workspace_users` (pivot simples)
- `credit_card_invoices` (dados de referência)

---

## UUIDs

Use `$table->uuid('id')->primary()` em todas as tabelas de negócio.

No Model, adicione o trait:

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasUuids;
    // ...
}
```

O Laravel gerará UUIDs v4 automaticamente ao criar registros.

---

## Index strategy

Crie indexes para queries frequentes:

```php
// Sempre: filtro por workspace + campo de ordenação
$table->index(['workspace_id', 'occurred_at']);

// Para buscas por status dentro do workspace
$table->index(['workspace_id', 'status']);

// Para faturas por cartão
$table->index(['credit_card_id', 'reference_month']);
```

Regra: todo `WHERE` frequente sem FK deve ter index.
