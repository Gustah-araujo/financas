<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela de contas bancárias/financeiras.
     * Uma conta pertence a um workspace e armazena saldo incremental.
     */
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            // Primary key — UUID (padrão do projeto)
            $table->uuid('id')->primary();

            // Escopo obrigatório do workspace
            $table->uuid('workspace_id');

            // Nome da conta (ex: "Nubank", "Carteira")
            $table->string('name');

            // Tipo da conta: corrente, poupança ou dinheiro em espécie
            $table->string('type', 20); // checking | savings | cash

            // Saldo armazenado em centavos para evitar imprecisão de ponto flutuante
            $table->integer('balance')->default(0);

            $table->timestamps();
            $table->softDeletes(); // Preserva histórico ao remover contas

            // Restrição de integridade referencial — cascade ao deletar workspace
            $table->foreign('workspace_id')->references('id')->on('workspaces')->cascadeOnDelete();

            // Index composto para as queries mais comuns
            $table->index('workspace_id');
        });
    }

    /**
     * Reverte a migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
