<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Representa uma conta financeira dentro de um workspace.
 * O saldo é armazenado em centavos e atualizado incrementalmente.
 */
#[Fillable(['workspace_id', 'name', 'type', 'balance'])]
class Account extends Model
{
    use HasUuids, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Saldo em centavos — evita imprecisão de ponto flutuante
            'balance' => 'integer',
        ];
    }

    /**
     * Workspace ao qual esta conta pertence.
     *
     * @return BelongsTo<Workspace, Account>
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
