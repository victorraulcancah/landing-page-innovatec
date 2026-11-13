import { ICONS } from '@/components/landing/icons';
import { ctaHref, ctaOf, list, type CtaContext } from '@/lib/landing';
import { type Json } from '@/types/cms';
import { ArrowRight, Check } from 'lucide-react';
import { type CSSProperties, type KeyboardEvent, useRef, useState } from 'react';

const str = (v: Json | undefined): string => (typeof v === 'string' ? v : '');

/** «Qué incluye cada mes»: pestañas por pilar y, debajo, el detalle del pilar elegido. */
export function PillarTabs({ content, ctx }: { content: Record<string, Json>; ctx: CtaContext }) {
    const items = list(content, 'items').filter((it) => str(it.title) || str(it.tab_title));
    const [active, setActive] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const cta = ctaOf(content, 'cta');
    if (items.length === 0) return null;

    const current = items[Math.min(active, items.length - 1)];
    const cards = list(current, 'cards');
    const rows = list(current, 'rows');
    const Icon = ICONS[str(current.icon)];
    const image = str(current.image);
    const heads = [str(current.head_a), str(current.head_b), str(current.head_c)];
    const flow = 'lg:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_minmax(0,1.25fr)]';

    const go = (to: number) => {
        const next = (to + items.length) % items.length;
        setActive(next);
        tabs.current[next]?.focus();
    };
    const onKey = (e: KeyboardEvent, i: number) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            go(i + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            go(i - 1);
        }
    };

    return (
        <div className="text-left">
            {/* Pestañas */}
            <div role="tablist" aria-label="Pilares del servicio" className={`grid gap-3 sm:grid-cols-2 ${items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : ''}`}>
                {items.map((it, i) => {
                    const on = i === active;
                    const TabIcon = ICONS[str(it.icon)];
                    return (
                        <button
                            key={i}
                            ref={(el) => {
                                tabs.current[i] = el;
                            }}
                            type="button"
                            role="tab"
                            id={`pillar-tab-${i}`}
                            aria-selected={on}
                            aria-controls="pillar-panel"
                            tabIndex={on ? 0 : -1}
                            onClick={() => setActive(i)}
                            onKeyDown={(e) => onKey(e, i)}
                            data-reveal="up"
                            style={{ '--d': `${i * 90}ms` } as CSSProperties}
                            className={`group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border p-4 pb-5 text-left transition duration-300 motion-safe:hover:-translate-y-1 ${
                                on
                                    ? 'border-[var(--c-accent)] bg-[var(--c-dark)] text-[var(--c-on-dark)] shadow-2xl'
                                    : 'border-[color-mix(in_srgb,var(--c-text)_14%,transparent)] bg-[var(--c-background)] text-[var(--c-text)] hover:border-[var(--c-primary)]/50 hover:shadow-lg'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                <span
                                    className={`grid size-11 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-110 motion-safe:group-hover:-rotate-6 ${
                                        on ? 'bg-[var(--c-accent)] text-[var(--c-dark)]' : 'bg-[var(--c-primary)]/12 text-[var(--c-primary)]'
                                    }`}
                                >
                                    {TabIcon && <TabIcon size={22} strokeWidth={2.1} aria-hidden />}
                                </span>
                                {str(it.tab_tag) && (
                                    <span className={`text-[11px] font-extrabold uppercase leading-tight tracking-wider ${on ? 'text-[var(--c-accent)]' : 'text-[var(--c-primary)]'}`}>{str(it.tab_tag)}</span>
                                )}
                            </span>
                            <span className="block font-[family-name:var(--font-head)] text-base font-bold leading-snug">{str(it.tab_title)}</span>
                            {str(it.tab_text) && <span className={`block text-[13px] leading-snug ${on ? 'opacity-75' : 'text-[var(--c-muted)]'}`}>{str(it.tab_text)}</span>}
                            <span aria-hidden className={`absolute bottom-0 left-0 h-1 bg-[var(--c-accent)] transition-all duration-500 ease-out ${on ? 'w-full' : 'w-0'}`} />
                        </button>
                    );
                })}
            </div>

            {/* Detalle del pilar */}
            <div
                key={active}
                role="tabpanel"
                id="pillar-panel"
                aria-labelledby={`pillar-tab-${active}`}
                className="mt-6 grid overflow-hidden rounded-[1.75rem] border border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] text-[var(--c-text)] shadow-xl duration-500 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
            >
                <div className="relative isolate flex min-h-[20rem] flex-col justify-between gap-8 overflow-hidden bg-[var(--c-dark)] p-7 text-[var(--c-on-dark)] lg:p-10">
                    {image ? (
                        <>
                            <img src={image} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover opacity-45" />
                            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--c-dark)] via-[var(--c-dark)]/60 to-transparent" />
                        </>
                    ) : (
                        <div aria-hidden className="absolute inset-0 -z-10">
                            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--c-accent)_35%,transparent)_1.2px,transparent_0)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom_left,#000_5%,transparent_75%)]" />
                            <span className="absolute -right-6 top-1/3 size-56 rounded-full border-2 border-[var(--c-accent)] opacity-0 motion-safe:animate-pain-ring" />
                            <span className="absolute -right-6 top-1/3 size-56 rounded-full border-2 border-[var(--c-accent)] opacity-0 [animation-delay:1.6s] motion-safe:animate-pain-ring" />
                            {Icon && <Icon strokeWidth={1.2} className="absolute -right-4 top-[18%] size-52 text-[var(--c-accent)] opacity-20 motion-safe:animate-pain-float" />}
                        </div>
                    )}

                    <div>
                        {str(current.tag) && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--c-accent)]/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--c-accent)]">
                                <i className="size-1.5 rounded-full bg-[var(--c-accent)] motion-safe:animate-pulse" />
                                {str(current.tag)}
                            </span>
                        )}
                        <h3 className="mt-4 font-[family-name:var(--font-head)] text-2xl font-extrabold leading-tight tracking-tight lg:text-[2rem]">{str(current.title)}</h3>
                    </div>

                    {cta && (
                        <a
                            href={ctaHref(cta, ctx)}
                            className="group/cta inline-flex w-fit items-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-accent)] px-5 py-3 font-[family-name:var(--font-head)] text-sm font-bold text-[var(--c-dark)] transition duration-300 hover:brightness-110 motion-safe:hover:-translate-y-0.5"
                        >
                            {cta.label}
                            <ArrowRight size={18} aria-hidden className="transition duration-300 group-hover/cta:translate-x-1" />
                        </a>
                    )}
                </div>

                <ol className="grid content-center gap-3.5 p-6 lg:p-9">
                    {cards.map((c, i) => (
                        <li
                            key={i}
                            style={{ animationDelay: `${150 + i * 130}ms` }}
                            className="flex gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] bg-[var(--c-surface)] p-4 transition duration-300 fill-mode-backwards hover:border-[var(--c-primary)]/40 hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:hover:translate-x-1"
                        >
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--c-primary)] font-[family-name:var(--font-head)] text-sm font-extrabold text-white">{i + 1}</span>
                            <span className="block">
                                <span className="block font-[family-name:var(--font-head)] text-[1.05rem] font-bold leading-snug">{str(c.title)}</span>
                                {str(c.text) && <span className="mt-1.5 block text-[14.5px] leading-relaxed text-[var(--c-muted)]">{str(c.text)}</span>}
                            </span>
                        </li>
                    ))}
                </ol>

                {rows.length > 0 && (
                    <div className="border-t border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--c-primary)_5%,var(--c-background))] p-6 lg:col-span-2 lg:p-9">
                        {str(current.question) && <h4 className="mb-5 font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wider text-[var(--c-primary)]">{str(current.question)}</h4>}
                        <div className={`mb-2 hidden gap-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--c-muted)] lg:grid ${flow}`}>
                            <span>{heads[0]}</span>
                            <span />
                            <span>{heads[1]}</span>
                            <span />
                            <span>{heads[2]}</span>
                        </div>
                        <ul className="grid gap-3">
                            {rows.map((r, i) => (
                                <li
                                    key={i}
                                    style={{ animationDelay: `${300 + i * 130}ms` }}
                                    className={`grid items-stretch gap-1.5 fill-mode-backwards motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 lg:gap-2 ${flow}`}
                                >
                                    <p className="rounded-xl border border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] p-3.5 text-sm font-bold leading-snug">
                                        <small className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[var(--c-muted)] lg:hidden">{heads[0]}</small>
                                        {str(r.a)}
                                    </p>
                                    <ArrowRight aria-hidden size={18} className="m-auto rotate-90 text-[var(--c-primary)] motion-safe:animate-pulse lg:rotate-0" />
                                    <p className="rounded-xl border border-[var(--c-primary)]/25 bg-[var(--c-primary)]/8 p-3.5 text-sm font-semibold leading-snug text-[var(--c-primary)]">
                                        <small className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider opacity-70 lg:hidden">{heads[1]}</small>
                                        {str(r.b)}
                                    </p>
                                    <ArrowRight aria-hidden size={18} className="m-auto rotate-90 text-[var(--c-primary)] motion-safe:animate-pulse lg:rotate-0" />
                                    <p className="flex items-start gap-2.5 rounded-xl border border-[#059669]/30 bg-[#059669]/10 p-3.5 text-sm font-semibold leading-snug">
                                        <Check size={18} strokeWidth={3} aria-hidden className="mt-0.5 shrink-0 text-[#059669]" />
                                        <span>
                                            <small className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#047857] lg:hidden">{heads[2]}</small>
                                            {str(r.c)}
                                        </span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
