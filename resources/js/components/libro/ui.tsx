import { whatsappHref } from '@/lib/landing';
import { type ContactData } from '@/types/cms';
import { BookOpenText, CircleAlert, FileText, Headset, ImagePlus, Mail, MessageCircle, Phone, ShieldCheck, Video, X, type LucideIcon } from 'lucide-react';
import { type ReactNode, useId, useRef } from 'react';

/** Estilo común de los campos de texto, listas y áreas de texto del libro. */
export const INPUT =
    'w-full rounded-lg border border-[color-mix(in_srgb,var(--c-text)_28%,transparent)] bg-white px-3 py-2.5 text-[15px] text-[var(--c-text)] outline-none transition placeholder:text-[var(--c-muted)]/60 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/25 aria-[invalid=true]:border-[#e11d48] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#e11d48]/20';

export const CARD = 'rounded-2xl bg-white shadow-sm ring-1 ring-[color-mix(in_srgb,var(--c-text)_12%,transparent)]';

/** Encabezado en tarjeta de las páginas del libro. */
export function LibroHeader({ title = 'Libro de Reclamaciones', subtitle }: { title?: string; subtitle?: string }) {
    return (
        <div className={`${CARD} overflow-hidden`}>
            <div aria-hidden className="h-1.5 bg-gradient-to-r from-[var(--c-primary)] via-[var(--c-primary)] to-[var(--c-accent)]" />
            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--c-primary)] text-[var(--c-on-primary)] shadow-lg sm:size-16">
                        <BookOpenText className="size-7 sm:size-8" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h1 className="font-[family-name:var(--font-head)] text-xl font-extrabold uppercase tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-[var(--c-muted)] sm:text-base">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[var(--c-surface)] px-4 py-3 lg:max-w-sm print:hidden">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--c-accent)] text-[var(--c-dark)]">
                        <ShieldCheck className="size-5" aria-hidden />
                    </span>
                    <p className="text-sm leading-snug">
                        Cumplimos con el <strong>Código de Protección y Defensa del Consumidor</strong> (INDECOPI).
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Cada bloque del formulario es una tarjeta con su número y título. */
export function Block({ n, title, description, optional = false, cols = 'sm:grid-cols-2', children }: { n: number; title: string; description?: string; optional?: boolean; cols?: string; children: ReactNode }) {
    const id = useId();
    return (
        <section aria-labelledby={id} className={CARD}>
            <header className="flex items-start gap-3 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] px-5 py-4 sm:px-6">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--c-primary)] text-sm font-bold text-[var(--c-on-primary)]">{n}</span>
                <div className="min-w-0 pt-0.5">
                    <h2 id={id} className="font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wide sm:text-base">
                        {title}
                        {optional && <span className="ml-2 text-xs font-medium normal-case tracking-normal text-[var(--c-muted)]">(opcional)</span>}
                    </h2>
                    {description && <p className="mt-1 text-sm text-[var(--c-muted)]">{description}</p>}
                </div>
            </header>
            <div className={`grid gap-5 p-5 sm:p-6 ${cols}`}>{children}</div>
        </section>
    );
}

export function Field({ label, id, error, hint, required = false, className = '', children }: { label: string; id: string; error?: string; hint?: string; required?: boolean; className?: string; children: ReactNode }) {
    return (
        <div className={`grid content-start gap-1.5 ${className}`}>
            <label htmlFor={id} className="text-sm font-bold">
                {label}
                {required && <span className="text-[#e11d48]"> *</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-[var(--c-muted)]">{hint}</p>}
            {error && (
                <p role="alert" className="text-xs font-semibold text-[#be123c]">
                    {error}
                </p>
            )}
        </div>
    );
}

export function CheckRow({ id, checked, onChange, error, className = '', children }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; className?: string; children: ReactNode }) {
    return (
        <div className={className}>
            <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--c-primary)]" />
                <span>{children}</span>
            </label>
            {error && (
                <p role="alert" className="mt-1 pl-8 text-xs font-semibold text-[#be123c]">
                    {error}
                </p>
            )}
        </div>
    );
}

/** Tarjeta del panel lateral. «dark» usa el fondo oscuro del tema. */
export function SideCard({ icon: Icon, title, dark = false, children }: { icon: LucideIcon; title: string; dark?: boolean; children: ReactNode }) {
    return (
        <section className={`rounded-2xl p-5 shadow-sm ring-1 sm:p-6 ${dark ? 'bg-[var(--c-dark)] text-[var(--c-on-dark)] ring-[var(--c-dark)]' : 'bg-white ring-[color-mix(in_srgb,var(--c-text)_12%,transparent)]'}`}>
            <h2 className="mb-4 flex items-center gap-3 font-[family-name:var(--font-head)] text-base font-extrabold">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${dark ? 'bg-[var(--c-accent)] text-[var(--c-dark)]' : 'bg-[var(--c-surface)] text-[var(--c-primary)]'}`}>
                    <Icon className="size-5" aria-hidden />
                </span>
                {title}
            </h2>
            {children}
        </section>
    );
}

export function SideRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] py-2.5 text-sm last:border-0">
            <dt className="text-[var(--c-muted)]">{label}</dt>
            <dd className="text-right font-semibold">{children}</dd>
        </div>
    );
}

/** «¿Necesitas ayuda?»: canales de contacto de Ajustes del sitio. */
export function HelpCard({ contact }: { contact: ContactData }) {
    const wa = contact.whatsapp ? whatsappHref({ ...contact, whatsapp_message: 'Hola, necesito ayuda con el Libro de Reclamaciones' }) : null;
    const channels = [
        contact.phone && { icon: Phone, text: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}` },
        wa && { icon: MessageCircle, text: 'Escríbenos por WhatsApp', href: wa, external: true },
        contact.email && { icon: Mail, text: contact.email, href: `mailto:${contact.email}` },
    ].filter(Boolean) as { icon: LucideIcon; text: string; href: string; external?: boolean }[];
    if (channels.length === 0) return null;

    return (
        <SideCard icon={Headset} title="¿Necesitas ayuda?">
            <p className="mb-3 text-sm text-[var(--c-muted)]">Si tienes dudas para llenar tu reclamo, comunícate con nosotros.</p>
            <ul className="grid gap-2">
                {channels.map((c) => (
                    <li key={c.href}>
                        <a
                            href={c.href}
                            {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ring-1 ring-[color-mix(in_srgb,var(--c-text)_14%,transparent)] transition hover:bg-[var(--c-surface)]"
                        >
                            <c.icon className="size-4 shrink-0 text-[var(--c-primary)]" aria-hidden />
                            <span className="min-w-0 break-all">{c.text}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </SideCard>
    );
}

export function Notice({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-3 rounded-xl bg-[var(--c-surface)] p-4 text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-[var(--c-primary)]" aria-hidden />
            <p>{children}</p>
        </div>
    );
}

const size = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

/** Adjuntar archivos: elige o suelta; muestra la lista con su peso y deja quitar cada uno. */
export function FileDrop({
    id, icon: Icon, title, formats, accept, maxMb, multiple = false, max = 1, files, onChange, error,
}: {
    id: string; icon: LucideIcon; title: string; formats: string; accept: string; maxMb: number; multiple?: boolean; max?: number;
    files: File[]; onChange: (files: File[]) => void; error?: string;
}) {
    const input = useRef<HTMLInputElement>(null);

    const add = (list: FileList | null) => {
        if (!list) return;
        const next = multiple ? [...files, ...Array.from(list)].slice(0, max) : Array.from(list).slice(0, 1);
        onChange(next);
        if (input.current) input.current.value = '';
    };

    return (
        <div className="grid content-start gap-2">
            <button
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    add(e.dataTransfer.files);
                }}
                aria-describedby={`${id}-help`}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-3 py-5 text-center transition hover:border-[var(--c-primary)] hover:bg-[var(--c-surface)] ${error ? 'border-[#e11d48]' : 'border-[color-mix(in_srgb,var(--c-text)_25%,transparent)]'}`}
            >
                <span className="grid size-10 place-items-center rounded-full bg-[var(--c-surface)] text-[var(--c-primary)]">
                    <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-bold">{title}</span>
                <span id={`${id}-help`} className="text-xs text-[var(--c-muted)]">
                    {formats}
                </span>
            </button>
            <input ref={input} id={id} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1} onChange={(e) => add(e.target.files)} />
            {files.map((f, i) => (
                <div key={f.name + i} className={`flex items-center gap-2 rounded-lg bg-[var(--c-surface)] py-1.5 pl-3 pr-1.5 text-xs ${f.size > maxMb * 1048576 ? 'ring-1 ring-[#e11d48]' : ''}`}>
                    <span className="min-w-0 flex-1 truncate font-semibold">{f.name}</span>
                    <span className="shrink-0 text-[var(--c-muted)]">{size(f.size)}</span>
                    <button type="button" aria-label={`Quitar ${f.name}`} onClick={() => onChange(files.filter((_, k) => k !== i))} className="grid size-6 cursor-pointer place-items-center rounded-full hover:bg-white">
                        <X size={14} aria-hidden />
                    </button>
                </div>
            ))}
            {files.some((f) => f.size > maxMb * 1048576) && <p className="text-xs font-semibold text-[#be123c]">Cada archivo debe pesar como máximo {maxMb} MB.</p>}
            {error && (
                <p role="alert" className="text-xs font-semibold text-[#be123c]">
                    {error}
                </p>
            )}
        </div>
    );
}

export { FileText, ImagePlus, Video };

/** Suma días hábiles (lunes a viernes), igual que el plazo que calcula el servidor. */
export function addWeekdays(from: Date, days: number): Date {
    const date = new Date(from);
    let left = days;
    while (left > 0) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) left--;
    }
    return date;
}

export const dateTime = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const dateOnly = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
/** Las fechas sin hora («2026-09-20») se leen a mediodía para evitar desfases de zona horaria. */
export const plainDate = (d: string | null) => (d ? dateOnly.format(new Date(`${d}T12:00:00`)) : '');
