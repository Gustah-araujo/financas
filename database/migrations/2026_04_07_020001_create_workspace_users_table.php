<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela pivot workspace_users.
     * Associa usuários a workspaces com um papel (role) de acesso.
     */
    public function up(): void
    {
        Schema::create('workspace_users', function (Blueprint $table) {
            // Primary key — UUID (padrão do projeto)
            $table->uuid('id')->primary();

            // Referência ao workspace
            $table->uuid('workspace_id');

            // Referência ao usuário
            $table->uuid('user_id');

            // Papel do usuário no workspace: owner ou member
            $table->string('role', 20)->default('member');

            $table->timestamps();

            // Restrição de integridade referencial
            $table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            // Um usuário não pode pertencer ao mesmo workspace mais de uma vez
            $table->unique(['workspace_id', 'user_id']);
        });
    }

    /**
     * Reverte a migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_users');
    }
};
