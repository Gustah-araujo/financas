<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida os dados para atualização de uma transação financeira existente.
 * A validação do workspace da conta é realizada no controller.
 */
class UpdateTransactionRequest extends FormRequest
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
     * Regras de validação para atualização de transação.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'account_id'  => ['sometimes', 'uuid', 'exists:accounts,id'],
            'type'        => ['sometimes', Rule::in(['debit'])],
            'amount'      => ['sometimes', 'integer', 'min:1'],
            'description' => ['sometimes', 'string', 'max:255'],
            'date'        => ['sometimes', 'date'],
            'status'      => ['sometimes', Rule::in(['confirmed', 'pending'])],
        ];
    }
}
