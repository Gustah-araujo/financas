---
name: laravel-patterns
description: "Padrões obrigatórios de código Laravel para este projeto. Use quando: criar controllers, services, repositories, models, form requests, API resources, policies, jobs, events, migrations, rotas. Contém exemplos concretos e regras de naming. Carregue ANTES de implementar qualquer arquivo PHP."
---

# Laravel Patterns — Finanças App

## Stack
- PHP 8.3+, Laravel 13, Inertia.js 2, MySQL/SQLite
- Pint (code style), PHPUnit 11

---

## Estrutura de pastas

```
app/
├── Http/
│   ├── Controllers/          # Um controller por recurso
│   ├── Requests/             # Form Requests (validação)
│   ├── Resources/            # API Resources (serialização)
│   └── Middleware/
├── Services/                 # Lógica de negócio
├── Repositories/
│   ├── Contracts/            # Interfaces
│   └── Eloquent/             # Implementações concretas
├── Models/                   # Eloquent Models
├── Policies/                 # Autorização
├── Events/
├── Listeners/
└── Jobs/
```

---

## Controller

```php
/**
 * Gerencia as operações CRUD de transações.
 */
class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactionService,
    ) {}

    /**
     * Lista as transações do workspace.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace();
        $transactions = $this->transactionService->listForWorkspace($workspace);

        return Inertia::render('Transactions/Index', [
            'transactions' => TransactionResource::collection($transactions),
        ]);
    }

    /**
     * Salva uma nova transação.
     */
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace();
        $this->transactionService->create($workspace, $request->validated());

        return redirect()->route('transactions.index');
    }
}
```

**Regras:**
- Injete dependências pelo construtor (readonly)
- Controllers nunca acessam o banco diretamente
- Retorne sempre `Inertia::render()` ou `redirect()`
- Nunca chame `$request->all()` — use `$request->validated()`

---

## Form Request

```php
/**
 * Valida os dados para criação de transação.
 */
class StoreTransactionRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer a requisição.
     */
    public function authorize(): bool
    {
        return true; // Autorização fica nas Policies
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'amount'       => ['required', 'integer', 'min:1'],
            'type'         => ['required', Rule::in(['debit', 'credit_card', 'transfer'])],
            'account_id'   => ['required', 'uuid', 'exists:accounts,id'],
            'occurred_at'  => ['required', 'date'],
        ];
    }
}
```

**Regras:**
- Toda validação de input fica no Form Request, nunca no controller
- Use array syntax para as rules (não pipe notation)
- Monetary values em centavos (integer, nunca float)

---

## Service

```php
/**
 * Orquestra as operações de negócio relacionadas a transações.
 */
class TransactionService
{
    public function __construct(
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly AccountService $accountService,
    ) {}

    /**
     * Cria uma nova transação e ajusta o saldo da conta quando aplicável.
     *
     * @param  Workspace  $workspace
     * @param  array<string, mixed>  $data
     * @return Transaction
     */
    public function create(Workspace $workspace, array $data): Transaction
    {
        $transaction = $this->transactionRepository->create([
            ...$data,
            'workspace_id' => $workspace->id,
        ]);

        if ($transaction->type === 'debit') {
            $this->accountService->decrementBalance($transaction->account_id, $transaction->amount);
        }

        return $transaction;
    }
}
```

**Regras:**
- Services não retornam respostas HTTP
- Services não usam `Request` — recebem dados já validados
- Use eventos para efeitos colaterais desacoplados

---

## Repository

### Interface

```php
/**
 * Contrato para acesso a dados de transações.
 */
interface TransactionRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Transaction;

    /**
     * @return \Illuminate\Pagination\LengthAwarePaginator<Transaction>
     */
    public function listByWorkspace(string $workspaceId, int $perPage = 15): LengthAwarePaginator;
}
```

### Implementação

```php
/**
 * Implementação Eloquent do repositório de transações.
 */
class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    public function create(array $data): Transaction
    {
        return Transaction::create($data);
    }

    public function listByWorkspace(string $workspaceId, int $perPage = 15): LengthAwarePaginator
    {
        return Transaction::query()
            ->where('workspace_id', $workspaceId)
            ->latest('occurred_at')
            ->paginate($perPage);
    }
}
```

**Registrar no AppServiceProvider:**
```php
$this->app->bind(TransactionRepositoryInterface::class, EloquentTransactionRepository::class);
```

---

## Model

```php
/**
 * Representa uma movimentação financeira dentro de um workspace.
 */
#[Fillable(['workspace_id', 'account_id', 'category_id', 'description', 'amount', 'type', 'status', 'occurred_at'])]
class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'amount'      => 'integer',
            'occurred_at' => 'date',
            'status'      => TransactionStatus::class, // Backed enum
        ];
    }

    // Relationships
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    // Scopes
    public function scopeForWorkspace(Builder $query, string $workspaceId): void
    {
        $query->where('workspace_id', $workspaceId);
    }
}
```

**Regras:**
- Campos monetários: `integer` cast (centavos)
- Use Backed Enums para campos com valores fixos
- Toda model tem `SoftDeletes` quando os dados são financeiros
- `#[Fillable([...])]` attribute ao invés de propriedade `$fillable`
- Sem lógica de negócio no model

---

## API Resource

```php
/**
 * Serializa os dados de uma transação para o frontend.
 */
class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'description' => $this->description,
            'amount'      => $this->amount,          // centavos (int)
            'type'        => $this->type,
            'status'      => $this->status,
            'occurred_at' => $this->occurred_at->toDateString(),
            'account'     => new AccountResource($this->whenLoaded('account')),
            'category'    => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
```

**Regras:**
- Nunca expor `workspace_id`, `deleted_at`, timestamps internos ao frontend
- Use `$this->whenLoaded()` para relacionamentos — nunca carregue eager desnecessário
- Datas em ISO string (`toDateString()`, `toISOString()`)
- Valores monetários em centavos (int) — o frontend formata

---

## Roteamento

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/',        [TransactionController::class, 'index'])->name('index');
        Route::get('/create',  [TransactionController::class, 'create'])->name('create');
        Route::post('/',       [TransactionController::class, 'store'])->name('store');
        Route::get('/{transaction}/edit', [TransactionController::class, 'edit'])->name('edit');
        Route::put('/{transaction}',      [TransactionController::class, 'update'])->name('update');
        Route::delete('/{transaction}',   [TransactionController::class, 'destroy'])->name('destroy');
    });
});
```

**Regras:**
- Sempre use nomes de rota (`->name()`)
- Agrupe rotas por domínio com `prefix` e `name`
- Route model binding para `{resource}` — o Laravel resolve automaticamente

---

## Convenções de Naming

| Artefato | Padrão | Exemplo |
|---|---|---|
| Controller | `{Resource}Controller` | `TransactionController` |
| Service | `{Resource}Service` | `TransactionService` |
| Repository interface | `{Resource}RepositoryInterface` | `TransactionRepositoryInterface` |
| Repository impl. | `Eloquent{Resource}Repository` | `EloquentTransactionRepository` |
| Form Request (store) | `Store{Resource}Request` | `StoreTransactionRequest` |
| Form Request (update) | `Update{Resource}Request` | `UpdateTransactionRequest` |
| API Resource | `{Resource}Resource` | `TransactionResource` |
| Event | Verbo no passado | `TransactionCreated` |
| Job | Verbo no imperativo | `ProcessTransactionBalance` |

---

## PHPDoc obrigatório

```php
/**
 * Descrição da responsabilidade da classe.
 */
class MyClass
{
    /**
     * Descrição do método.
     *
     * @param  string  $workspaceId  UUID do workspace
     * @param  array<string, mixed>  $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator<Transaction>
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function method(string $workspaceId, array $filters): LengthAwarePaginator
    {
        // ...
    }
}
```

---

## Regra crítica: workspace_id

**Todo** acesso à base de dados deve ser filtrado por `workspace_id`. Nunca retorne dados sem o escopo correto:

```php
// CORRETO
Transaction::where('workspace_id', $workspace->id)->get();

// ERRADO
Transaction::all();
Transaction::find($id); // sem escopo de workspace
```
