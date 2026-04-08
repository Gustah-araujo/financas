<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Representa uma transação financeira dentro de um workspace.
 * Suporta débitos, créditos de cartão e transferências.
 * Valores são sempre armazenados em centavos (integer).
 */
class Transaction extends Model
{
    use HasUuids, SoftDeletes;

    /**
     * Atributos que podem ser preenchidos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'workspace_id',
        'account_id',
        'type',
        'amount',
        'description',
        'date',
        'status',
    ];

    /**
     * Retorna os casts de atributos do model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Valor em centavos — evita imprecisão de ponto flutuante
            'amount' => 'integer',
            // Data sem hora de competência
            'date'   => 'date',
        ];
    }

    /**
     * Workspace ao qual esta transação pertence.
     *
     * @return BelongsTo<Workspace, Transaction>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Conta financeira associada a esta transação.
     *
     * @return BelongsTo<Account, Transaction>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
