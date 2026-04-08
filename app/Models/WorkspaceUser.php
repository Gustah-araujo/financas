<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * Pivot model para a relação entre User e Workspace.
 * Armazena o papel (role) do usuário dentro do workspace.
 */
class WorkspaceUser extends Pivot
{
    use HasUuids;

    /** @var string */
    protected $table = 'workspace_users';

    /** @var bool */
    public $incrementing = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => 'string',
        ];
    }
}
