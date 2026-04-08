<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Representa um ambiente financeiro compartilhado entre usuários.
 * Todos os dados financeiros (contas, transações, etc.) pertencem a um workspace.
 */
#[Fillable(['name'])]
class Workspace extends Model
{
    use HasUuids, SoftDeletes;

    /**
     * Usuários que pertencem a este workspace.
     * O pivot `role` indica a função do usuário (owner | member).
     *
     * @return BelongsToMany<User>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_users')
            ->using(WorkspaceUser::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Contas financeiras associadas a este workspace.
     *
     * @return HasMany<Account>
     */
    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }
}
