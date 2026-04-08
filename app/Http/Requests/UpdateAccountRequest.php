<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida os dados para atualização de uma conta financeira existente.
 */
class UpdateAccountRequest extends FormRequest
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
     * Regras de validação para atualização de conta.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['checking', 'savings', 'cash'])],
        ];
    }
}
