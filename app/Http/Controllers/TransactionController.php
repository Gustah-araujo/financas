<?php

namespace App\Http\Controllers;

use App\Application\Services\CreateTransactionService;
use App\Application\Services\DeleteTransactionService;
use App\Application\Services\UpdateTransactionService;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Support\Notifications;
use App\Http\Resources\AccountResource;
use App\Http\Resources\TransactionResource;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gerencia as operações CRUD de transações financeiras.
 * Todas as operações são escopadas ao workspace do usuário autenticado.
 */
class TransactionController extends Controller
{
    /**
     * @param  CreateTransactionService  $createTransactionService
     * @param  UpdateTransactionService  $updateTransactionService
     * @param  DeleteTransactionService  $deleteTransactionService
     */
    public function __construct(
        private readonly CreateTransactionService $createTransactionService,
        private readonly UpdateTransactionService $updateTransactionService,
        private readonly DeleteTransactionService $deleteTransactionService,
    ) {}

    /**
     * Lista as transações do workspace do usuário autenticado.
     * As transações são carregadas via DataTable pelo endpoint da API.
     * Passa apenas as contas disponíveis para uso nos filtros e formulário de criação.
     *
     * @param  Request  $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace();

        $accounts = Account::where('workspace_id', $workspace->id)->get();

        return Inertia::render('Transactions/Index', [
            'accounts' => AccountResource::collection($accounts),
        ]);
    }

    /**
     * Retorna a página de criação de transação com a lista de contas disponíveis.
     *
     * @param  Request  $request
     * @return Response
     */
    public function create(Request $request): Response
    {
        $workspace = $request->user()->currentWorkspace();

        $accounts = Account::where('workspace_id', $workspace->id)->get();

        return Inertia::render('Transactions/Create', [
            'accounts' => AccountResource::collection($accounts),
        ]);
    }

    /**
     * Cria uma nova transação no workspace do usuário autenticado.
     * Valida que a conta informada pertence ao mesmo workspace.
     *
     * @param  StoreTransactionRequest  $request
     * @return RedirectResponse
     */
    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace();

        $this->authorizeAccount($request, $request->validated('account_id'), $workspace->id);

        $this->createTransactionService->execute([
            ...$request->validated(),
            'workspace_id' => $workspace->id,
            'type'         => $request->validated('type', 'debit'),
            'status'       => $request->validated('status', 'confirmed'),
        ]);

        Notifications::success('Transação criada!', 'A transação foi registrada com sucesso.');

        return redirect()->route('transactions.index');
    }

    /**
     * Exibe os detalhes de uma transação específica.
     * Verifica que a transação pertence ao workspace do usuário autenticado.
     *
     * @param  Request      $request
     * @param  Transaction  $transaction
     * @return Response
     */
    public function show(Request $request, Transaction $transaction): Response
    {
        $this->authorizeWorkspace($request, $transaction);

        $transaction->load('account');

        return Inertia::render('Transactions/Show', [
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Retorna a página de edição de uma transação existente.
     * Verifica que a transação pertence ao workspace do usuário autenticado.
     *
     * @param  Request      $request
     * @param  Transaction  $transaction
     * @return Response
     */
    public function edit(Request $request, Transaction $transaction): Response
    {
        $this->authorizeWorkspace($request, $transaction);

        $workspace = $request->user()->currentWorkspace();
        $accounts  = Account::where('workspace_id', $workspace->id)->get();

        $transaction->load('account');

        return Inertia::render('Transactions/Edit', [
            'transaction' => new TransactionResource($transaction),
            'accounts'    => AccountResource::collection($accounts),
        ]);
    }

    /**
     * Atualiza os dados de uma transação existente.
     * Verifica que a transação pertence ao workspace do usuário autenticado.
     * Valida que nova conta (se informada) pertence ao mesmo workspace.
     *
     * @param  UpdateTransactionRequest  $request
     * @param  Transaction               $transaction
     * @return RedirectResponse
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeWorkspace($request, $transaction);

        $workspace = $request->user()->currentWorkspace();

        if ($request->has('account_id')) {
            $this->authorizeAccount($request, $request->validated('account_id'), $workspace->id);
        }

        $this->updateTransactionService->execute($transaction, $request->validated());

        Notifications::success('Transação atualizada!', 'Os dados da transação foram atualizados.');

        return redirect()->route('transactions.index');
    }

    /**
     * Remove (soft delete) uma transação e reverte seu impacto no saldo.
     * Verifica que a transação pertence ao workspace do usuário autenticado.
     *
     * @param  Request      $request
     * @param  Transaction  $transaction
     * @return RedirectResponse
     */
    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeWorkspace($request, $transaction);

        $this->deleteTransactionService->execute($transaction);

        Notifications::success('Transação removida!', 'A transação foi removida com sucesso.');

        return redirect()->route('transactions.index');
    }

    /**
     * Verifica se a transação pertence ao workspace do usuário autenticado.
     * Aborta com 403 caso a transação pertença a outro workspace.
     *
     * @param  Request      $request
     * @param  Transaction  $transaction
     * @return void
     */
    private function authorizeWorkspace(Request $request, Transaction $transaction): void
    {
        if ($transaction->workspace_id !== $request->user()->currentWorkspace()->id) {
            abort(403);
        }
    }

    /**
     * Verifica se a conta informada pertence ao workspace do usuário autenticado.
     * Aborta com 403 caso a conta pertença a outro workspace.
     *
     * @param  Request  $request
     * @param  string   $accountId   UUID da conta a verificar
     * @param  string   $workspaceId UUID do workspace atual
     * @return void
     */
    private function authorizeAccount(Request $request, string $accountId, string $workspaceId): void
    {
        $belongs = Account::where('id', $accountId)
            ->where('workspace_id', $workspaceId)
            ->exists();

        if (! $belongs) {
            abort(403);
        }
    }
}
