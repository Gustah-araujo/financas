<?php

namespace App\Http\Middleware;

use App\Application\Services\SidebarService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Injeta o SidebarService para disponibilizar os itens de menu via shared props.
     *
     * @param SidebarService $sidebarService Serviço responsável pela estrutura do menu lateral
     */
    public function __construct(private readonly SidebarService $sidebarService) {}

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'     => $request->user()->id,
                    'name'   => $request->user()->name,
                    'email'  => $request->user()->email,
                    'avatar' => null,
                ] : null,
            ],
            'sidebar' => $this->sidebarService->toArray(),
            'flash'   => [
                'notification' => session('notification'),
            ],
        ];
    }
}
