import { cleanDoc, cleanName, cleanPhone } from '@/lib/validate';
import { type FooterData } from '@/types/cms';
import { useForm } from '@inertiajs/react';
import { BookOpen, Check, LoaderCircle, X } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useEffect, useId, useRef, useState } from 'react';

interface ClaimForm {
    type: string;
    name: string;
    doc_type: string;
    doc_number: string;
    address: string;
    phone: string;
    email: string;
    is_minor: boolean;
    guardian_name: string;
    guardian_doc_type: string;
    guardian_doc_number: string;
    good_type: string;
    amount: string;
    good_description: string;
    detail: string;
    request: string;
    accepted_truth: boolean;
    accepted_privacy: boolean;
    accepted_conforme: boolean;
    website_url: string;
    [key: string]: string | boolean;
}

const DOC_TYPES: Record<string, string> = { DNI: 'DNI', CE: 'Carné de extranjería', PASAPORTE: 'Pasaporte', RUC: 'RUC' };

const INPUT =
    'w-full rounded-lg border border-[color-mix(in_srgb,var(--c-text)_28%,transparent)] bg-white px-3 py-2.5 text-[15px] text-[var(--c-text)] outline-none transition placeholder:text-[var(--c-muted)]/60 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/25 aria-[invalid=true]:border-[#e11d48] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#e11d48]/20';

function Field({ label, error, hint, className = '', children }: { label: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
    return (
        <div className={`grid content-start gap-1.5 ${className}`}>
            <label className="text-sm font-bold">{label}</label>
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

function Check2({ checked, onChange, error, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode }) {
    return (
        <div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--c-primary)]" />
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

/** Libro de Reclamaciones virtual: hoja de reclamo o queja que se guarda con su número y se responde desde el panel. */
export function ClaimModal({ footer, preview, onClose }: { footer: FooterData; preview: boolean; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const uid = useId();
    const [code, setCode] = useState<string | null>(null);
    const form = useForm<ClaimForm>({
        type: 'reclamo',
        name: '',
        doc_type: 'DNI',
        doc_number: '',
        address: '',
        phone: '',
        email: '',
        is_minor: false,
        guardian_name: '',
        guardian_doc_type: 'DNI',
        guardian_doc_number: '',
        good_type: 'servicio',
        amount: '',
        good_description: '',
        detail: '',
        request: '',
        accepted_truth: false,
        accepted_privacy: false,
        accepted_conforme: false,
        website_url: '',
    });
    const err = form.errors as Record<string, string | undefined>;

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (preview) return;
        form.post(route('claims.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as { flash?: { claim_code?: string | null } }).flash;
                setCode(flash?.claim_code ?? '—');
                dialog.current?.scrollTo({ top: 0 });
            },
        });
    };

    const provider = [footer.provider_name, footer.provider_ruc && `RUC ${footer.provider_ruc}`, footer.provider_address].filter(Boolean);

    return (
        <dialog
            ref={dialog}
            aria-labelledby={`${uid}-title`}
            onClose={onClose}
            onClick={(e) => e.target === dialog.current && dialog.current?.close()}
            className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(52rem,calc(100vw-1.5rem))] overflow-y-auto overflow-x-hidden rounded-[1.5rem] border-0 bg-[var(--c-background)] p-0 text-left text-[var(--c-text)] shadow-2xl backdrop:bg-[#0a0928]/75 backdrop:backdrop-blur-sm"
        >
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#be123c] text-white">
                    <BookOpen size={22} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 id={`${uid}-title`} className="font-[family-name:var(--font-head)] text-lg font-extrabold leading-tight">
                        {footer.claims_label || 'Libro de Reclamaciones'}
                    </h2>
                    <p className="text-xs text-[var(--c-muted)]">Hoja de reclamación virtual · Ley N° 29571</p>
                </div>
                <button type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar" className="grid size-9 cursor-pointer place-items-center rounded-full transition hover:bg-[var(--c-surface)]">
                    <X size={20} aria-hidden />
                </button>
            </header>

            {code ? (
                <div className="grid place-items-center gap-3 px-6 py-14 text-center" role="status">
                    <span className="grid size-16 place-items-center rounded-full bg-[#059669] text-white">
                        <Check size={34} strokeWidth={3} aria-hidden />
                    </span>
                    <h3 className="font-[family-name:var(--font-head)] text-2xl font-extrabold">¡Registramos tu hoja de reclamación!</h3>
                    {code !== '—' && (
                        <p className="rounded-xl bg-[var(--c-surface)] px-5 py-3 text-sm">
                            Tu número de hoja es <strong className="font-[family-name:var(--font-head)] text-xl">{code}</strong>
                        </p>
                    )}
                    <p className="max-w-md text-sm text-[var(--c-muted)]">Te enviamos una copia a tu correo. Guarda tu número de hoja para cualquier consulta. Te responderemos en un plazo máximo de 15 días hábiles.</p>
                    <button type="button" onClick={() => dialog.current?.close()} className="mt-2 cursor-pointer rounded-[var(--r-btn)] bg-[var(--c-primary)] px-6 py-3 font-[family-name:var(--font-head)] text-sm font-bold text-[var(--c-on-primary)] hover:brightness-110">
                        Cerrar
                    </button>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="grid gap-6 px-5 py-6 sm:px-7">
                    {provider.length > 0 && (
                        <p className="rounded-xl bg-[var(--c-surface)] px-4 py-3 text-xs leading-relaxed text-[var(--c-muted)]">
                            <strong className="text-[var(--c-text)]">Proveedor:</strong> {provider.join(' · ')}
                        </p>
                    )}

                    {/* Tipo */}
                    <fieldset className="grid gap-2 sm:grid-cols-2">
                        <legend className="mb-2 text-sm font-bold">¿Qué deseas registrar?</legend>
                        {[
                            ['reclamo', 'Reclamo', 'Disconformidad con el producto o servicio.'],
                            ['queja', 'Queja', 'Malestar por la atención recibida.'],
                        ].map(([value, title, text]) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition ${form.data.type === value ? 'border-[var(--c-primary)] bg-[var(--c-primary)]/8' : 'border-[color-mix(in_srgb,var(--c-text)_14%,transparent)] hover:border-[var(--c-primary)]/50'}`}
                            >
                                <input type="radio" name={`${uid}-type`} checked={form.data.type === value} onChange={() => form.setData('type', value)} className="mt-1 size-4 accent-[var(--c-primary)]" />
                                <span>
                                    <span className="block font-bold">{title}</span>
                                    <span className="text-xs text-[var(--c-muted)]">{text}</span>
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    {/* 1. Consumidor */}
                    <section className="grid gap-4">
                        <h3 className="border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] pb-2 font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wider text-[var(--c-primary)]">1. Tus datos</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nombres y apellidos *" error={err.name} className="sm:col-span-2">
                                <input className={INPUT} autoComplete="name" maxLength={150} value={form.data.name} aria-invalid={err.name ? true : undefined} onChange={(e) => form.setData('name', cleanName(e.target.value))} />
                            </Field>
                            <Field label="Tipo de documento *" error={err.doc_type}>
                                <select className={INPUT} value={form.data.doc_type} onChange={(e) => form.setData((d) => ({ ...d, doc_type: e.target.value, doc_number: cleanDoc(e.target.value, d.doc_number) }))}>
                                    {Object.entries(DOC_TYPES).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Número de documento *" error={err.doc_number}>
                                <input className={INPUT} inputMode={form.data.doc_type === 'DNI' || form.data.doc_type === 'RUC' ? 'numeric' : 'text'} value={form.data.doc_number} aria-invalid={err.doc_number ? true : undefined} onChange={(e) => form.setData('doc_number', cleanDoc(form.data.doc_type, e.target.value))} />
                            </Field>
                            <Field label="Domicilio *" error={err.address} className="sm:col-span-2">
                                <input className={INPUT} autoComplete="street-address" maxLength={255} value={form.data.address} aria-invalid={err.address ? true : undefined} onChange={(e) => form.setData('address', e.target.value)} />
                            </Field>
                            <Field label="Celular *" error={err.phone} hint="9 números, empieza con 9.">
                                <input className={INPUT} type="tel" inputMode="numeric" maxLength={9} autoComplete="tel" placeholder="987654321" value={form.data.phone} aria-invalid={err.phone ? true : undefined} onChange={(e) => form.setData('phone', cleanPhone(e.target.value))} />
                            </Field>
                            <Field label="Correo electrónico *" error={err.email} hint="Aquí te enviamos la copia de tu hoja.">
                                <input className={INPUT} type="email" autoComplete="email" maxLength={150} value={form.data.email} aria-invalid={err.email ? true : undefined} onChange={(e) => form.setData('email', e.target.value)} />
                            </Field>
                        </div>
                        <Check2 checked={form.data.is_minor} onChange={(v) => form.setData('is_minor', v)}>
                            Soy menor de edad (lo registra mi padre, madre o tutor)
                        </Check2>
                        {form.data.is_minor && (
                            <div className="grid gap-4 rounded-xl bg-[var(--c-surface)] p-4 sm:grid-cols-2">
                                <Field label="Nombres del padre, madre o tutor *" error={err.guardian_name} className="sm:col-span-2">
                                    <input className={INPUT} maxLength={150} value={form.data.guardian_name} aria-invalid={err.guardian_name ? true : undefined} onChange={(e) => form.setData('guardian_name', cleanName(e.target.value))} />
                                </Field>
                                <Field label="Tipo de documento *" error={err.guardian_doc_type}>
                                    <select className={INPUT} value={form.data.guardian_doc_type} onChange={(e) => form.setData((d) => ({ ...d, guardian_doc_type: e.target.value, guardian_doc_number: cleanDoc(e.target.value, d.guardian_doc_number) }))}>
                                        {Object.entries(DOC_TYPES).map(([k, v]) => (
                                            <option key={k} value={k}>
                                                {v}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Número de documento *" error={err.guardian_doc_number}>
                                    <input className={INPUT} value={form.data.guardian_doc_number} aria-invalid={err.guardian_doc_number ? true : undefined} onChange={(e) => form.setData('guardian_doc_number', cleanDoc(form.data.guardian_doc_type, e.target.value))} />
                                </Field>
                            </div>
                        )}
                    </section>

                    {/* 2. Bien contratado */}
                    <section className="grid gap-4">
                        <h3 className="border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] pb-2 font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wider text-[var(--c-primary)]">2. Servicio o producto</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Tipo *" error={err.good_type}>
                                <select className={INPUT} value={form.data.good_type} onChange={(e) => form.setData('good_type', e.target.value)}>
                                    <option value="servicio">Servicio</option>
                                    <option value="producto">Producto</option>
                                </select>
                            </Field>
                            <Field label="Monto reclamado (S/)" error={err.amount} hint="Opcional.">
                                <input className={INPUT} type="number" inputMode="decimal" min={0} step="0.01" value={form.data.amount} aria-invalid={err.amount ? true : undefined} onChange={(e) => form.setData('amount', e.target.value)} />
                            </Field>
                            <Field label="Descripción del servicio o producto *" error={err.good_description} className="sm:col-span-2">
                                <textarea className={INPUT} rows={2} maxLength={1000} value={form.data.good_description} aria-invalid={err.good_description ? true : undefined} onChange={(e) => form.setData('good_description', e.target.value)} />
                            </Field>
                        </div>
                    </section>

                    {/* 3. Detalle */}
                    <section className="grid gap-4">
                        <h3 className="border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] pb-2 font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wider text-[var(--c-primary)]">3. Detalle de tu {form.data.type === 'queja' ? 'queja' : 'reclamo'}</h3>
                        <Field label={`Cuéntanos qué ocurrió *`} error={err.detail}>
                            <textarea className={INPUT} rows={4} maxLength={3000} value={form.data.detail} aria-invalid={err.detail ? true : undefined} onChange={(e) => form.setData('detail', e.target.value)} />
                        </Field>
                        <Field label="¿Qué solicitas? *" error={err.request}>
                            <textarea className={INPUT} rows={3} maxLength={2000} value={form.data.request} aria-invalid={err.request ? true : undefined} onChange={(e) => form.setData('request', e.target.value)} />
                        </Field>
                    </section>

                    {/* Confirmaciones */}
                    <section className="grid gap-3 rounded-xl bg-[var(--c-surface)] p-4">
                        <Check2 checked={form.data.accepted_truth} onChange={(v) => form.setData('accepted_truth', v)} error={err.accepted_truth}>
                            Declaro que la información que registro es verdadera.
                        </Check2>
                        <Check2 checked={form.data.accepted_privacy} onChange={(v) => form.setData('accepted_privacy', v)} error={err.accepted_privacy}>
                            Acepto el tratamiento de mis datos personales para atender este reclamo.
                        </Check2>
                        <Check2 checked={form.data.accepted_conforme} onChange={(v) => form.setData('accepted_conforme', v)} error={err.accepted_conforme}>
                            Estoy conforme con el contenido de esta hoja de reclamación.
                        </Check2>
                    </section>

                    {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
                    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                        <label>
                            No llenar este campo
                            <input type="text" tabIndex={-1} autoComplete="off" value={form.data.website_url} onChange={(e) => form.setData('website_url', e.target.value)} />
                        </label>
                    </div>

                    <p className="text-xs leading-relaxed text-[var(--c-muted)]">La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor debe dar respuesta en un plazo no mayor a 15 días hábiles.</p>

                    <button
                        type="submit"
                        disabled={form.processing || preview}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-primary)] px-6 py-3.5 font-[family-name:var(--font-head)] text-sm font-bold text-[var(--c-on-primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing && <LoaderCircle className="animate-spin" size={18} aria-hidden />}
                        {form.processing ? 'Enviando…' : 'Enviar hoja de reclamación'}
                    </button>
                    {preview && <p className="text-center text-xs font-semibold text-[#be123c]">Vista previa: el libro no envía datos.</p>}
                </form>
            )}
        </dialog>
    );
}
