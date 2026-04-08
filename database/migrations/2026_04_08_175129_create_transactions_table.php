<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cria a tabela de transações financeiras.
     * Armazena débitos, créditos de cartão e transferências do workspace.
     * Todos os valores são armazenados em centavos (integer).
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            // Primary key
            $table->uuid('id')->primary();

            // Escopo obrigatório
            $table->uuid('workspace_id');

            // Conta de origem da transação
            $table->uuid('account_id');

            // Tipo da transação — preparado para futuros tipos (credit_card, transfer)
            $table->string('type', 20);

            // Valor em centavos — sempre positivo, nunca float
            $table->unsignedBigInteger('amount');

            // Descrição da transação
            $table->string('description', 255);

            // Data de competência da transação
            $table->date('date');

            // Status — confirmed (já efetivado) ou pending (planejado)
            $table->string('status', 20)->default('confirmed');

            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('workspace_id')
                ->references('id')
                ->on('workspaces')
                ->cascadeOnDelete();

            $table->foreign('account_id')
                ->references('id')
                ->on('accounts')
                ->cascadeOnDelete();

            // Indexes para as queries mais comuns (sempre escopadas por workspace)
            $table->index('workspace_id');
            $table->index('account_id');
            $table->index('date');
        });
    }

    /**
     * Reverte a criação da tabela de transações.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
