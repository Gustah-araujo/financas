<?php

namespace App\Application\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

/**
 * Orquestra a remoção (soft delete) de uma transação financeira.
 * Quando a transação era um débito confirmado, restaura o saldo da conta
 * utilizando lock pessimista para evitar race conditions.
 */
class DeleteTransactionService
{
    /**
     * Remove a transação e reverte seu impacto no saldo da conta quando aplicável.
     *
     * @param  Transaction  $transaction  Transação a ser removida
     * @return void
     */
    public function execute(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction): void {
            if ($transaction->type === 'debit' && $transaction->status === 'confirmed') {
                Account::where('id', $transaction->account_id)
                    ->lockForUpdate()
                    ->first()
                    ->increment('balance', $transaction->amount);
            }

            $transaction->delete();
        });
    }
}
