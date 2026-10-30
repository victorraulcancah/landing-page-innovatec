import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ReactNode, useCallback, useRef, useState } from 'react';

export interface ConfirmOptions {
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Acción que borra o no se puede deshacer: el botón sale en rojo. */
    destructive?: boolean;
}

interface Pending extends ConfirmOptions {
    resolve: (ok: boolean) => void;
}

/**
 * Confirmación en un modal del propio panel, en lugar del cuadro del navegador.
 *
 * const { confirm, dialog } = useConfirm();
 * if (!(await confirm({ title, description, destructive: true }))) return;
 * ... y se pinta {dialog} una vez en la página.
 */
export function useConfirm() {
    const [pending, setPending] = useState<Pending | null>(null);
    // Mientras el modal se cierra (animación) conserva los textos de la última pregunta.
    const last = useRef<Pending | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    if (pending) last.current = pending;
    const shown = pending ?? last.current;

    const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })), []);

    const settle = (ok: boolean) => {
        pending?.resolve(ok);
        setPending(null);
    };

    const dialog = (
        <Dialog open={pending !== null} onOpenChange={(open) => !open && settle(false)}>
            <DialogContent
                className="max-w-md"
                onOpenAutoFocus={(e) => {
                    // El foco empieza en «Cancelar»: un Enter distraído no borra nada.
                    e.preventDefault();
                    cancelRef.current?.focus();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{shown?.title}</DialogTitle>
                    <DialogDescription>{shown?.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button ref={cancelRef} type="button" variant="outline" onClick={() => settle(false)}>
                        {shown?.cancelLabel ?? 'Cancelar'}
                    </Button>
                    <Button type="button" variant={shown?.destructive ? 'destructive' : 'default'} onClick={() => settle(true)}>
                        {shown?.confirmLabel ?? 'Aceptar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return { confirm, dialog };
}
