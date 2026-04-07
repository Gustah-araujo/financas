<?php

namespace App\Application\DTOs;

/**
 * Representa um item do menu lateral da aplicação.
 * Pode conter sub-itens aninhados (children).
 */
class SidebarItemDTO
{
    /**
     * @param string              $icon     Classe CSS do ícone (ex: "fa-solid fa-house")
     * @param string              $label    Texto exibido no menu
     * @param string              $url      Rota de destino do item
     * @param SidebarSubItemDTO[] $children Sub-itens aninhados (opcional)
     */
    public function __construct(
        public readonly string $icon,
        public readonly string $label,
        public readonly string $url,
        /** @var SidebarSubItemDTO[] */
        public readonly array $children = [],
    ) {}

    /**
     * Serializa o item para uso no Inertia (shared props).
     *
     * @return array{icon: string, label: string, url: string, children: array}
     */
    public function toArray(): array
    {
        return [
            'icon'     => $this->icon,
            'label'    => $this->label,
            'url'      => $this->url,
            'children' => array_map(fn (SidebarSubItemDTO $item) => $item->toArray(), $this->children),
        ];
    }
}
