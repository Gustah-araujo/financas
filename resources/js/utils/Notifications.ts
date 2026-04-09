import Swal from 'sweetalert2';

/** Opções para o modal de confirmação bloqueante */
interface AlertOptions {
    title: string;
    description?: string;
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

/** Opções para a notificação toast não-bloqueante */
interface ToastOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
}

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

/**
 * Objeto utilitário com helpers de notificação via SweetAlert2.
 * Disponível globalmente como `window.Notifications`.
 */
const Notifications = {
    /**
     * Exibe um modal de confirmação bloqueante.
     *
     * @param options - Opções do alerta (título, ícone, callbacks, etc.)
     */
    alert(options: AlertOptions): void {
        Swal.fire({
            title: options.title,
            text: options.description,
            icon: options.icon,
            showCancelButton: true,
            confirmButtonText: options.confirmLabel ?? 'Confirmar',
            cancelButtonText: options.cancelLabel ?? 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                options.onConfirm();
            } else if (result.isDismissed && options.onCancel) {
                options.onCancel();
            }
        });
    },

    /**
     * Exibe uma notificação toast não-bloqueante.
     *
     * @param options - Tipo, título e mensagem opcional do toast
     */
    toast(options: ToastOptions): void {
        Toast.fire({
            icon: options.type,
            title: options.title,
            text: options.message,
        });
    },
};

export { Notifications };
export default Notifications;
