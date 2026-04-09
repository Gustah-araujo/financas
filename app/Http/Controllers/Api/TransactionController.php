<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Endpoint de listagem paginada de transações para consumo pelo DataTable.
 * Suporta busca, ordenação e paginação via query params.
 */
class TransactionController extends Controller
{
    /** @var string[] Colunas permitidas para ordenação */
    private const SORTABLE_COLUMNS = ['date', 'description', 'amount', 'status'];

    /**
     * Lista as transações do workspace do usuário autenticado com suporte a
     * busca, ordenação e paginação.
     *
     * Query params:
     *   - search (string, opcional): filtra por description (LIKE)
     *   - sort (string, opcional): coluna de ordenação (date|description|amount|status), padrão: date
     *   - direction (string, opcional): asc|desc, padrão: desc
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
            : 'date';

        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';

        $perPage = min((int) $request->input('per_page', 15), 100);
        $perPage = max($perPage, 1);

        $query = Transaction::where('workspace_id', $workspace->id)
            ->with('account')
            ->when(
                $request->filled('search'),
                fn ($q) => $q->where('description', 'like', '%'.$request->input('search').'%')
            )
            ->orderBy($sortColumn, $direction);

        $paginator = $query->paginate($perPage)->withQueryString();

        return TransactionResource::collection($paginator);
    }
}
