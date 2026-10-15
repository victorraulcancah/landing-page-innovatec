import { useState, type FormEvent } from 'react';
import { content } from '../content';

type Fields = { name: string; company: string; email: string; phone: string; message: string };

const empty: Fields = { name: '', company: '', email: '', phone: '', message: '' };

const input =
    'block w-full rounded-lg border border-white/25 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 transition-colors focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30 aria-[invalid=true]:border-red-400';

/**
 * Formulario de contacto. Si defines VITE_CONTACT_ENDPOINT envía los datos en
 * JSON (POST) a esa dirección; si no, prepara un correo para ventas.
 */
export function LeadForm() {
    const [values, setValues] = useState<Fields>(empty);
    const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const set = (key: keyof Fields) => (e: { target: { value: string } }) =>
        setValues((v) => ({ ...v, [key]: e.target.value }));

    const validate = (): boolean => {
        const next: Partial<Record<keyof Fields, string>> = {};

        if (!values.name.trim()) next.name = 'Escribe tu nombre.';
        if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = 'Escribe un correo válido.';
        if (values.message.trim().length < 10) next.message = 'Cuéntanos un poco más (mínimo 10 caracteres).';

        setErrors(next);

        return Object.keys(next).length === 0;
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

        if (endpoint) {
            setStatus('sending');

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ ...values, source: 'landing-telcos' }),
                });

                if (!res.ok) throw new Error(String(res.status));

                setStatus('sent');
                setValues(empty);
            } catch {
                setStatus('error');
            }

            return;
        }

        const body = [
            `Nombre: ${values.name}`,
            `Empresa: ${values.company || '-'}`,
            `Correo: ${values.email}`,
            `Teléfono: ${values.phone || '-'}`,
            '',
            values.message,
        ].join('\n');

        window.location.href = `mailto:${content.contact.email}?subject=${encodeURIComponent(
            'Contacto desde la landing de Telcos',
        )}&body=${encodeURIComponent(body)}`;
        setStatus('sent');
    };

    if (status === 'sent') {
        return (
            <div role="status" className="border border-signal/40 bg-signal/10 p-8">
                <h2 className="font-display text-lg uppercase text-white">Mensaje listo</h2>
                <p className="mt-3 text-base leading-relaxed text-white/80">{content.form.success}</p>
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-signal underline underline-offset-4"
                >
                    Escribir otro mensaje
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1.5 block text-sm text-white/80">Nombre *</span>
                    <input
                        className={input}
                        value={values.name}
                        onChange={set('name')}
                        autoComplete="name"
                        aria-invalid={!!errors.name || undefined}
                    />
                    {errors.name && <span role="alert" className="mt-1.5 block text-sm text-red-300">{errors.name}</span>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-white/80">Empresa</span>
                    <input className={input} value={values.company} onChange={set('company')} autoComplete="organization" />
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-white/80">Correo *</span>
                    <input
                        type="email"
                        className={input}
                        value={values.email}
                        onChange={set('email')}
                        autoComplete="email"
                        aria-invalid={!!errors.email || undefined}
                    />
                    {errors.email && <span role="alert" className="mt-1.5 block text-sm text-red-300">{errors.email}</span>}
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-white/80">Teléfono</span>
                    <input type="tel" className={input} value={values.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
            </div>

            <label className="block">
                <span className="mb-1.5 block text-sm text-white/80">¿En qué podemos ayudarte? *</span>
                <textarea
                    className={`${input} resize-y`}
                    rows={4}
                    maxLength={3000}
                    value={values.message}
                    onChange={set('message')}
                    aria-invalid={!!errors.message || undefined}
                />
                {errors.message && <span role="alert" className="mt-1.5 block text-sm text-red-300">{errors.message}</span>}
            </label>

            {status === 'error' && (
                <p role="alert" className="text-sm text-red-300">
                    No pudimos enviar el mensaje. Escríbenos a {content.contact.email}.
                </p>
            )}

            <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-signal bg-signal px-8 text-sm font-semibold text-night transition-colors hover:border-white hover:bg-white disabled:opacity-60 sm:w-auto"
            >
                {status === 'sending' ? 'Enviando…' : content.form.submit}
            </button>
        </form>
    );
}
