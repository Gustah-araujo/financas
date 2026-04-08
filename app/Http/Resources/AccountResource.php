<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializa os dados de uma conta financeira para o frontend.
 * O saldo é exposto em centavos (integer) — o frontend é responsável pela formatação.
 */
class AccountResource extends JsonResource
{

    /**
     * Transforma o resource em um array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'name'    => $this->name,
            'type'    => $this->type,
            'balance' => $this->balance, // centavos (int)
        ];
    }
}
