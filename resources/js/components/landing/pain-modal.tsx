import { ICONS } from '@/components/landing/icons';
import { Rich } from '@/components/landing/rich';
import { ctaHref, ctaOf, list, text, type CtaContext } from '@/lib/landing';
import { type Json } from '@/types/cms';
import { ArrowRight, Check, Download, FileText, PlayCircle, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const str = (v: Json | undefined): string => (typeof v === 'string' ? v : '');

type Video = { kind: 'iframe' | 'file'; src: string };

/** Convierte el enlace del panel en algo que se pueda mostrar: YouTube y Vimeo incrustados, o un MP4/WebM subido. */
export function videoSource(url: string): Video | null {
    if (!url) return null;
    if (/^\/uploads\/[\w.-]+\.(mp4|webm)$/i.test(url)) return { kind: 'file', src: url };
    let u: URL;
    try {
        u = new URL(url);
    } catch {
        return null;
    }
    const host = u.hostname.replace(/^www\.|^m\./, '');
    const id = /^[\w-]{6,20}$/;
    if (host === 'youtu.be') {
        const v = u.pathname.slice(1).split('/')[0];
        return id.test(v) ? { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${v}?rel=0` } : null;
    }
    if (host === 'youtube.com') {
        const parts = u.pathname.split('/').filter(Boolean);
        const v = u.searchParams.get('v') ?? (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : '');
        return id.test(v ?? '') ? { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${v}?rel=0` } : null;
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
        const v = u.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p));
        return v ? { kind: 'iframe', src: `https://player.vimeo.com/video/${v}` } : null;
    }
    return null;
}

/** ¿La tarjeta tiene algo más que mostrar al abrirla? */
export function hasDetail(it: Record<string, Json>): boolean {
    return Boolean(str(it.detail_text).replace(/<[^>]*>/g, '').trim() || str(it.detail_points).trim() || list(it, 'gallery').some((g) => str(g.image)) || videoSource(str(it.video)) || list(it, 'docs').some((d) => str(d.file)));
}

interface Slide {
    type: 'video' | 'image';
    video?: Video;
    src?: string;
    caption?: string;
}

/** Ventana con el detalle de una tarjeta: explicación, fotos, video, documentos y el botón de contacto. */
export function PainModal({ item, content, ctx, onClose }: { item: Record<string, Json>; content: Record<string, Json>; ctx: CtaContext; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [active, setActive] = useState(0);

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

    const Icon = ICONS[str(item.icon)];
    const video = videoSource(str(item.video));
    const slides: Slide[] = [
        ...(video ? [{ type: 'video', video } as Slide] : []),
        ...list(item, 'gallery')
            .filter((g) => str(g.image))
            .map((g) => ({ type: 'image', src: str(g.image), caption: str(g.caption) }) as Slide),
    ];
    const current = slides[Math.min(active, Math.max(slides.length - 1, 0))];
    const points = str(item.detail_points)
        .split(/\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    const docs = list(item, 'docs').filter((d) => str(d.file));
    const cta = ctaOf(content, 'modal_cta');
    const detail = str(item.detail_text);

    return (
        <dialog
            ref={dialog}
            aria-labelledby="pain-modal-title"
            onClose={onClose}
            onClick={(e) => e.target === dialog.current && dialog.current?.close()}
            className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(66rem,calc(100vw-1.5rem))] overflow-y-auto overflow-x-hidden rounded-[1.75rem] border-0 bg-[var(--c-background)] p-0 text-left text-[var(--c-text)] shadow-2xl duration-300 backdrop:bg-[#0a0928]/75 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 [--tone:var(--c-primary)]"
        >
            <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                {/* Foto, video o ilustración */}
                <div className="relative isolate flex min-h-64 flex-col bg-[var(--c-dark)] text-[var(--c-on-dark)] md:min-h-[32rem]">
                    <div className="relative flex-1">
                        {current?.type === 'video' && current.video ? (
                            current.video.kind === 'iframe' ? (
                                <iframe
                                    key={current.video.src}
                                    src={current.video.src}
                                    title={str(item.title)}
                                    loading="lazy"
                                    allow="encrypted-media; picture-in-picture; fullscreen"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="absolute inset-0 size-full border-0"
                                />
                            ) : (
                                <video key={current.video.src} src={current.video.src} controls preload="metadata" playsInline className="absolute inset-0 size-full bg-black object-contain" />
                            )
                        ) : current?.type === 'image' ? (
                            <figure className="absolute inset-0 m-0">
                                <img key={current.src} src={current.src} alt={current.caption ?? ''} className="size-full object-cover duration-500 motion-safe:animate-in motion-safe:fade-in" />
                                {current.caption && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-10 text-sm font-semibold text-white">{current.caption}</figcaption>}
                            </figure>
                        ) : (
                            <div aria-hidden className="absolute inset-0 overflow-hidden">
                                <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--c-accent)_35%,transparent)_1.2px,transparent_0)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom_right,transparent_5%,#000_85%)]" />
                                <span className="absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--c-accent)] opacity-0 motion-safe:animate-pain-ring" />
                                <span className="absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--c-accent)] opacity-0 [animation-delay:1.6s] motion-safe:animate-pain-ring" />
                                {Icon && <Icon strokeWidth={1.1} className="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 text-[var(--c-accent)] opacity-40 motion-safe:animate-pain-float" />}
                            </div>
                        )}
                    </div>

                    {slides.length > 1 && (
                        <div className="relative z-10 flex gap-2 overflow-x-auto bg-[var(--c-dark)] p-3" role="tablist" aria-label="Fotos y video">
                            {slides.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    role="tab"
                                    aria-selected={i === active}
                                    aria-label={s.type === 'video' ? 'Ver el video' : `Ver la foto ${s.caption || i + 1}`}
                                    onClick={() => setActive(i)}
                                    className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition duration-200 ${i === active ? 'border-[var(--c-accent)]' : 'border-transparent opacity-65 hover:opacity-100'}`}
                                >
                                    {s.type === 'video' ? (
                                        <span className="grid size-full place-items-center bg-white/10">
                                            <PlayCircle size={26} aria-hidden />
                                        </span>
                                    ) : (
                                        <img src={s.src} alt="" className="size-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detalle */}
                <div className="flex min-w-0 flex-col p-6 pt-14 md:p-9 md:pt-10">
                    {str(item.tag) && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--c-primary)]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--c-primary)]">
                            {Icon && <Icon size={14} aria-hidden />}
                            {str(item.tag)}
                        </span>
                    )}
                    <h3 id="pain-modal-title" className="mt-3 font-[family-name:var(--font-head)] text-2xl font-extrabold leading-tight tracking-tight md:text-[1.75rem]">
                        {str(item.title)}
                    </h3>
                    {str(item.text) && <p className="mt-3 text-[15px] leading-relaxed text-[var(--c-muted)]">{str(item.text)}</p>}

                    {detail && <Rich className="mt-4 space-y-3 text-[15px] leading-relaxed [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:my-0" html={detail} />}

                    {points.length > 0 && (
                        <ul className="mt-5 grid gap-2.5">
                            {points.map((p) => (
                                <li key={p} className="flex items-start gap-3 text-[15px] font-medium leading-snug">
                                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#059669] text-white">
                                        <Check size={13} strokeWidth={3.2} aria-hidden />
                                    </span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    )}

                    {str(item.solution) && (
                        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-[var(--c-primary)]/25 bg-[var(--c-primary)]/8 p-3.5 text-sm font-bold leading-snug">
                            <ArrowRight size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--c-primary)]" />
                            {str(item.solution)}
                        </p>
                    )}

                    {docs.length > 0 && (
                        <div className="mt-6">
                            <h4 className="mb-2.5 font-[family-name:var(--font-head)] text-xs font-extrabold uppercase tracking-wider text-[var(--c-muted)]">Documentos</h4>
                            <ul className="grid gap-2">
                                {docs.map((d, i) => {
                                    const ext = (str(d.file).split('.').pop() ?? '').toUpperCase();
                                    return (
                                        <li key={i}>
                                            <a
                                                href={str(d.file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="group/doc flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--c-text)_14%,transparent)] bg-[var(--c-surface)] p-3 transition duration-200 hover:border-[var(--c-primary)]/50 hover:shadow-md"
                                            >
                                                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--c-primary)]/10 text-[var(--c-primary)]">
                                                    <FileText size={20} aria-hidden />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-bold">{str(d.label) || 'Documento'}</span>
                                                    <span className="text-xs text-[var(--c-muted)]">{ext}</span>
                                                </span>
                                                <Download size={18} aria-hidden className="shrink-0 text-[var(--c-primary)] transition duration-200 group-hover/doc:translate-y-0.5" />
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {cta && (
                        <a
                            href={ctaHref(cta, ctx)}
                            onClick={() => dialog.current?.close()}
                            className="group/cta mt-7 inline-flex w-fit items-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-primary)] px-5 py-3 font-[family-name:var(--font-head)] text-sm font-bold text-[var(--c-on-primary)] transition duration-300 hover:brightness-110 motion-safe:hover:-translate-y-0.5"
                        >
                            {cta.label}
                            <ArrowRight size={18} aria-hidden className="transition duration-300 group-hover/cta:translate-x-1" />
                        </a>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label={text(content, 'close_label') || 'Cerrar'}
                className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-[var(--c-background)]/95 text-[var(--c-text)] shadow-lg transition duration-200 hover:scale-110 hover:rotate-90"
            >
                <X size={20} aria-hidden />
            </button>
        </dialog>
    );
}
