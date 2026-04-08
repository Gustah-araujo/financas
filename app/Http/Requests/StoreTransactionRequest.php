<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida os dados para criação de uma nova transação financeira.
 * A validação do workspace da conta é realizada no controller.
 */
class StoreTransactionRequest extends FormRequest
{
    /**
     * Determina se o usuário está autorizado a fazer a requisição.
     * A autorização de workspace é verificada no controller.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Regras de validação para criação de transação.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'account_id'  => ['required', 'uuid', 'exists:accounts,id'],
            'type'        => ['sometimes', Rule::in(['debit', 'credit_card', 'transfer'])],
            'amount'      => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'date'        => ['required', 'date'],
            'status'      => ['sometimes', Rule::in(['confirmed', 'pending'])],
        ];
    }
}
