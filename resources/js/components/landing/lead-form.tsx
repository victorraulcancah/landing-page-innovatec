import { track } from '@/lib/analytics';
import { list, text } from '@/lib/landing';
import { clearPrefill, getPrefill } from '@/lib/prefill';
import { type Json } from '@/types/cms';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface LeadFormProps {
    campaignId: number | null;
    /** Contenido de la sección «Llamado final»: textos y campos del formulario, editables en el panel. */
    content: Record<string, Json>;
    preview: boolean;
}

type Kind = 'name' | 'company' | 'phone' | 'email' | 'message' | 'choice' | 'text';

interface FormField {
    kind: Kind;
    label: string;
    placeholder: string;
    options: string[];
    required: boolean;
}

const KINDS: Kind[] = ['name', 'company', 'phone', 'email', 'message', 'choice', 'text'];

/** Respaldo para campañas antiguas que todavía no guardan sus campos (los de fábrica; luego se editan en el panel). */
const FALLBACK: FormField[] = [
    { kind: 'name', label: 'Nombre', placeholder: '', options: [], required: true },
    { kind: 'company', label: 'Empresa', placeholder: '', options: [], required: false },
    { kind: 'phone', label: 'Teléfono o WhatsApp', placeholder: '', options: [], required: false },
    { kind: 'email', label: 'Correo', placeholder: '', options: [], required: false },
    { kind: 'message', label: '¿Qué necesitas resolver? (opcional)', placeholder: '', options: [], required: false },
];

const str = (v: Json | undefined): string => (typeof v === 'string' ? v : '');

function readFields(content: Record<string, Json>): FormField[] {
    const rows = list(content, 'form_fields');
    if (rows.length === 0) return FALLBACK;
    return rows
        .filter((r) => KINDS.includes(str(r.kind) as Kind) && str(r.label))
        .map((r) => ({
            kind: str(r.kind) as Kind,
            label: str(r.label),
            placeholder: str(r.placeholder),
            options: str(r.options)
                .split(/\r?\n/)
                .map((o) => o.trim())
                .filter(Boolean),
            required: r.required === true || str(r.kind) === 'name',
        }));
}

const INPUT = {
    name: { type: 'text', auto: 'name' },
    company: { type: 'text', auto: 'organization' },
    phone: { type: 'tel', auto: 'tel' },
    email: { type: 'email', auto: 'email' },
    text: { type: 'text', auto: 'off' },
} as const;

export function LeadForm({ campaignId, content, preview }: LeadFormProps) {
    const [sent, setSent] = useState(false);
    const fields = readFields(content);
    const extraCount = fields.filter((f) => f.kind === 'choice' || f.kind === 'text').length;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        extras: Array.from({ length: extraCount }, () => ''),
        source: 'form',
        website_url: '',
        campaign_id: campaignId,
    });
    const err = errors as Record<string, string | undefined>;

    // Resultados de la calculadora o del autodiagnóstico llegan escritos en el mensaje.
    useEffect(() => {
        const initial = getPrefill();
        if (initial) setData('message', initial);
        const onPrefill = (e: Event) => setData('message', String((e as CustomEvent<string>).detail ?? ''));
        window.addEventListener('lp:prefill', onPrefill);
        return () => window.removeEventListener('lp:prefill', onPrefill);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (preview) return;
        post(route('leads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                track('generate_lead', { form: 'diagnostico' });
                clearPrefill();
                setSent(true);
                reset();
            },
        });
    };

    if (sent) {
        return (
            <div className="lp-thanks" role="status">
                <h3>{text(content, 'thanks_title') || '¡Gracias! Recibimos tus datos.'}</h3>
                <p>{text(content, 'thanks_text') || 'Nuestro equipo te escribirá para coordinar tu reunión de diagnóstico.'}</p>
                <button type="button" className="lp-btn lp-btn--ghost lp-btn--sm" onClick={() => setSent(false)}>
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    const contactError = err.email || err.phone;
    const title = text(content, 'form_title');
    const note = text(content, 'form_note');
    let extraIndex = -1;

    return (
        <form className="lp-form" onSubmit={submit} noValidate>
            {(title || !content.form_fields) && <h3>{title || 'Agenda tu diagnóstico'}</h3>}
            {note && <p className="-mt-1 text-sm opacity-75">{note}</p>}

            <div className="grid items-start gap-x-4 gap-y-3.5 sm:grid-cols-2">
                {fields.map((f, i) => {
                    const id = `lead-${i}`;
                    const isExtra = f.kind === 'choice' || f.kind === 'text';
                    const index = isExtra ? ++extraIndex : -1;
                    const error = isExtra ? err[`extras.${index}`] : f.kind === 'message' ? err.message : err[f.kind];
                    const invalid = Boolean(error) || ((f.kind === 'email' || f.kind === 'phone') && Boolean(contactError));
                    const value = isExtra ? data.extras[index] ?? '' : (data[f.kind as 'name' | 'company' | 'email' | 'phone' | 'message'] ?? '');
                    const onChange = (v: string) => {
                        if (isExtra) setData('extras', data.extras.map((x, k) => (k === index ? v : x)));
                        else setData(f.kind as 'name' | 'company' | 'email' | 'phone' | 'message', v);
                    };
                    return (
                        <div key={i} className={`lp-field ${f.kind === 'message' ? 'sm:col-span-2' : ''}`}>
                            <label htmlFor={id}>
                                {f.label}
                                {f.required && ' *'}
                            </label>
                            {f.kind === 'message' ? (
                                <textarea id={id} className="lp-input" rows={3} placeholder={f.placeholder} value={value} maxLength={2000} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
                            ) : f.kind === 'choice' ? (
                                <select id={id} className="lp-input" value={value} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)}>
                                    <option value="">{f.placeholder || 'Selecciona una opción'}</option>
                                    {f.options.map((o) => (
                                        <option key={o} value={o}>
                                            {o}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={id}
                                    className="lp-input"
                                    type={INPUT[f.kind].type}
                                    autoComplete={INPUT[f.kind].auto}
                                    placeholder={f.placeholder}
                                    required={f.required}
                                    value={value}
                                    aria-invalid={invalid || undefined}
                                    aria-describedby={error ? `${id}-error` : undefined}
                                    onChange={(e) => onChange(e.target.value)}
                                />
                            )}
                            {error && (
                                <p id={`${id}-error`} className="lp-error" role="alert">
                                    {error}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
            <div className="lp-trap" aria-hidden="true">
                <label htmlFor="lead-website">No llenar este campo</label>
                <input id="lead-website" type="text" tabIndex={-1} autoComplete="off" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)} />
            </div>

            <button type="submit" className="lp-btn" disabled={processing || preview}>
                {processing && <LoaderCircle className="animate-spin" aria-hidden />}
                {processing ? 'Enviando…' : text(content, 'form_button') || 'Solicitar diagnóstico'}
            </button>
            {preview && <p className="lp-error">Vista previa: el formulario no envía datos.</p>}
        </form>
    );
}
