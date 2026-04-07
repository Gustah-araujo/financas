# Copilot Instructions — App de Controle Financeiro (Laravel + React, DDD)

## 📌 Contexto

Este projeto é um **sistema de controle financeiro colaborativo**, onde múltiplos usuários compartilham e gerenciam finanças dentro de um mesmo espaço.

Stack:
- Backend: Laravel (API)
- Frontend: React

Arquitetura esperada:
- Domain-Driven Design (DDD)
- Separação clara entre regras de negócio e infraestrutura

---

# 🧠 Visão Geral de Domínio

O sistema gira em torno de um conceito central:

## 🏢 Workspace

Um **Workspace** representa um ambiente financeiro compartilhado (ex: casal).

### Regras:
- Todos os dados pertencem a um workspace
- Usuários acessam dados através do workspace
- Nenhuma entidade financeira pertence diretamente ao usuário

> 🚨 Sempre filtrar por `workspace_id`

---

# 🧱 Bounded Contexts

O sistema deve ser dividido nos seguintes contextos:

---

## 👥 Identity & Access

Responsável por usuários e permissões.

### Entidades:
- User
- Workspace
- WorkspaceUser (pivot)

### Regras:
- Usuário pode participar de múltiplos workspaces
- Workspace possui múltiplos usuários
- Controle de acesso baseado em membership

---

## 💰 Banking

Responsável por contas e saldo.

### Entidades:
- Account

### Regras:
- Conta pertence a um workspace
- Saldo (`balance`) é armazenado (cacheado)
- Saldo é atualizado incrementalmente (não recalcular sempre)

---

## 💸 Transactions

Responsável por movimentações financeiras.

### Entidades:
- Transaction

### Tipos:
- `debit`
- `credit_card`
- `transfer`

### Regras:
- Toda transação pertence a um workspace
- Transações de débito afetam saldo imediatamente
- Transações de crédito NÃO afetam saldo imediatamente
- Transferências geram duas transações

---

## 💳 Credit Card

Responsável por cartões e faturas.

### Entidades:
- CreditCard
- CreditCardInvoice

### Regras:
- Transações de crédito pertencem a uma fatura
- Faturas são mensais
- Pagamento da fatura gera uma transação de débito
- Fatura é paga integralmente

---

## 📆 Planning

Responsável por planejamento financeiro.

### Entidades:
- Transaction (reutilizada com regras específicas)

### Regras:
- Transações futuras possuem `status = pending`
- Não impactam saldo (ou impactam opcionalmente via projeção)
- Devem ser consideradas em relatórios futuros

---

## 🧩 Installments

Responsável por parcelamentos.

### Entidades:
- Transaction (com `parent_id`)

### Regras:
- Parcelamento gera múltiplas transações
- Todas vinculadas a uma transação "pai"
- Cada parcela é independente

---

## 🔄 Transfers

Responsável por movimentação entre contas.

### Regras:
- Sempre criar duas transações:
  - Débito na conta origem
  - Crédito na conta destino
- Devem estar vinculadas logicamente (ex: `transfer_id`)

---

## 🏷️ Categorization

Responsável por categorização.

### Entidades:
- Category

### Regras:
- Categoria pode ser global ou por workspace
- Pode ter hierarquia (`parent_id`)
- Transações podem ou não ter categoria

---

## 📊 Reporting

Responsável por relatórios e análises.

### Exemplos:
- Gastos por categoria
- Gastos mensais
- Evolução de saldo

### Regras:
- Sempre escopado por workspace
- Pode usar projections/read models

---

## 🤖 Insights (AI)

Responsável por inteligência e automações.

### Integrações possíveis:
- OpenAI
- Anthropic

### Funcionalidades:
- Categorização automática
- Insights financeiros

### Regras:
- Nunca bloquear fluxo principal
- Executar via jobs assíncronos
- Sempre permitir override manual

---

# 🧠 Camadas (DDD)

Organize o código em:

## 1. Domain
- Entidades
- Value Objects
- Regras de negócio puras

## 2. Application
- Use Cases (Actions / Services)
- Orquestração

## 3. Infrastructure
- Eloquent Models
- Repositórios
- APIs externas

## 4. Interface
- Controllers
- Requests
- Resources

---

# 📦 Estrutura sugerida


app/
├── Domain/
│ ├── Banking/
│ ├── Transactions/
│ ├── CreditCard/
│ ├── Identity/
│ └── ...
│
├── Application/
│ ├── Actions/
│ ├── DTOs/
│ └── Services/
│
├── Infrastructure/
│ ├── Persistence/
│ ├── Integrations/
│ └── Jobs/
│
└── Interfaces/
├── Http/
└── API/


---

# ⚠️ Regras Críticas

- Sempre filtrar por `workspace_id`
- Nunca misturar lógica de crédito com débito
- Não recalcular saldo globalmente
- Transferências devem sempre gerar duas transações
- Cartão de crédito só impacta saldo no pagamento da fatura

---

# 🧭 Ordem de Desenvolvimento

Seguir estritamente:

1. Auth
2. Workspace (multi-usuário)
3. Accounts
4. Transactions (debit)
5. Balance
6. Credit Card
7. Invoices
8. Installments
9. Transfers
10. Future Transactions
11. Categories
12. Reports
13. AI

---

# 🎯 Objetivo

Construir um sistema onde:

> Múltiplos usuários consigam gerenciar finanças de forma colaborativa, consistente e escalável.

---