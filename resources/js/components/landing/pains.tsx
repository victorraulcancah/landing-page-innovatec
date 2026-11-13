import { list, text } from '@/lib/landing';
import { type Json } from '@/types/cms';
import {
    AlertTriangle,
    ArrowRight,
    Camera,
    Clock,
    Cloud,
    DatabaseZap,
    Hourglass,
    Laptop,
    LockOpen,
    type LucideIcon,
    Mail,
    PhoneCall,
    Printer,
    Receipt,
    Server,
    ShieldAlert,
    Users,
    Wifi,
} from 'lucide-react';
import { type CSSProperties } from 'react';

/** Íconos que se pueden elegir en el panel (las llaves son las de SectionTypes::PAIN_ICONS). */
const ICONS: Record<string, LucideIcon> = {
    hourglass: Hourglass,
    clock: Clock,
    wifi: Wifi,
    phone: PhoneCall,
    data: DatabaseZap,
    lock: LockOpen,
    receipt: Receipt,
    server: Server,
    laptop: Laptop,
    printer: Printer,
    shield: ShieldAlert,
    mail: Mail,
    users: Users,
    cloud: Cloud,
    camera: Camera,
    alert: AlertTriangle,
};

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

export function PainCards({ content }: { content: Record<string, Json> }) {
    const items = list(content, 'items').filter((it) => str(it.title));
    const cols = Math.min(4, Math.max(2, parseInt(text(content, 'columns'), 10) || 3));

    return (
        <ul className="mx-0 mt-8 flex list-none flex-wrap justify-center gap-5 p-0 lg:mt-12">
            {items.map((it, i) => {
                const Icon = ICONS[str(it.icon)];
                const image = str(it.image);
                return (
                    <li
                        key={i}
                        data-reveal="up"
                        style={{ '--d': `${(i % cols) * 110}ms` } as CSSProperties}
                        className={`group relative flex shrink-0 grow-0 basis-full flex-col overflow-hidden rounded-[1.4rem] border border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] text-left text-[var(--c-text)] motion-safe:hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--tone)_50%,transparent)] hover:shadow-[0_26px_44px_-26px_var(--tone)] sm:basis-[calc((100%-1.25rem)/2)] ${COLS[cols]} ${TONES[str(it.tone)] ?? TONES.rose}`}
                    >
                        {/* Foto o ilustración animada */}
                        <div className="relative">
                            <div className="relative h-40 overflow-hidden bg-[color-mix(in_srgb,var(--tone)_9%,var(--c-background))]">
                                {image ? (
                                    <>
                                        <img src={image} alt="" loading="lazy" className="size-full object-cover transition duration-700 ease-out group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tone)_55%,transparent)] via-transparent to-transparent" />
                                    </>
                                ) : (
                                    <div aria-hidden className="absolute inset-0">
                                        {/* trama de puntos */}
                                        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--tone)_32%,transparent)_1.2px,transparent_0)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom_right,transparent_5%,#000_80%)]" />
                                        {/* ondas que salen del ícono */}
                                        <span className="absolute right-12 top-1/2 size-28 -translate-y-1/2 rounded-full border-2 border-[var(--tone)] opacity-0 motion-safe:animate-pain-ring" />
                                        <span className="absolute right-12 top-1/2 size-28 -translate-y-1/2 rounded-full border-2 border-[var(--tone)] opacity-0 [animation-delay:1.6s] motion-safe:animate-pain-ring" />
                                        {/* ícono grande que flota */}
                                        {Icon && <Icon strokeWidth={1.4} className="absolute right-6 top-1/2 size-32 -translate-y-1/2 text-[var(--tone)] opacity-25 transition duration-500 group-hover:opacity-40 motion-safe:animate-pain-float" />}
                                        {!Icon && str(it.icon) && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-7xl opacity-60">{str(it.icon)}</span>}
                                    </div>
                                )}
                                {str(it.tag) && (
                                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--c-background)]/90 px-3 py-1 font-[family-name:var(--font-head)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--tone)] shadow-sm backdrop-blur">
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

                        <div className="px-5 pb-5 pt-10">
                            <h3 className="font-[family-name:var(--font-head)] text-[1.2rem] font-extrabold leading-tight tracking-tight">{str(it.title)}</h3>
                            {str(it.text) && <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--c-muted)]">{str(it.text)}</p>}
                        </div>

                        {str(it.solution) && (
                            <p className="mt-auto flex items-start gap-2.5 border-t border-[color-mix(in_srgb,var(--tone)_22%,transparent)] bg-[color-mix(in_srgb,var(--tone)_10%,var(--c-background))] px-5 py-3.5 text-sm font-bold leading-snug">
                                <ArrowRight size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--tone)] transition duration-300 group-hover:translate-x-1.5" />
                                <span>{str(it.solution)}</span>
                            </p>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

export function PainsEyebrow({ label }: { label: string }) {
    if (!label) return null;
    return (
        <p
            data-reveal="head"
            className="mb-4 w-fit rounded-full border border-[#e11d48]/35 bg-[#e11d48]/10 px-4 py-1.5 font-[family-name:var(--font-head)] text-xs font-extrabold uppercase tracking-wider text-[#be123c] [.lp-align-center_&]:mx-auto [.lp-align-right_&]:ml-auto"
        >
            {label}
        </p>
    );
}
