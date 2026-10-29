import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LeadFormProps {
    campaignId: number | null;
    buttonLabel: string;
    preview: boolean;
}

const FIELDS = [
    { name: 'name', label: 'Nombre', type: 'text', autoComplete: 'name', required: true },
    { name: 'company', label: 'Empresa', type: 'text', autoComplete: 'organization', required: false },
    { name: 'email', label: 'Correo', type: 'email', autoComplete: 'email', required: false },
    { name: 'phone', label: 'Teléfono o WhatsApp', type: 'tel', autoComplete: 'tel', required: false },
] as const;

export function LeadForm({ campaignId, buttonLabel, preview }: LeadFormProps) {
    const [sent, setSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
        website_url: '',
        campaign_id: campaignId,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (preview) return;
        post(route('leads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                reset();
            },
        });
    };

    if (sent) {
        return (
            <div className="lp-thanks" role="status">
                <h3>¡Gracias! Recibimos tus datos.</h3>
                <p>Nuestro equipo te escribirá para coordinar tu reunión de diagnóstico.</p>
                <button type="button" className="lp-btn lp-btn--ghost lp-btn--sm" onClick={() => setSent(false)}>
                    Enviar otro mensaje
                </button>
            </div>
        );
    }

    const contactError = errors.email || errors.phone;

    return (
        <form className="lp-form" onSubmit={submit} noValidate>
            <h3>Agenda tu diagnóstico</h3>

            {FIELDS.slice(0, 2).map((f) => (
                <Field key={f.name} field={f} value={data[f.name]} error={errors[f.name]} onChange={(v) => setData(f.name, v)} />
            ))}
            <div className="lp-form__row">
                {FIELDS.slice(2).map((f) => (
                    <Field key={f.name} field={f} value={data[f.name]} error={undefined} invalid={Boolean(contactError)} onChange={(v) => setData(f.name, v)} />
                ))}
            </div>
            <p className={contactError ? 'lp-error' : 'lp-hint'} role={contactError ? 'alert' : undefined}>
                {contactError || 'Déjanos al menos un correo o un teléfono para contactarte.'}
            </p>

            <div className="lp-field">
                <label htmlFor="lead-message">¿Qué necesitas resolver? (opcional)</label>
                <textarea id="lead-message" className="lp-input" value={data.message} onChange={(e) => setData('message', e.target.value)} maxLength={2000} />
            </div>

            {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
            <div className="lp-trap" aria-hidden="true">
                <label htmlFor="lead-website">No llenar este campo</label>
                <input id="lead-website" type="text" tabIndex={-1} autoComplete="off" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)} />
            </div>

            <button type="submit" className="lp-btn" disabled={processing || preview}>
                {processing && <LoaderCircle className="animate-spin" aria-hidden />}
                {processing ? 'Enviando…' : buttonLabel || 'Solicitar diagnóstico'}
            </button>
            {preview && <p className="lp-error">Vista previa: el formulario no envía datos.</p>}
        </form>
    );
}

function Field({
    field,
    value,
    error,
    invalid,
    onChange,
}: {
    field: (typeof FIELDS)[number];
    value: string;
    error?: string;
    invalid?: boolean;
    onChange: (v: string) => void;
}) {
    const id = `lead-${field.name}`;
    return (
        <div className="lp-field">
            <label htmlFor={id}>
                {field.label}
            </label>
            <input
                id={id}
                className="lp-input"
                type={field.type}
                autoComplete={field.autoComplete}
                required={field.required}
                value={value}
                aria-invalid={Boolean(error) || invalid ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && (
                <p id={`${id}-error`} className="lp-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
