<?php

namespace App\Application\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

/**
 * Orquestra a atualização de uma transação financeira existente.
 * Reverte o impacto da transação original no saldo e aplica o novo impacto,
 * utilizando lock pessimista para evitar race conditions.
 */
class UpdateTransactionService
{
    /**
     * Atualiza a transação e reajusta o saldo da conta conforme necessário.
     *
     * O processo é:
     * 1. Adquire lock na conta para evitar race conditions
     * 2. Reverte o saldo impactado pela transação antiga (se era débito confirmado)
     * 3. Atualiza os dados da transação
     * 4. Aplica o novo impacto no saldo (se nova versão é débito confirmado)
     *
     * @param  Transaction           $transaction  Transação a ser atualizada
     * @param  array<string, mixed>  $data         Dados validados para atualização
     * @return Transaction                         Transação atualizada
     */
    public function execute(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data): Transaction {
            $oldType   = $transaction->type;
            $oldStatus = $transaction->status;
            $oldAmount = $transaction->amount;

            $account = Account::where('id', $transaction->account_id)
                ->lockForUpdate()
                ->first();

            // Reverte o impacto da transação anterior no saldo
            if ($oldType === 'debit' && $oldStatus === 'confirmed') {
                $account->increment('balance', $oldAmount);
            }

            $transaction->update($data);
            $transaction->refresh();

            // Aplica o impacto da transação atualizada no saldo
            if ($transaction->type === 'debit' && $transaction->status === 'confirmed') {
                $account->decrement('balance', $transaction->amount);
            }

            return $transaction;
        });
    }
}
