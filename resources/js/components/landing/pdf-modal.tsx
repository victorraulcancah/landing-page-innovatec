import { Download, ExternalLink, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

/** Visor de un PDF en una ventana: se lee dentro de la página y se puede descargar o abrir en otra pestaña. */
export function PdfModal({ title, file, onClose }: { title: string; file: string; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = dialog.current;
        if (!el) return;
        el.showModal();
        const root = document.documentElement;
        const before = root.style.overflow;
        root.style.overflow = 'hidden';
        return () => {
            root.style.overflow = before;
            if (el.open) el.close();
        };
    }, []);

    const name = `${title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'documento'}.pdf`;

    return (
        <dialog
            ref={dialog}
            aria-label={title}
            onClose={onClose}
            onClick={(e) => e.target === dialog.current && dialog.current?.close()}
            className="m-auto flex h-[min(52rem,calc(100dvh-1.5rem))] w-[min(60rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border-0 bg-[var(--c-background)] p-0 text-[var(--c-text)] shadow-2xl backdrop:bg-[#0a0928]/75 backdrop:backdrop-blur-sm"
        >
            <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] px-4 py-3">
                <h2 className="min-w-0 flex-1 truncate font-[family-name:var(--font-head)] text-base font-extrabold">{title}</h2>
                <a
                    href={file}
                    download={name}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--c-primary)] px-3 py-2 text-sm font-bold text-[var(--c-on-primary)] transition hover:brightness-110"
                >
                    <Download size={16} aria-hidden />
                    Descargar
                </a>
                <a
                    href={file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--c-text)_20%,transparent)] px-3 py-2 text-sm font-bold transition hover:bg-[var(--c-surface)]"
                >
                    <ExternalLink size={16} aria-hidden />
                    Abrir en otra pestaña
                </a>
                <button
                    type="button"
                    onClick={() => dialog.current?.close()}
                    aria-label="Cerrar"
                    className="grid size-9 cursor-pointer place-items-center rounded-full transition hover:bg-[var(--c-surface)]"
                >
                    <X size={20} aria-hidden />
                </button>
            </header>
            <object data={`${file}#view=FitH`} type="application/pdf" className="min-h-0 w-full flex-1" aria-label={title}>
                <p className="p-6 text-sm">
                    Tu navegador no puede mostrar el PDF aquí.{' '}
                    <a href={file} download={name} className="font-bold text-[var(--c-primary)] underline">
                        Descárgalo
                    </a>{' '}
                    o{' '}
                    <a href={file} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--c-primary)] underline">
                        ábrelo en otra pestaña
                    </a>
                    .
                </p>
            </object>
        </dialog>
    );
}
