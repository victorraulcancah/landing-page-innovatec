import { type FlashProps } from '@/types/cms';
import { usePage } from '@inertiajs/react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Aviso flotante para los mensajes que deja el servidor tras guardar o fallar una accion. */
export function FlashMessages() {
    const flash = (usePage().props.flash ?? {}) as FlashProps;
    const [dismissed, setDismissed] = useState<string | null>(null);

    const message = flash.error || flash.success || null;
    const isError = Boolean(flash.error);

    useEffect(() => {
        if (!message) return;
        const timer = window.setTimeout(() => setDismissed(message), 5000);
        return () => window.clearTimeout(timer);
    }, [message]);

    if (!message || dismissed === message) return null;

    return (
        <div role="status" aria-live="polite" className="fixed right-4 bottom-4 z-50 max-w-sm">
            <div
                className={`flex items-start gap-3 rounded-lg border bg-background p-3 text-sm shadow-lg ${
                    isError ? 'border-destructive/50 text-destructive' : 'border-border text-foreground'
                }`}
            >
                {isError ? <CircleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600" />}
                <p className="flex-1">{message}</p>
                <button type="button" onClick={() => setDismissed(message)} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar aviso">
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
