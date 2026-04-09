<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Support\Notifications;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Gerencia as operações CRUD de contas financeiras.
 * Todas as operações são escopadas ao workspace do usuário autenticado.
 */
class AccountController extends Controller
{
    /**
     * Lista todas as contas do workspace do usuário autenticado.
     * Os dados são carregados via DataTable pelo endpoint da API.
     *
     * @return Response
     */
    public function index(): Response
    {
        return Inertia::render('Accounts/Index');
    }

    /**
     * Retorna a página de criação de conta.
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('Accounts/Create');
    }

    /**
     * Cria uma nova conta no workspace do usuário autenticado.
     *
     * @param  StoreAccountRequest  $request
     * @return RedirectResponse
     */
    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $workspace = $request->user()->currentWorkspace();

        Account::create([
            ...$request->validated(),
            'workspace_id' => $workspace->id,
        ]);

        Notifications::success('Conta criada!', 'A conta foi criada com sucesso.');

        return redirect()->route('accounts.index');
    }

    /**
     * Exibe os detalhes de uma conta específica.
     * Verifica que a conta pertence ao workspace do usuário autenticado.
     *
     * @param  Request  $request
     * @param  Account  $account
     * @return Response
     */
    public function show(Request $request, Account $account): Response
    {
        $this->authorizeWorkspace($request, $account);

        return Inertia::render('Accounts/Show', [
            'account' => new AccountResource($account),
        ]);
    }

    /**
     * Retorna a página de edição de uma conta existente.
     * Verifica que a conta pertence ao workspace do usuário autenticado.
     *
     * @param  Request  $request
     * @param  Account  $account
     * @return Response
     */
    public function edit(Request $request, Account $account): Response
    {
        $this->authorizeWorkspace($request, $account);

        return Inertia::render('Accounts/Edit', [
            'account' => new AccountResource($account),
        ]);
    }

    /**
     * Atualiza os dados de uma conta existente.
     * Verifica que a conta pertence ao workspace do usuário autenticado.
     *
     * @param  UpdateAccountRequest  $request
     * @param  Account               $account
     * @return RedirectResponse
     */
    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        $this->authorizeWorkspace($request, $account);

        $account->update($request->validated());

        Notifications::success('Conta atualizada!', 'Os dados da conta foram atualizados.');

        return redirect()->route('accounts.index');
    }

    /**
     * Remove (soft delete) uma conta do workspace.
     * Verifica que a conta pertence ao workspace do usuário autenticado.
     *
     * @param  Request  $request
     * @param  Account  $account
     * @return RedirectResponse
     */
    public function destroy(Request $request, Account $account): RedirectResponse
    {
        $this->authorizeWorkspace($request, $account);

        $account->delete();

        Notifications::success('Conta removida!', 'A conta foi removida com sucesso.');

        return redirect()->route('accounts.index');
    }

    /**
     * Verifica se a conta pertence ao workspace do usuário autenticado.
     * Aborta com 403 caso a conta pertença a outro workspace.
     *
     * @param  Request  $request
     * @param  Account  $account
     * @return void
     */
    private function authorizeWorkspace(Request $request, Account $account): void
    {
        if ($account->workspace_id !== $request->user()->currentWorkspace()->id) {
            abort(403);
        }
    }
}
