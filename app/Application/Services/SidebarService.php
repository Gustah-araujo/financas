<?php

namespace App\Application\Services;

use App\Application\DTOs\SidebarItemDTO;

/**
 * Responsável por definir e serializar a estrutura do menu lateral da aplicação.
 * Centraliza todos os itens de navegação para serem compartilhados via Inertia.
 */
class SidebarService
{
    /**
     * Retorna a estrutura completa do menu lateral.
     *
     * @return SidebarItemDTO[]
     */
    public function getItems(): array
    {
        return [
            new SidebarItemDTO(
                icon: 'fa-solid fa-house',
                label: 'Dashboard',
                url: '/',
            ),
            new SidebarItemDTO(
                icon: 'fa-solid fa-wallet',
                label: 'Contas',
                url: '/accounts',
            ),
            new SidebarItemDTO(
                icon: 'fa-solid fa-arrow-down-to-bracket',
                label: 'Transações',
                url: '/transactions',
            ),
        ];
    }

    /**
     * Retorna os itens serializados para uso no Inertia (shared props).
     *
     * @return array<int, array{icon: string, label: string, url: string, children: array}>
     */
    public function toArray(): array
    {
        return array_map(fn (SidebarItemDTO $item) => $item->toArray(), $this->getItems());
    }
}
