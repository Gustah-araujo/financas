---
name: domain-modeling
description: "Padrões de Domain-Driven Design para este projeto. Use quando: criar novos domínios, estruturar features, decidir onde colocar lógica de negócio, definir responsabilidades de camadas, mapear bounded contexts. Carregue ao iniciar uma feature nova ou ao ter dúvida sobre organização de código."
---

# Domain Modeling — Finanças App

## Arquitetura: DDD Simplificado

O projeto usa DDD pragmático — sem CQRS nem Event Sourcing. Foco em separação de responsabilidades clara.

---

## As 4 camadas

```
┌─────────────────────────────────────────────┐
│              Interface Layer                │  Controllers, Form Requests, Resources
│         (app/Http/)                         │  Recebe HTTP, devolve Inertia/Redirect
├─────────────────────────────────────────────┤
│            Application Layer               │  Services, Jobs
│         (app/Services/)                    │  Orquestra casos de uso
├─────────────────────────────────────────────┤
│              Domain Layer                  │  Models, Events, Value Objects, Enums
│         (app/Models/)                      │  Regras de negócio puras
├─────────────────────────────────────────────┤
│          Infrastructure Layer              │  Repositories, Jobs de fila, APIs externas
│    (app/Repositories/, app/Jobs/)          │  Acesso a dados e sistemas externos
└─────────────────────────────────────────────┘
```

### Fluxo de uma requisição

```
HTTP Request
    │
    ▼
[Controller]        ← valida via Form Request, chama Service
    │
    ▼
[Service]           ← orquestra: chama Repository, dispara Events
    │
    ▼
[Repository]        ← acessa banco via Eloquent
    │
    ▼
[Model]             ← define estrutura e relacionamentos
    │
    ▼
HTTP Response       ← Inertia::render() via API Resource
```

---

## Bounded Contexts

### 1. Identity & Access

**Responsabilidade:** Autenticação, workspaces e memberships.

```
app/
├── Models/
│   ├── User.php
│   ├── Workspace.php
│   └── WorkspaceUser.php
├── Services/
│   └── WorkspaceService.php
└── Http/
    ├── Controllers/
    │   ├── Auth/
    │   └── WorkspaceController.php
    └── Resources/
        └── WorkspaceResource.php
```

**Regras:**
- User não tem dados financeiros — só pertence a Workspaces
- Workspace é o agregado raiz do sistema

---

### 2. Banking

**Responsabilidade:** Contas bancárias e saldos.

```
app/
├── Models/Account.php
├── Services/AccountService.php
├── Repositories/
│   ├── Contracts/AccountRepositoryInterface.php
│   └── Eloquent/EloquentAccountRepository.php
└── Http/
    ├── Controllers/AccountController.php
    ├── Requests/
    │   ├── StoreAccountRequest.php
    │   └── UpdateAccountRequest.php
    └── Resources/AccountResource.php
```

**Regras:**
- Saldo (`balance`) é armazenado em centavos
- **Nunca recalcule** o saldo — atualize incrementalmente
- `AccountService::incrementBalance()` e `decrementBalance()` são os únicos pontos de modificação de saldo

---

### 3. Transactions

**Responsabilidade:** Movimentações financeiras.

```
app/
├── Models/Transaction.php
├── Services/TransactionService.php
├── Events/
│   ├── TransactionCreated.php
│   └── TransactionDeleted.php
├── Listeners/
│   └── UpdateAccountBalanceOnTransaction.php
└── Http/
    ├── Controllers/TransactionController.php
    └── Resources/TransactionResource.php
```

**Regras de tipo:**
- `debit` → debita conta imediatamente (via evento)
- `credit_card` → não afeta conta, fica na fatura
- `transfer` → gera DUAS transações (débito + crédito)

**Regras de status:**
- `completed` → transação efetivada
- `pending` → agendada (não afeta saldo ainda)

---

### 4. Credit Card

**Responsabilidade:** Cartões e faturas.

```
app/
├── Models/
│   ├── CreditCard.php
│   └── CreditCardInvoice.php
├── Services/
│   ├── CreditCardService.php
│   └── InvoiceService.php
└── Http/
    ├── Controllers/
    │   ├── CreditCardController.php
    │   └── CreditCardInvoiceController.php
    └── Resources/
        ├── CreditCardResource.php
        └── CreditCardInvoiceResource.php
```

**Regras:**
- Cada transação `credit_card` pertence a uma `CreditCardInvoice`
- Fechamento da fatura: baseado em `closing_day` do cartão
- Pagamento da fatura → cria uma `transaction` de débito na conta escolhida

---

### 5. Categorization

**Responsabilidade:** Categorias de transações.

```
app/
├── Models/Category.php
├── Services/CategoryService.php
└── Http/
    ├── Controllers/CategoryController.php
    └── Resources/CategoryResource.php
```

**Regras:**
- `workspace_id = null` → categoria global (padrão do sistema)
- `workspace_id = X` → categoria do workspace
- `parent_id` → hierarquia (ex: "Alimentação > Restaurante")

---

## Quando usar o quê

### Events vs Direct Call

```
┌──────────────────────────────────────────────────────┐
│ Use EVENTO quando:                                   │
│  - Efeito colateral pode falhar sem afetar operação  │
│  - Múltiplos listeners precisam reagir               │
│  - Efeito é assíncrono (via queue)                   │
│                                                      │
│ Use CHAMADA DIRETA quando:                           │
│  - Efeito é obrigatório para consistência            │
│  - Resultado é necessário para continuar             │
└──────────────────────────────────────────────────────┘
```

**Exemplo:**
- Atualizar saldo ao criar transação → **evento** (falha de atualização não deve reverter a transação)
- Criar duas transações ao fazer transferência → **chamada direta** (são atomicamente dependentes)

---

### Jobs vs Synchronous

```
┌──────────────────────────────────────────────────────┐
│ Use JOB (queue) quando:                              │
│  - Operação demora mais de 500ms                     │
│  - Depende de API externa (AI, email, etc.)          │
│  - Pode ser retentada sem efeito colateral duplo     │
│                                                      │
│ Use SÍNCRONO quando:                                 │
│  - Operação é rápida e crítica                       │
│  - Resultado deve ser apresentado na mesma request   │
└──────────────────────────────────────────────────────┘
```

---

## Regras globais de domínio

### workspace_id é lei
Toda query de dados financeiros DEVE ser filtrada por `workspace_id`. Não há exceção.

```php
// SEMPRE assim:
Transaction::where('workspace_id', $workspaceId)->...

// NUNCA:
Transaction::all()
Transaction::find($id)
```

### Dinheiro em centavos
- Backend: armazena e processa em centavos (int)
- Frontend: formata para exibição com `formatCurrency(cents)`
- Transferências de valores no form: o frontend converte `"150,00"` → `15000` antes de enviar

### Datas sem hora
- `occurred_at` é `date`, não `datetime` — transações não têm hora de ocorrência relevante
- `created_at` / `updated_at` são `timestamp` — registro de auditoria

### Soft delete para dados financeiros
Dados financeiros nunca são deletados fisicamente — sempre soft delete. Isso garante auditoria e integridade referencial.

---

## Ordem de implementação (conforme copilot-instructions.md)

1. Auth (login, registro)
2. Workspace (criação, membership)
3. Accounts (contas bancárias)
4. Transactions — debit
5. Balance (atualização incremental)
6. Credit Card
7. Invoices
8. Installments
9. Transfers
10. Future Transactions (status: pending)
11. Categories
12. Reports
13. AI Insights

**Não pule etapas.** Cada contexto depende do anterior.
