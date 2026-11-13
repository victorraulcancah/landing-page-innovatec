import { track } from '@/lib/analytics';
import { ctaHref, ctaOf, flag, list, text, whatsappHref, type CtaContext, type PublicSection } from '@/lib/landing';
import { setPrefill } from '@/lib/prefill';
import { type Json } from '@/types/cms';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Check, LoaderCircle, Minus, Plus } from 'lucide-react';
import { type FormEvent, useId, useMemo, useState } from 'react';

interface Device {
    name: string;
    hint: string;
    group: string;
    weight: number;
    qty: number;
    /** Cantidad de este equipo en cada plan rápido, en el orden de los planes. */
    plans: number[];
}

const MAX_QTY = 100000;
const money = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uco = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const toNumber = (v: Json | undefined, fallback = 0): number => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
};
const whole = (n: number) => Math.min(MAX_QTY, Math.max(0, Math.round(n)));
const str = (v: Json | undefined) => (typeof v === 'string' ? v.trim() : '');
const lines = (v: string) => v.split('\n').map((l) => l.trim()).filter(Boolean);

function readDevices(c: Record<string, Json>): Device[] {
    return list(c, 'devices')
        .map((d) => ({
            name: str(d.name),
            hint: str(d.hint),
            group: str(d.group) || 'Equipos',
            weight: Math.max(0, toNumber(d.weight)),
            qty: whole(toNumber(d.qty)),
            plans: str(d.preset_qty)
                .split(',')
                .map((x) => x.trim())
                .filter((x) => x !== '')
                .map((x) => whole(Number(x) || 0)),
        }))
        .filter((d) => d.name !== '');
}

/**
 * Cotizador de tarifa. Total UCO = Σ (cantidad × peso UCO); tarifa mensual = máx(Total UCO × valor del UCO, mínimo).
 * Todo (equipos, pesos, planes, valor del UCO, mínimo y textos) viene del panel.
 */
export function Quote({ section, ctx, campaignId, preview }: { section: PublicSection; ctx: CtaContext; campaignId: number | null; preview: boolean }) {
    const c = section.content;
    const uid = useId();
    const devices = useMemo(() => readDevices(c), [c]);
    const plans = useMemo(() => lines(text(c, 'presets')).slice(0, 6), [c]);
    const groups = useMemo(() => [...new Set(devices.map((d) => d.group))], [devices]);

    const ucoPrice = Math.max(0, toNumber(c.uco_price, 50));
    const minPrice = Math.max(0, toNumber(c.min_price, 0));
    const currency = text(c, 'currency') || 'S/';
    const resultUnit = text(c, 'result_unit');
    const open = text(c, 'reveal') === 'open';

    const initial = (plan: number) => devices.map((d) => d.plans[plan] ?? d.qty);
    const [qty, setQty] = useState<number[]>(() => initial(0));
    const [plan, setPlan] = useState<number | null>(plans.length > 0 ? 0 : null);
    const [tab, setTab] = useState<string>(groups[0] ?? 'all');
    const [unlocked, setUnlocked] = useState(false);

    const form = useForm({ name: '', company: '', phone: '', message: '', website_url: '', campaign_id: campaignId });

    const totalUco = Math.round(devices.reduce((sum, d, i) => sum + (qty[i] ?? 0) * d.weight, 0) * 100) / 100;
    const raw = totalUco * ucoPrice;
    const belowMin = totalUco > 0 && raw < minPrice;
    const price = totalUco > 0 ? Math.max(minPrice, raw) : minPrice;
    const units = qty.reduce((a, b) => a + b, 0);
    const visible = devices.map((d, i) => ({ d, i })).filter(({ d }) => tab === 'all' || d.group === tab);

    const change = (i: number, value: number) => {
        setQty((q) => q.map((n, k) => (k === i ? whole(value) : n)));
        setPlan(null);
    };
    const choosePlan = (k: number) => {
        setQty(initial(k));
        setPlan(k);
    };
    const clear = () => {
        setQty(devices.map(() => 0));
        setPlan(null);
    };

    const summary = () => {
        const picked = devices.map((d, i) => (qty[i] > 0 ? `${qty[i]} ${d.name}` : '')).filter(Boolean);
        return `Cotizador (referencial): ${uco.format(totalUco)} UCO → ${currency} ${money.format(price)} ${resultUnit}. Equipos: ${picked.join(', ') || 'sin equipos elegidos'}.`;
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const missing = { name: 'Escribe tu nombre.', company: 'Escribe el RUC o el nombre de tu empresa.', phone: 'Escribe tu número de WhatsApp.' } as const;
        form.clearErrors();
        let invalid = false;
        (Object.keys(missing) as (keyof typeof missing)[]).forEach((k) => {
            if (!form.data[k].trim()) {
                form.setError(k, missing[k]);
                invalid = true;
            }
        });
        if (invalid) return;
        if (preview) {
            setUnlocked(true);
            return;
        }
        form.transform((d) => ({ ...d, message: summary() }));
        form.post(route('leads.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                track('generate_lead', { form: 'cotizador', uco: totalUco });
                setUnlocked(true);
            },
        });
    };

    if (devices.length === 0) return null;

    const showResult = open || unlocked;
    const whatsapp = ctaOf(c, 'whatsapp_cta');
    const diag = ctaOf(c, 'diag_cta');
    const benefits = lines(text(c, 'benefits'));
    const err = form.errors;

    return (
        <div className="lp-quote" data-reveal="up">
            <header className="lp-quote__head">
                <div>
                    <h2>{text(c, 'title') || 'Cotizador'}</h2>
                    {text(c, 'subtitle') && <p>{text(c, 'subtitle')}</p>}
                </div>
                <p className="lp-quote__base">
                    {text(c, 'badge_label') && <span>{text(c, 'badge_label')}</span>}
                    <strong>
                        {text(c, 'from_label')} {currency} {uco.format(minPrice)}
                    </strong>{' '}
                    <small>{text(c, 'unit_label')}</small>
                </p>
            </header>

            {plans.length > 0 && (
                <div className="lp-quote__plans" role="group" aria-label="Planes rápidos">
                    {plans.map((label, k) => (
                        <button key={label + k} type="button" aria-pressed={plan === k} onClick={() => choosePlan(k)}>
                            {label}
                        </button>
                    ))}
                    <button type="button" className="lp-quote__clear" onClick={clear}>
                        Poner en 0
                    </button>
                </div>
            )}

            <div className="lp-quote__tabs" role="tablist" aria-label="Grupos de equipos">
                {groups.map((g) => (
                    <button key={g} type="button" role="tab" aria-selected={tab === g} onClick={() => setTab(g)}>
                        {g} ({devices.filter((d) => d.group === g).length})
                    </button>
                ))}
                <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>
                    Ver los {devices.length} ítems
                </button>
            </div>

            <ul className="lp-quote__grid">
                {visible.map(({ d, i }) => (
                    <li key={i} className={qty[i] > 0 ? 'is-on' : ''}>
                        <div>
                            <label htmlFor={`${uid}-${i}`}>{d.name}</label>
                            {d.hint && <small>{d.hint}</small>}
                        </div>
                        <div className="lp-quote__step">
                            <button type="button" aria-label={`Quitar uno de ${d.name}`} disabled={qty[i] <= 0} onClick={() => change(i, qty[i] - 1)}>
                                <Minus size={14} aria-hidden />
                            </button>
                            <input id={`${uid}-${i}`} type="number" inputMode="numeric" min={0} max={MAX_QTY} value={qty[i]} onChange={(e) => change(i, Number(e.target.value))} />
                            <button type="button" aria-label={`Agregar uno de ${d.name}`} onClick={() => change(i, qty[i] + 1)}>
                                <Plus size={14} aria-hidden />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <p className="lp-quote__sum" aria-live="polite">
                <span>{units === 0 ? 'Todavía no elegiste equipos.' : `${units} ${units === 1 ? 'unidad elegida' : 'unidades elegidas'}`}</span>
                {flag(c, 'show_uco') && <b>{uco.format(totalUco)} UCO</b>}
            </p>

            {showResult ? (
                <div className="lp-quote__result" role="status">
                    <p className="lp-quote__label">{text(c, 'result_label')}</p>
                    <p className="lp-quote__price">
                        {currency} {money.format(price)} <small>{resultUnit}</small>
                    </p>
                    <p className="lp-quote__note">
                        {belowMin ? text(c, 'min_note') : flag(c, 'show_uco') && totalUco > 0 ? `${uco.format(totalUco)} UCO × ${currency} ${uco.format(ucoPrice)}` : ''}
                    </p>
                    {benefits.length > 0 && (
                        <ul className="lp-quote__benefits">
                            {benefits.map((b) => (
                                <li key={b}>
                                    <Check size={16} strokeWidth={3} aria-hidden />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="lp-quote__actions">
                        {whatsapp && (
                            <a className="lp-btn" href={whatsappHref(ctx.contact, `${whatsapp.value ? `${whatsapp.value} ` : ''}${summary()}`)} target="_blank" rel="noopener noreferrer">
                                {whatsapp.label}
                                <ArrowRight size={18} aria-hidden />
                            </a>
                        )}
                        {diag && (
                            <a className="lp-btn lp-btn--ghost" href={ctaHref(diag, ctx)} onClick={() => diag.action === 'lead_form' && setPrefill(summary())}>
                                {diag.label}
                            </a>
                        )}
                    </div>
                    {text(c, 'disclaimer') && <p className="lp-quote__fine">{text(c, 'disclaimer')}</p>}
                </div>
            ) : (
                <form className="lp-quote__gate" onSubmit={submit} noValidate>
                    <p className="lp-quote__gate-title">{text(c, 'gate_title')}</p>
                    <div className="lp-quote__fields">
                        <div>
                            <label htmlFor={`${uid}-name`}>Nombre completo *</label>
                            <input id={`${uid}-name`} className="lp-input" autoComplete="name" value={form.data.name} aria-invalid={err.name ? true : undefined} onChange={(e) => form.setData('name', e.target.value)} />
                            {err.name && <span className="lp-error">{err.name}</span>}
                        </div>
                        <div>
                            <label htmlFor={`${uid}-company`}>RUC o nombre de tu empresa *</label>
                            <input id={`${uid}-company`} className="lp-input" autoComplete="organization" value={form.data.company} aria-invalid={err.company ? true : undefined} onChange={(e) => form.setData('company', e.target.value)} />
                            {err.company && <span className="lp-error">{err.company}</span>}
                        </div>
                        <div>
                            <label htmlFor={`${uid}-phone`}>Número de WhatsApp *</label>
                            <input id={`${uid}-phone`} className="lp-input" type="tel" autoComplete="tel" value={form.data.phone} aria-invalid={err.phone ? true : undefined} onChange={(e) => form.setData('phone', e.target.value)} />
                            {err.phone && <span className="lp-error">{err.phone}</span>}
                        </div>
                    </div>
                    {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
                    <div className="lp-trap" aria-hidden="true">
                        <label htmlFor={`${uid}-web`}>No llenar este campo</label>
                        <input id={`${uid}-web`} type="text" tabIndex={-1} autoComplete="off" value={form.data.website_url} onChange={(e) => form.setData('website_url', e.target.value)} />
                    </div>
                    <button type="submit" className="lp-btn" disabled={form.processing}>
                        {form.processing && <LoaderCircle className="animate-spin" aria-hidden />}
                        {form.processing ? 'Enviando…' : text(c, 'gate_button') || 'Ver la tarifa'}
                        {!form.processing && <ArrowRight size={18} aria-hidden />}
                    </button>
                    {preview && <p className="lp-error">Vista previa: no se envían datos; el botón solo muestra la tarifa.</p>}
                </form>
            )}
        </div>
    );
}
