import { ICONS } from '@/components/landing/icons';
import { hasDetail, PainModal, videoSource } from '@/components/landing/pain-modal';
import { list, text, type CtaContext } from '@/lib/landing';
import { type Json } from '@/types/cms';
import { ArrowRight, FileText, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { useState, type CSSProperties } from 'react';

/** Cada color define --tone; el resto de la tarjeta se tiñe con ese valor. */
const TONES: Record<string, string> = {
    rose: '[--tone:#e11d48]',
    amber: '[--tone:#d97706]',
    blue: '[--tone:var(--c-primary)]',
    green: '[--tone:#059669]',
};

/** Cuántas tarjetas por fila en pantalla grande (la última fila queda centrada). */
const COLS: Record<number, string> = {
    2: 'lg:basis-[calc((100%-1.25rem)/2)]',
    3: 'lg:basis-[calc((100%-2.5rem)/3)]',
    4: 'lg:basis-[calc((100%-3.75rem)/4)]',
};

const str = (v: Json | undefined): string => (typeof v === 'string' ? v : '');

export function PainCards({ content, ctx }: { content: Record<string, Json>; ctx: CtaContext }) {
    const items = list(content, 'items').filter((it) => str(it.title));
    const cols = Math.min(4, Math.max(2, parseInt(text(content, 'columns'), 10) || 3));
    const [open, setOpen] = useState<number | null>(null);
    const moreLabel = text(content, 'more_label') || 'Ver más detalle';

    return (
        <>
            <ul className="mx-0 mt-8 flex list-none flex-wrap justify-center gap-5 p-0 lg:mt-12">
                {items.map((it, i) => {
                    const Icon = ICONS[str(it.icon)];
                    const image = str(it.image);
                    return (
                        <li
                            key={i}
                            data-reveal="up"
                            style={{ '--d': `${(i % cols) * 110}ms` } as CSSProperties}
                            className={`group relative flex shrink-0 grow-0 basis-full flex-col overflow-hidden rounded-[1.4rem] border border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] text-left text-[var(--c-text)] hover:border-[color-mix(in_srgb,var(--tone)_50%,transparent)] hover:shadow-[0_26px_44px_-26px_var(--tone)] motion-safe:hover:-translate-y-1.5 sm:basis-[calc((100%-1.25rem)/2)] ${COLS[cols]} ${TONES[str(it.tone)] ?? TONES.rose}`}
                        >
                            {/* Foto o ilustración animada */}
                            <div className="relative">
                                <div className="relative h-40 overflow-hidden bg-[color-mix(in_srgb,var(--tone)_9%,var(--c-background))]">
                                    {image ? (
                                        <>
                                            <img
                                                src={image}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-cover transition duration-700 ease-out group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tone)_55%,transparent)] via-transparent to-transparent" />
                                        </>
                                    ) : (
                                        <div aria-hidden className="absolute inset-0">
                                            {/* trama de puntos */}
                                            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--tone)_32%,transparent)_1.2px,transparent_0)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom_right,transparent_5%,#000_80%)]" />
                                            {/* ondas que salen del ícono */}
                                            <span className="motion-safe:animate-pain-ring absolute top-1/2 right-12 size-28 -translate-y-1/2 rounded-full border-2 border-[var(--tone)] opacity-0" />
                                            <span className="motion-safe:animate-pain-ring absolute top-1/2 right-12 size-28 -translate-y-1/2 rounded-full border-2 border-[var(--tone)] opacity-0 [animation-delay:1.6s]" />
                                            {/* ícono grande que flota */}
                                            {Icon && (
                                                <Icon
                                                    strokeWidth={1.4}
                                                    className="motion-safe:animate-pain-float absolute top-1/2 right-6 size-32 -translate-y-1/2 text-[var(--tone)] opacity-25 transition duration-500 group-hover:opacity-40"
                                                />
                                            )}
                                            {!Icon && str(it.icon) && (
                                                <span className="absolute top-1/2 right-8 -translate-y-1/2 text-7xl opacity-60">{str(it.icon)}</span>
                                            )}
                                        </div>
                                    )}
                                    {str(it.tag) && (
                                        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--c-background)]/90 px-3 py-1 font-[family-name:var(--font-head)] text-[11px] font-extrabold tracking-wider text-[var(--tone)] uppercase shadow-sm backdrop-blur">
                                            <i className="size-1.5 rounded-full bg-[var(--tone)] motion-safe:animate-pulse" />
                                            {str(it.tag)}
                                        </span>
                                    )}
                                </div>
                                {/* insignia del ícono, montada sobre el borde de la imagen */}
                                {Icon && (
                                    <span className="absolute -bottom-7 left-5 grid size-14 place-items-center rounded-2xl bg-[var(--tone)] text-white shadow-lg ring-4 ring-[var(--c-background)] transition duration-300 group-hover:scale-110 motion-safe:group-hover:-rotate-6">
                                        <Icon size={26} strokeWidth={2.1} aria-hidden />
                                    </span>
                                )}
                            </div>

                            <div className="px-5 pt-10 pb-5">
                                <h3 className="font-[family-name:var(--font-head)] text-[1.2rem] leading-tight font-extrabold tracking-tight">
                                    {str(it.title)}
                                </h3>
                                {str(it.text) && <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--c-muted)]">{str(it.text)}</p>}
                                {hasDetail(it) && (
                                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {/* El botón cubre toda la tarjeta: se puede hacer clic en cualquier parte. */}
                                        <button
                                            type="button"
                                            onClick={() => setOpen(i)}
                                            aria-haspopup="dialog"
                                            className="inline-flex cursor-pointer items-center gap-1.5 font-[family-name:var(--font-head)] text-sm font-extrabold text-[var(--tone)] after:absolute after:inset-0 after:rounded-[1.4rem] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--tone)]"
                                        >
                                            {moreLabel}
                                            <ArrowRight size={16} aria-hidden className="transition duration-300 group-hover:translate-x-1" />
                                        </button>
                                        <span className="inline-flex items-center gap-3 text-xs font-semibold text-[var(--c-muted)]" aria-hidden>
                                            {videoSource(str(it.video)) && (
                                                <span className="inline-flex items-center gap-1">
                                                    <PlayCircle size={14} /> Video
                                                </span>
                                            )}
                                            {list(it, 'gallery').filter((g) => str(g.image)).length > 0 && (
                                                <span className="inline-flex items-center gap-1">
                                                    <ImageIcon size={14} /> {list(it, 'gallery').filter((g) => str(g.image)).length}
                                                </span>
                                            )}
                                            {list(it, 'docs').filter((d) => str(d.file)).length > 0 && (
                                                <span className="inline-flex items-center gap-1">
                                                    <FileText size={14} /> {list(it, 'docs').filter((d) => str(d.file)).length}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {str(it.solution) && (
                                <p className="mt-auto flex items-start gap-2.5 border-t border-[color-mix(in_srgb,var(--tone)_22%,transparent)] bg-[color-mix(in_srgb,var(--tone)_10%,var(--c-background))] px-5 py-3.5 text-sm leading-snug font-bold">
                                    <ArrowRight
                                        size={16}
                                        aria-hidden
                                        className="mt-0.5 shrink-0 text-[var(--tone)] transition duration-300 group-hover:translate-x-1.5"
                                    />
                                    <span>{str(it.solution)}</span>
                                </p>
                            )}
                        </li>
                    );
                })}
            </ul>
            {open !== null && items[open] && <PainModal key={open} item={items[open]} content={content} ctx={ctx} onClose={() => setOpen(null)} />}
        </>
    );
}

export function PainsEyebrow({ label, tone = 'rose' }: { label: string; tone?: 'rose' | 'blue' }) {
    if (!label) return null;
    const color =
        tone === 'blue'
            ? 'border-[var(--c-primary)]/35 bg-[var(--c-primary)]/10 text-[var(--c-primary)]'
            : 'border-[#e11d48]/35 bg-[#e11d48]/10 text-[#be123c]';
    return (
        <p
            data-reveal="head"
            className={`mb-4 w-fit rounded-full border px-4 py-1.5 font-[family-name:var(--font-head)] text-xs font-extrabold tracking-wider uppercase [.lp-align-center_&]:mx-auto [.lp-align-right_&]:ml-auto ${color}`}
        >
            {label}
        </p>
    );
}
