import { Rich } from '@/components/landing/rich';
import { type FooterDoc } from '@/types/cms';
import { Download, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Nombre de archivo para la descarga: «Términos y Condiciones» → «Términos-y-Condiciones.pdf». */
export function docFileName(label: string): string {
    return `${label.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'documento'}.pdf`;
}

/**
 * Ventana de un documento legal: su texto, y si tiene PDF, un ícono para descargarlo y la opción de verlo completo.
 * Con solo texto se lee el texto; con solo PDF se abre el PDF; sin ninguno avisa que estará disponible pronto.
 */
export function DocModal({ doc, onClose }: { doc: FooterDoc; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const text = doc.text ?? '';
    const hasText = text.replace(/<[^>]*>/g, '').trim() !== '';
    const hasPdf = Boolean(doc.file);
    const [view, setView] = useState<'text' | 'pdf'>(hasText || !hasPdf ? 'text' : 'pdf');

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

    const tab = (value: 'text' | 'pdf', label: string) => (
        <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => setView(value)}
            className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-bold transition ${view === value ? 'bg-[var(--c-primary)] text-[var(--c-on-primary)]' : 'hover:bg-[var(--c-surface)]'}`}
        >
            {label}
        </button>
    );

    return (
        <dialog
            ref={dialog}
            aria-label={doc.label}
            onClose={onClose}
            onClick={(e) => e.target === dialog.current && dialog.current?.close()}
            className="m-auto flex h-[min(50rem,calc(100dvh-1.5rem))] w-[min(56rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border-0 bg-[var(--c-background)] p-0 text-left text-[var(--c-text)] shadow-2xl backdrop:bg-[#0a0928]/75 backdrop:backdrop-blur-sm"
        >
            <header className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--c-primary)] text-[var(--c-on-primary)]">
                    <FileText size={20} aria-hidden />
                </span>
                <h2 className="min-w-0 flex-1 truncate font-[family-name:var(--font-head)] text-lg font-extrabold">{doc.label}</h2>
                {hasPdf && (
                    <>
                        <a
                            href={doc.file as string}
                            download={docFileName(doc.label)}
                            title="Descargar PDF"
                            aria-label="Descargar PDF"
                            className="grid size-10 place-items-center rounded-full bg-[var(--c-primary)] text-[var(--c-on-primary)] transition hover:brightness-110"
                        >
                            <Download size={20} aria-hidden />
                        </a>
                        <a
                            href={doc.file as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir el PDF en otra pestaña"
                            aria-label="Abrir el PDF en otra pestaña"
                            className="grid size-10 place-items-center rounded-full transition hover:bg-[var(--c-surface)]"
                        >
                            <ExternalLink size={20} aria-hidden />
                        </a>
                    </>
                )}
                <button type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar" className="grid size-10 cursor-pointer place-items-center rounded-full transition hover:bg-[var(--c-surface)]">
                    <X size={20} aria-hidden />
                </button>
            </header>

            {hasText && hasPdf && (
                <div role="tablist" aria-label="Formato del documento" className="flex gap-1 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] px-4 py-2">
                    {tab('text', 'Texto')}
                    {tab('pdf', 'PDF')}
                </div>
            )}

            {view === 'pdf' && hasPdf ? (
                <object data={`${doc.file}#view=FitH`} type="application/pdf" className="min-h-0 w-full flex-1" aria-label={doc.label}>
                    <p className="p-6 text-sm">
                        Tu navegador no puede mostrar el PDF aquí.{' '}
                        <a href={doc.file as string} download={docFileName(doc.label)} className="font-bold text-[var(--c-primary)] underline">
                            Descárgalo
                        </a>
                        .
                    </p>
                </object>
            ) : hasText ? (
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-9">
                    <Rich className="space-y-3.5 text-[15px] leading-relaxed [&_a]:font-semibold [&_a]:text-[var(--c-primary)] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-0 [&_ul]:list-disc [&_ul]:pl-6" html={text} />
                </div>
            ) : (
                <div className="grid flex-1 place-items-center px-6 py-10 text-center">
                    <div className="grid max-w-sm justify-items-center gap-3">
                        <span className="grid size-14 place-items-center rounded-full bg-[var(--c-surface)] text-[var(--c-primary)]">
                            <FileText size={28} aria-hidden />
                        </span>
                        <p className="font-[family-name:var(--font-head)] text-lg font-extrabold">Este documento estará disponible pronto</p>
                        <p className="text-sm text-[var(--c-muted)]">Si lo necesitas ahora, escríbenos y te lo enviamos.</p>
                    </div>
                </div>
            )}
        </dialog>
    );
}
