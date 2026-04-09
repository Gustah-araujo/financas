<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Endpoint de listagem paginada de contas para consumo pelo DataTable.
 * Suporta busca, ordenação e paginação via query params.
 */
class AccountController extends Controller
{
    /** @var string[] Colunas permitidas para ordenação */
    private const SORTABLE_COLUMNS = ['name', 'type', 'balance'];

    /**
     * Lista as contas do workspace do usuário autenticado com suporte a
     * busca, ordenação e paginação.
     *
     * Query params:
     *   - search (string, opcional): filtra por name (LIKE)
     *   - sort (string, opcional): coluna de ordenação (name|type|balance), padrão: name
     *   - direction (string, opcional): asc|desc, padrão: asc
     *   - per_page (int, opcional): itens por página (1-100), padrão: 15
     *   - page (int, opcional): número da página, padrão: 1
     *
     * @param  Request  $request
     * @return AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $workspace = $request->user()->currentWorkspace();

        $sortColumn = in_array($request->input('sort'), self::SORTABLE_COLUMNS, true)
            ? $request->input('sort')
            : 'name';

        $direction = $request->input('direction') === 'desc' ? 'desc' : 'asc';

        $perPage = min((int) $request->input('per_page', 15), 100);
        $perPage = max($perPage, 1);

        $query = Account::where('workspace_id', $workspace->id)
            ->when(
                $request->filled('search'),
                fn ($q) => $q->where('name', 'like', '%'.$request->input('search').'%')
            )
            ->orderBy($sortColumn, $direction);

        $paginator = $query->paginate($perPage)->withQueryString();

        return AccountResource::collection($paginator);
    }
}
