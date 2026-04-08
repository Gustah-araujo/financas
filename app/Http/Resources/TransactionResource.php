<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serializa os dados de uma transação financeira para o frontend.
 * Valores monetários são expostos em centavos (integer).
 * A data é formatada como Y-m-d para consumo padronizado no frontend.
 */
class TransactionResource extends JsonResource
{
    /**
     * Transforma o resource em um array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'workspace_id' => $this->workspace_id,
            'account_id'   => $this->account_id,
            'type'         => $this->type,
            'amount'       => $this->amount,                    // centavos (int)
            'description'  => $this->description,
            'date'         => $this->date->format('Y-m-d'),     // data de competência
            'status'       => $this->status,
            'account'      => new AccountResource($this->whenLoaded('account')),
        ];
    }
}
