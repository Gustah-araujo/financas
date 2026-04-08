<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela de workspaces.
     * Um workspace representa um ambiente financeiro compartilhado (ex: casal, empresa).
     * Todos os dados financeiros pertencem a um workspace.
     */
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            // Primary key — UUID (padrão do projeto)
            $table->uuid('id')->primary();

            // Nome do workspace
            $table->string('name');

            $table->timestamps();
            $table->softDeletes(); // Preserva histórico ao remover workspaces
        });
    }

    /**
     * Reverte a migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspaces');
    }
};
