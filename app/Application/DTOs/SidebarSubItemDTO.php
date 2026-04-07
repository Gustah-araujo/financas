<?php

namespace App\Application\DTOs;

/**
 * Representa um sub-item do menu lateral da aplicação.
 * Sub-itens não possuem ícone, apenas label e URL.
 */
class SidebarSubItemDTO
{
    /**
     * @param string $label Texto exibido no menu
     * @param string $url   Rota de destino do item
     */
    public function __construct(
        public readonly string $label,
        public readonly string $url,
    ) {}

    /**
     * Serializa o sub-item para uso no Inertia (shared props).
     *
     * @return array{label: string, url: string}
     */
    public function toArray(): array
    {
        return [
            'label' => $this->label,
            'url'   => $this->url,
        ];
    }
}
