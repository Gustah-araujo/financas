<?php

namespace App\Application\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

/**
 * Orquestra a criação de uma transação financeira.
 * Quando a transação é um débito confirmado, decrementa o saldo da conta
 * utilizando lock pessimista para evitar race conditions.
 */
class CreateTransactionService
{
    /**
     * Cria uma nova transação e ajusta o saldo da conta quando aplicável.
     *
     * @param  array<string, mixed>  $data  Dados validados da transação, incluindo workspace_id
     * @return Transaction                  Transação recém-criada
     */
    public function execute(array $data): Transaction
    {
        return DB::transaction(function () use ($data): Transaction {
            $transaction = Transaction::create($data);

            if ($transaction->type === 'debit' && $transaction->status === 'confirmed') {
                Account::where('id', $transaction->account_id)
                    ->lockForUpdate()
                    ->first()
                    ->decrement('balance', $transaction->amount);
            }

            return $transaction;
        });
    }
}
