import { ctaHref, ctaOf, flag, sectionLook, text, type CtaContext, type PublicSection } from '@/lib/landing';
import { setPrefill } from '@/lib/prefill';
import { type Json, type ThemeData } from '@/types/cms';
import { ArrowRight, Play, Square, X } from 'lucide-react';
import { type CSSProperties, useEffect, useId, useRef, useState } from 'react';

const num = (c: Record<string, Json>, key: string, fallback: number): number => {
    const v = c[key];
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
};

const money = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });

// ---- Calculadora de pérdida -------------------------------------------------------

interface SliderDef {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    value: number;
    prefix?: string;
    onChange: (v: number) => void;
}

function Slider({ def }: { def: SliderDef }) {
    const progress = ((def.value - def.min) / Math.max(1, def.max - def.min)) * 100;
    return (
        <div className="lp-slider">
            <div className="lp-slider__row">
                <label htmlFor={def.id}>{def.label}</label>
                <output htmlFor={def.id}>
                    {def.prefix ? `${def.prefix} ` : ''}
                    {money.format(def.value)}
                    {def.unit ? ` ${def.unit}` : ''}
                </output>
            </div>
            <input
                id={def.id}
                type="range"
                min={def.min}
                max={def.max}
                step={1}
                value={def.value}
                style={{ '--p': `${progress}%` } as CSSProperties}
                onChange={(e) => def.onChange(Number(e.target.value))}
            />
        </div>
    );
}

export function Calculator({ section, ctx }: { section: PublicSection; ctx: CtaContext }) {
    const c = section.content;
    const uid = useId();
    const range = (key: string, fallback: [number, number, number]) => {
        const min = Math.max(1, num(c, `${key}_min`, fallback[0]));
        const max = Math.max(min + 1, num(c, `${key}_max`, fallback[1]));
        const value = Math.min(max, Math.max(min, num(c, `${key}_default`, fallback[2])));
        return { min, max, value };
    };
    const rp = range('people', [1, 100, 20]);
    const rh = range('hours', [1, 100, 6]);
    const rc = range('cost', [5, 100, 15]);

    const [people, setPeople] = useState(rp.value);
    const [hours, setHours] = useState(rh.value);
    const [cost, setCost] = useState(rc.value);
    const [running, setRunning] = useState(false);
    const [minutes, setMinutes] = useState(0);

    const currency = text(c, 'currency') || 'S/';
    const monthly = people * hours * cost;
    const yearly = monthly * 12;
    const lost = Math.round((people * cost * minutes) / 60);
    const cta = ctaOf(c, 'cta');

    // Simulación: 1 segundo real = 1 minuto de caída. Se detiene sola a las 12 horas.
    useEffect(() => {
        if (!running) return;
        const timer = window.setInterval(() => {
            setMinutes((m) => {
                if (m >= 719) {
                    setRunning(false);
                    return 720;
                }
                return m + 1;
            });
        }, 1000);
        return () => window.clearInterval(timer);
    }, [running]);

    const toggleSimulation = () => {
        if (running) {
            setRunning(false);
        } else {
            setMinutes(0);
            setRunning(true);
        }
    };

    const prefill = () => {
        if (cta?.action !== 'lead_form') return;
        setPrefill(
            `Calculé que una caída me cuesta ${currency} ${money.format(monthly)} al mes (${people} ${text(c, 'people_unit') || 'personas'}, ${hours} ${text(c, 'hours_unit') || 'horas'} de caída al mes, ${currency} ${cost} por persona por hora).`,
        );
    };

    return (
        <div className="lp-calc">
            <h2 className="lp-calc__title" id={`h-${section.id}`}>
                {text(c, 'title')}
            </h2>

            <Slider def={{ id: `${uid}-p`, label: text(c, 'people_label'), unit: text(c, 'people_unit'), ...rp, onChange: setPeople, value: people }} />
            <Slider def={{ id: `${uid}-h`, label: text(c, 'hours_label'), unit: text(c, 'hours_unit'), ...rh, onChange: setHours, value: hours }} />
            <Slider def={{ id: `${uid}-c`, label: text(c, 'cost_label'), unit: '', prefix: currency, ...rc, onChange: setCost, value: cost }} />

            <div className="lp-calc__sim">
                <div>
                    <p className="lp-calc__sim-label">
                        Si hoy se cae todo: {minutes} min <span>(1 seg = 1 min)</span>
                    </p>
                    <p className="lp-calc__sim-loss">
                        − {currency} {money.format(lost)}
                    </p>
                </div>
                <button type="button" className="lp-calc__sim-btn" onClick={toggleSimulation} aria-pressed={running}>
                    {running ? <Square size={14} aria-hidden /> : <Play size={14} aria-hidden />}
                    {running ? 'Detener' : text(c, 'simulate_label') || 'Simular caída'}
                </button>
            </div>

            <div className="lp-calc__result" aria-live="polite">
                <p>{text(c, 'result_label')}</p>
                <p className="lp-calc__big">
                    {currency} {money.format(monthly)} <span>al mes</span>
                </p>
                <p className="lp-calc__year">
                    {currency} {money.format(yearly)} {text(c, 'year_note')}
                </p>
            </div>

            {cta && (
                <a className="lp-calc__cta" href={ctaHref(cta, ctx)} onClick={prefill}>
                    {cta.label}
                </a>
            )}
            {text(c, 'disclaimer') && <p className="lp-calc__note">{text(c, 'disclaimer')}</p>}
        </div>
    );
}

// ---- Autodiagnóstico ---------------------------------------------------------------

export function Quiz({ section, ctx }: { section: PublicSection; ctx: CtaContext }) {
    const c = section.content;
    const items = (Array.isArray(c.items) ? (c.items as Record<string, Json>[]) : []).map((i) => (typeof i.text === 'string' ? i.text : '')).filter(Boolean);
    const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
    const uid = useId();

    const count = checked.filter(Boolean).length;
    const total = items.length;
    const ratio = total ? count / total : 0;
    const level = count === 0 ? 'zero' : ratio <= 0.34 ? 'low' : ratio <= 0.67 ? 'high' : 'critical';
    const message = text(c, `msg_${level}`);
    const label = count > 0 ? text(c, 'cta_label').replace('{n}', String(count)) : text(c, 'cta_empty');

    const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

    const prefill = () => {
        if (count === 0) return;
        const picked = items.filter((_, i) => checked[i]).map((t) => `- ${t}`);
        setPrefill(`Marqué ${count} de ${total} puntos en el autodiagnóstico:\n${picked.join('\n')}`);
    };

    return (
        <div className="lp-quiz">
            <ul className="lp-quiz__list">
                {items.map((item, i) => (
                    <li key={i} data-reveal="up" style={{ '--i': i } as CSSProperties}>
                        <input id={`${uid}-${i}`} type="checkbox" checked={checked[i] ?? false} onChange={() => toggle(i)} />
                        <label htmlFor={`${uid}-${i}`}>{item}</label>
                    </li>
                ))}
            </ul>

            <div className={`lp-quiz__result lp-quiz__result--${level}`} aria-live="polite">
                <p className="lp-quiz__score">
                    <strong>{count}</strong>
                    <span>/{total}</span>
                </p>
                <div className="lp-quiz__meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count} aria-label="Puntos marcados">
                    <span style={{ '--s': ratio } as CSSProperties} />
                </div>
                <p className="lp-quiz__msg">{message}</p>
                {label && (
                    <a className="lp-btn" href={ctaHref({ label, action: 'lead_form', value: '' }, ctx)} onClick={prefill}>
                        {label}
                        <ArrowRight size={18} aria-hidden />
                    </a>
                )}
            </div>
        </div>
    );
}

// ---- Barra de anuncio ----------------------------------------------------------------

export function PromoBar({ section, theme, ctx }: { section: PublicSection; theme: ThemeData; ctx: CtaContext }) {
    const key = `lp-promo-${section.id}`;
    const [hidden, setHidden] = useState(false);
    const c = section.content;
    const look = sectionLook(section.style, theme);
    const link = ctaOf(c, 'link');

    useEffect(() => {
        try {
            if (sessionStorage.getItem(key) === '1') setHidden(true);
        } catch {
            /* sin almacenamiento */
        }
    }, [key]);

    if (hidden || !text(c, 'text')) return null;

    return (
        <div className="lp-promo" style={look.style} role="region" aria-label="Anuncio">
            <p>
                {text(c, 'text')}{' '}
                {link && (
                    <a href={ctaHref(link, ctx)}>
                        {link.label}
                    </a>
                )}
            </p>
            {flag(c, 'dismissible') && (
                <button
                    type="button"
                    aria-label="Cerrar anuncio"
                    onClick={() => {
                        setHidden(true);
                        try {
                            sessionStorage.setItem(key, '1');
                        } catch {
                            /* sin almacenamiento */
                        }
                    }}
                >
                    <X size={18} aria-hidden />
                </button>
            )}
        </div>
    );
}

// ---- Pop-up ----------------------------------------------------------------------------

export function Popup({ section, theme, ctx }: { section: PublicSection; theme: ThemeData; ctx: CtaContext }) {
    const c = section.content;
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const key = `lp-popup-${section.id}`;
    const trigger = text(c, 'trigger') || 'delay';
    const center = text(c, 'position') === 'center';
    const once = flag(c, 'once');
    const look = sectionLook(section.style, theme);
    const button = ctaOf(c, 'button');

    useEffect(() => {
        try {
            if (once && sessionStorage.getItem(key) === '1') return;
        } catch {
            /* sin almacenamiento */
        }

        const show = () => setOpen(true);
        const cleanups: (() => void)[] = [];
        const touch = window.matchMedia('(hover: none)').matches;
        const seconds = Math.max(3, num(c, 'seconds', 30));

        if (trigger === 'delay' || (trigger === 'exit' && touch)) {
            const t = window.setTimeout(show, (trigger === 'exit' ? Math.max(seconds, 45) : seconds) * 1000);
            cleanups.push(() => window.clearTimeout(t));
        } else if (trigger === 'scroll') {
            const percent = num(c, 'scroll_percent', 50);
            const onScroll = () => {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                if (max > 0 && (window.scrollY / max) * 100 >= percent) show();
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            cleanups.push(() => window.removeEventListener('scroll', onScroll));
        } else if (trigger === 'exit') {
            const onOut = (e: MouseEvent) => {
                if (!e.relatedTarget && e.clientY <= 0) show();
            };
            document.addEventListener('mouseout', onOut);
            cleanups.push(() => document.removeEventListener('mouseout', onOut));
        }
        return () => cleanups.forEach((fn) => fn());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, trigger]);

    useEffect(() => {
        if (!open) return;
        try {
            sessionStorage.setItem(key, '1');
        } catch {
            /* sin almacenamiento */
        }
        if (center) closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, center, key]);

    if (!open) return null;

    return (
        <div className={`lp-popup ${center ? 'lp-popup--center' : 'lp-popup--corner'}`} style={look.style}>
            {center && <div className="lp-popup__backdrop" onClick={() => setOpen(false)} aria-hidden />}
            <div className="lp-popup__card" role="dialog" aria-modal={center} aria-labelledby={`pp-${section.id}`}>
                <button ref={closeRef} type="button" className="lp-popup__close" aria-label="Cerrar" onClick={() => setOpen(false)}>
                    <X size={18} aria-hidden />
                </button>
                <h2 id={`pp-${section.id}`}>{text(c, 'title')}</h2>
                {text(c, 'text') && <p>{text(c, 'text')}</p>}
                {button && (
                    <a className="lp-btn" href={ctaHref(button, ctx)} onClick={() => setOpen(false)}>
                        {button.label}
                        <ArrowRight size={18} aria-hidden />
                    </a>
                )}
            </div>
        </div>
    );
}
