<?php

namespace App\Support;

/**
 * Helper estático para flashar notificações na sessão via Inertia shared props.
 *
 * Uso: Notifications::success('Conta criada!', 'A conta foi salva com sucesso.')
 * O frontend consome via props.flash.notification.
 */
class Notifications
{
    /**
     * Flasha uma notificação de sucesso na sessão.
     *
     * @param string      $title   Título principal da notificação
     * @param string|null $message Mensagem adicional opcional
     */
    public static function success(string $title, ?string $message = null): void
    {
        session()->flash('notification', [
            'type'    => 'success',
            'title'   => $title,
            'message' => $message,
        ]);
    }

    /**
     * Flasha uma notificação de erro na sessão.
     *
     * @param string      $title   Título principal da notificação
     * @param string|null $message Mensagem adicional opcional
     */
    public static function error(string $title, ?string $message = null): void
    {
        session()->flash('notification', [
            'type'    => 'error',
            'title'   => $title,
            'message' => $message,
        ]);
    }

    /**
     * Flasha uma notificação de aviso na sessão.
     *
     * @param string      $title   Título principal da notificação
     * @param string|null $message Mensagem adicional opcional
     */
    public static function warning(string $title, ?string $message = null): void
    {
        session()->flash('notification', [
            'type'    => 'warning',
            'title'   => $title,
            'message' => $message,
        ]);
    }

    /**
     * Flasha uma notificação informativa na sessão.
     *
     * @param string      $title   Título principal da notificação
     * @param string|null $message Mensagem adicional opcional
     */
    public static function info(string $title, ?string $message = null): void
    {
        session()->flash('notification', [
            'type'    => 'info',
            'title'   => $title,
            'message' => $message,
        ]);
    }
}
