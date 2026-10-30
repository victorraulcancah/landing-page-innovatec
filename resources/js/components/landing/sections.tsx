import { ContactList } from '@/components/landing/footer';
import { Calculator, Quiz } from '@/components/landing/interactive';
import { LeadForm } from '@/components/landing/lead-form';
import { Rich } from '@/components/landing/rich';
import { AUTO_VISUALS, Ticker, Visual, type VisualKind } from '@/components/landing/visuals';
import { ctaHref, ctaOf, flag, list, sectionLook, splitStations, text, type CtaContext, type PublicSection } from '@/lib/landing';
import { type ContactData, type Json, type SectionStyle, type ThemeData } from '@/types/cms';
import { ArrowRight, Check, X } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

export interface SectionProps {
    section: PublicSection;
    theme: ThemeData;
    ctx: CtaContext;
    contact: ContactData;
    campaignId: number | null;
    preview: boolean;
    /** Corte diagonal sobre la seccion anterior cuando cambia el fondo. */
    cut: 'up' | 'down' | null;
    /** Contenido que reemplaza la foto de la portada (p. ej. la calculadora). */
    aside?: ReactNode;
}

const str = (v: Json | undefined): string => (typeof v === 'string' ? v : '');

/** Cifra que cuenta hasta su valor cuando entra en pantalla (si empieza con un número). */
function CountUp({ value }: { value: string }) {
    const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
    const ref = useRef<HTMLSpanElement>(null);
    const [shown, setShown] = useState<string | null>(null);

    useEffect(() => {
        const node = ref.current;
        const root = node?.closest('.lp');
        if (!match || !node || !root || !root.classList.contains('lp--js') || root.getAttribute('data-motion') !== 'full' || typeof IntersectionObserver === 'undefined') return;

        const target = parseFloat(match[2].replace(',', '.'));
        const decimals = (match[2].split(/[.,]/)[1] ?? '').length;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min(1, (now - start) / 1200);
                const eased = 1 - Math.pow(1 - t, 4);
                setShown((target * eased).toFixed(decimals).replace('.', match[2].includes(',') ? ',' : '.'));
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        observer.observe(node);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!match) return <>{value}</>;
    return (
        <span ref={ref}>
            {match[1]}
            {shown ?? match[2]}
            {match[3]}
        </span>
    );
}

/** Imagen de fondo de una sección: lleva una capa del color de la sección para que el texto siempre se lea. */
function SectionBg({ style }: { style: SectionStyle }) {
    if (!style.bg_image) return null;

    return (
        <div className={`lp-bg lp-bg--${style.bg_overlay || 'strong'}`} aria-hidden>
            <div className="lp-bg__img" data-scrub style={{ backgroundImage: `url("${style.bg_image}")` }} />
        </div>
    );
}

function Frame({ section, theme, cut, children, decor }: { section: PublicSection; theme: ThemeData; cut: SectionProps['cut']; children: ReactNode; decor?: ReactNode }) {
    const { style } = sectionLook(section.style, theme);
    const { align, padding, width } = section.style;
    const title = text(section.content, 'title');

    return (
        <section
            id={section.anchor}
            data-reveal="section"
            data-tone={section.style.image_tone || 'natural'}
            className={`lp-section lp-pad-${padding} lp-align-${align} ${section.style.bg_image ? 'lp-section--bgimg' : ''} ${cut ? `lp-section--cut lp-section--cut-${cut}` : ''}`}
            style={style}
            aria-labelledby={title ? `h-${section.id}` : undefined}
        >
            <SectionBg style={section.style} />
            {decor}
            <div className={`lp-inner ${width === 'narrow' ? 'lp-inner--narrow' : width === 'wide' ? 'lp-inner--wide' : ''}`}>{children}</div>
        </section>
    );
}

function Head({ section }: { section: PublicSection }) {
    const title = text(section.content, 'title');
    const subtitle = text(section.content, 'subtitle');
    if (!title && !subtitle) return null;
    return (
        <div className="lp-head" data-reveal="head">
            {title && <Rich as="h2" inline id={`h-${section.id}`} className="lp-h2" html={title} />}
            {subtitle && <Rich className="lp-lead" html={subtitle} />}
        </div>
    );
}

// ---- Portada ---------------------------------------------------------------

export function Hero({ section, theme, ctx, aside }: SectionProps) {
    const c = section.content;
    const { style } = sectionLook(section.style, theme);
    const image = text(c, 'image');
    const primary = ctaOf(c, 'primary_cta');
    const secondary = ctaOf(c, 'secondary_cta');
    const stations = splitStations(text(c, 'note'));
    const position = section.style.image_position;

    return (
        <section
            id={section.anchor}
            data-tone={section.style.image_tone || 'natural'}
            className={`lp-hero lp-hero--${position} ${aside ? 'lp-hero--aside' : ''} ${image || aside ? '' : 'lp-hero__nophoto'} ${section.style.bg_image ? 'lp-section--bgimg' : ''}`}
            style={style}
            aria-labelledby={`h-${section.id}`}
        >
            <SectionBg style={section.style} />
            <div className="lp-hero__grid">
                <div>
                    <Rich as="h1" inline id={`h-${section.id}`} html={text(c, 'title')} />
                    {text(c, 'subtitle') && <Rich className="lp-hero__lead" html={text(c, 'subtitle')} />}
                    {(primary || secondary) && (
                        <div className="lp-hero__actions">
                            {primary && (
                                <a className="lp-btn" href={ctaHref(primary, ctx)}>
                                    {primary.label}
                                    <ArrowRight size={18} aria-hidden />
                                </a>
                            )}
                            {secondary && (
                                <a className="lp-btn lp-btn--ghost" href={ctaHref(secondary, ctx)}>
                                    {secondary.label}
                                </a>
                            )}
                        </div>
                    )}
                </div>
                {aside && <div className="lp-hero__aside">{aside}</div>}
                {!aside && image && (
                    <div className="lp-photo">
                        <div className="lp-photo__blue" aria-hidden />
                        <img className="lp-photo__img" src={image} alt={text(c, 'image_alt')} />
                        <div className="lp-photo__orange" aria-hidden />
                    </div>
                )}
            </div>

            {stations.length > 0 && (
                <div className="lp-route">
                    <ol className="lp-route__list" style={{ '--n': stations.length } as CSSProperties} aria-label="Servicios incluidos">
                        {stations.map((name) => (
                            <li className="lp-stop" key={name}>
                                <span className="lp-ring" aria-hidden />
                                <span className="lp-sign">{name}</span>
                            </li>
                        ))}
                        {primary && (
                            <li className="lp-stop">
                                <span className="lp-ring lp-ring--terminal" aria-hidden />
                                <a className="lp-stop__go" href={ctaHref(primary, ctx)}>
                                    {primary.label}
                                    <ArrowRight size={18} aria-hidden />
                                </a>
                            </li>
                        )}
                    </ol>
                </div>
            )}
        </section>
    );
}

// ---- Comparativa -----------------------------------------------------------

export function Comparison({ section, theme, cut }: SectionProps) {
    const c = section.content;
    const rows = list(c, 'rows');
    const left = text(c, 'left_label');
    const right = text(c, 'right_label');

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <table className="lp-compare" data-reveal="rows">
                <thead>
                    <tr>
                        <th scope="col">
                            <span className="sr-only">Tema</span>
                        </th>
                        <th scope="col" className="is-them">
                            {left}
                        </th>
                        <th scope="col" className="is-us">
                            {right}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} style={{ '--i': i } as CSSProperties}>
                            <th scope="row">{str(r.topic)}</th>
                            <td className="is-them" data-label={left}>
                                <span className="lp-cell">
                                    <span className="lp-mark lp-mark--no" aria-hidden>
                                        <X size={14} strokeWidth={3} />
                                    </span>
                                    <span>
                                        <span className="sr-only">{left}: </span>
                                        {str(r.left)}
                                    </span>
                                </span>
                            </td>
                            <td className="is-us" data-label={right}>
                                <span className="lp-cell">
                                    <span className="lp-mark lp-mark--yes" aria-hidden>
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <span>
                                        <span className="sr-only">{right}: </span>
                                        {str(r.right)}
                                    </span>
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Frame>
    );
}

// ---- Tarjetas y pasos como estaciones --------------------------------------

export function Features({ section, theme, cut }: SectionProps) {
    const items = list(section.content, 'items');
    const cols = Math.min(4, Math.max(2, parseInt(text(section.content, 'columns'), 10) || 3));

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            {text(section.content, 'image') && (
                <figure className="lp-banner" data-reveal="photo">
                    <img src={text(section.content, 'image')} alt={text(section.content, 'image_alt')} data-scrub />
                </figure>
            )}
            <ol className="lp-stations" data-reveal="route" style={{ '--cols': cols } as CSSProperties}>
                {items.map((it, i) => (
                    <li key={i} style={{ '--i': i } as CSSProperties} className={`lp-station ${i % cols === cols - 1 || i === items.length - 1 ? 'lp-station--end' : ''} ${str(it.badge) ? 'lp-station--signed' : ''}`}>
                        <span className="lp-ring" aria-hidden />
                        {str(it.badge) && <span className="lp-sign lp-sign--on-line">{str(it.badge)}</span>}
                        <h3>{str(it.title)}</h3>
                        {str(it.text) && <Rich html={str(it.text)} />}
                    </li>
                ))}
            </ol>
        </Frame>
    );
}

export function Steps({ section, theme, cut }: SectionProps) {
    const items = list(section.content, 'items');
    const cols = Math.min(4, Math.max(2, items.length));

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <ol className="lp-stations lp-stations--num" data-reveal="route" style={{ '--cols': cols } as CSSProperties}>
                {items.map((it, i) => {
                    const last = i === items.length - 1;
                    return (
                        <li key={i} style={{ '--i': i } as CSSProperties} className={`lp-station ${i % cols === cols - 1 || last ? 'lp-station--end' : ''}`}>
                            <span className={`lp-ring lp-ring--num ${last ? 'lp-ring--end' : ''}`} aria-hidden>
                                {i + 1}
                            </span>
                            <h3>
                                <span className="sr-only">Paso {i + 1}: </span>
                                {str(it.title)}
                            </h3>
                            {str(it.text) && <Rich html={str(it.text)} />}
                        </li>
                    );
                })}
            </ol>
        </Frame>
    );
}

// ---- Paquetes ---------------------------------------------------------------

export function Packages({ section, theme, ctx, cut }: SectionProps) {
    const items = list(section.content, 'items');
    const cols = Math.min(3, Math.max(1, items.length));

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <ul className="lp-tickets" style={{ '--cols': cols } as CSSProperties}>
                {items.map((p, i) => {
                    const features = str(p.features).split('\n').map((l) => l.trim()).filter(Boolean);
                    return (
                        <li key={i} data-reveal="up" style={{ '--i': i } as CSSProperties} className={`lp-ticket ${p.highlighted === true ? 'lp-ticket--hot' : ''}`}>
                            <div>
                                <h3>{str(p.name)}</h3>
                                {str(p.tagline) && <p className="lp-ticket__tag">{str(p.tagline)}</p>}
                            </div>
                            {str(p.price_label) && <p className="lp-ticket__price">{str(p.price_label)}</p>}
                            {features.length > 0 && (
                                <ul>
                                    {features.map((f) => (
                                        <li key={f}>
                                            <Check size={18} strokeWidth={3} aria-hidden />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {str(p.cta_label) && (
                                <a className="lp-btn" href={ctaHref({ label: '', action: 'lead_form', value: '' }, ctx)}>
                                    {str(p.cta_label)}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ul>
            {text(section.content, 'note') && <p className="lp-note">{text(section.content, 'note')}</p>}
        </Frame>
    );
}

// ---- Prueba social -----------------------------------------------------------

export function Proof({ section, theme, cut }: SectionProps) {
    const stats = list(section.content, 'stats');
    const quotes = list(section.content, 'quotes');
    if (stats.length === 0 && quotes.length === 0) return null;

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            {stats.length > 0 && (
                <ul className="lp-stats">
                    {stats.map((s, i) => (
                        <li key={i} className="lp-stat" data-reveal="up" style={{ '--i': i } as CSSProperties}>
                            <strong>
                                <CountUp value={str(s.value)} />
                            </strong>
                            <span>{str(s.label)}</span>
                        </li>
                    ))}
                </ul>
            )}
            {quotes.length > 0 && (
                <div className="lp-quotes">
                    {quotes.map((q, i) => (
                        <blockquote key={i} className="lp-quote" data-reveal="up" style={{ '--i': i } as CSSProperties}>
                            <Rich html={str(q.text)} />
                            <footer>
                                <cite>{str(q.author)}</cite>
                                {str(q.role) && <span> · {str(q.role)}</span>}
                            </footer>
                        </blockquote>
                    ))}
                </div>
            )}
        </Frame>
    );
}

// ---- Preguntas frecuentes ----------------------------------------------------

export function Faq({ section, theme, ctx, cut }: SectionProps) {
    const c = section.content;
    const items = list(c, 'items');
    const image = text(c, 'image');
    // Los textos del aviso son nuevos: si la campaña es anterior y no los trae, se usan los de fábrica.
    const helpTitle = 'help_title' in c ? text(c, 'help_title') : '¿Tienes otra pregunta?';
    const helpCta = 'help_cta' in c ? ctaOf(c, 'help_cta') : { label: 'Escríbenos por WhatsApp', action: 'whatsapp', value: '' };

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <div className="lp-faqwrap">
                <div className="lp-faq">
                    {items.map((it, i) => (
                        <details key={i} data-reveal="up" style={{ '--i': i } as CSSProperties}>
                            <summary>{str(it.q)}</summary>
                            <Rich className="lp-faq__a" html={str(it.a)} />
                        </details>
                    ))}
                </div>
                <aside className="lp-faq__side">
                    {image ? (
                        <figure className="lp-faq__photo" data-reveal="photo">
                            <img src={image} alt={text(c, 'image_alt')} />
                        </figure>
                    ) : (
                        <Visual kind="chat" />
                    )}
                    {(helpTitle || helpCta) && (
                        <div className="lp-faq__help" data-reveal="up" style={{ '--i': 2 } as CSSProperties}>
                            {helpTitle && <p>{helpTitle}</p>}
                            {helpCta && (
                                <a className="lp-btn" href={ctaHref(helpCta, ctx)}>
                                    {helpCta.label}
                                    <ArrowRight size={18} aria-hidden />
                                </a>
                            )}
                        </div>
                    )}
                </aside>
            </div>
        </Frame>
    );
}

// ---- Texto libre -------------------------------------------------------------

export function TextBlock({ section, theme, cut }: SectionProps) {
    const c = section.content;
    const image = text(c, 'image');
    const pos = section.style.image_position;
    const overlay = text(c, 'overlay');

    const media = image ? (
        <div className="lp-split__media" data-reveal="wipe">
            <img src={image} alt={text(c, 'image_alt')} />
            {(overlay === 'report' || overlay === 'chat') && <Visual kind={overlay} className="lp-float" scrub />}
        </div>
    ) : null;

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <div className={`lp-split ${image && pos !== 'top' ? 'lp-split--img' : ''} ${pos === 'left' ? 'lp-split--left' : ''}`}>
                {pos === 'top' && media}
                <div className="lp-prose">
                    <Head section={section} />
                    <Rich html={text(c, 'body')} reveal="up" style={{ '--i': 1 } as CSSProperties} />
                </div>
                {pos !== 'top' && media}
            </div>
        </Frame>
    );
}

// ---- Llamado final -----------------------------------------------------------

export function Cta({ section, theme, ctx, contact, campaignId, preview, cut }: SectionProps) {
    const c = section.content;
    const showForm = flag(c, 'show_form');
    const button = ctaOf(c, 'button');
    const blades = (
        <div className="lp-blades" aria-hidden data-reveal="blades">
            <i />
            <i />
            <i />
        </div>
    );

    return (
        <Frame section={section} theme={theme} cut={cut} decor={blades}>
            <div className={`lp-cta__grid ${showForm ? 'lp-cta__grid--form' : ''}`}>
                <div>
                    <div className="lp-terminal" aria-hidden data-reveal="cta" />
                    <div className="lp-head" style={{ marginBottom: 0 }}>
                        <Rich as="h2" inline id={`h-${section.id}`} className="lp-h2" html={text(c, 'title')} />
                        {text(c, 'text') && <Rich className="lp-lead" html={text(c, 'text')} />}
                    </div>
                    {button && (
                        <p style={{ marginTop: '1.5rem' }}>
                            <a className="lp-btn lp-btn--ghost" href={ctaHref(button, ctx)}>
                                {button.label}
                            </a>
                        </p>
                    )}
                    {flag(c, 'show_contact') && <ContactList contact={contact} />}
                </div>
                {showForm && (
                    <div className="lp-panel" data-reveal="up" style={{ '--i': 2 } as CSSProperties}>
                        <LeadForm campaignId={campaignId} buttonLabel={text(c, 'form_button')} preview={preview} />
                    </div>
                )}
            </div>
        </Frame>
    );
}

// ---- Calculadora como sección ------------------------------------------------------------------

export function CalculatorSection({ section, theme, ctx, cut }: SectionProps) {
    return (
        <Frame section={section} theme={theme} cut={cut}>
            <div className="lp-calc-wrap">
                <Calculator section={section} ctx={ctx} />
            </div>
        </Frame>
    );
}

// ---- Autodiagnóstico -------------------------------------------------------------------------------

export function QuizSection({ section, theme, ctx, cut }: SectionProps) {
    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <Quiz section={section} ctx={ctx} />
        </Frame>
    );
}

// ---- Qué incluye --------------------------------------------------------------------------------------

const VISUAL_KEYS: VisualKind[] = ['chat', 'network', 'backup', 'inventory', 'report'];

/** Qué mostrar junto a un panel: una ilustración, la imagen propia o nada. */
function mediaFor(item: Record<string, Json>, index: number): VisualKind | 'image' | null {
    const choice = str(item.visual) || 'auto';
    if (choice === 'none') return null;
    if (choice === 'image') return str(item.image) ? 'image' : null;
    if ((VISUAL_KEYS as string[]).includes(choice)) return choice as VisualKind;
    return AUTO_VISUALS[index % AUTO_VISUALS.length];
}

export function Included({ section, theme, cut }: SectionProps) {
    const c = section.content;
    const items = list(c, 'items');
    const footerVisual = (str(c.footer_visual) || 'report') === 'report';

    return (
        <Frame section={section} theme={theme} cut={cut}>
            <Head section={section} />
            <ol className="lp-rows" data-progress>
                {items.map((it, i) => {
                    const points = str(it.points).split('\n').map((l) => l.trim()).filter(Boolean);
                    const media = mediaFor(it, i);
                    return (
                        <li key={i} className={`lp-row ${i % 2 === 1 ? 'lp-row--flip' : ''} ${media ? '' : 'lp-row--plain'}`}>
                            <span className="lp-row__ring lp-ring" aria-hidden />
                            <div className="lp-row__copy" data-reveal="up" style={{ '--i': 0 } as CSSProperties}>
                                <h3>{str(it.title)}</h3>
                                <ul>
                                    {points.map((pt) => (
                                        <li key={pt}>
                                            <Check size={18} strokeWidth={3} aria-hidden />
                                            <span>{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {media && (
                                <div className="lp-row__media">
                                    {media === 'image' ? (
                                        <figure className="lp-row__photo" data-reveal="photo">
                                            <img src={str(it.image)} alt={str(it.image_alt)} data-scrub />
                                        </figure>
                                    ) : (
                                        <Visual kind={media} scrub />
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
            {(text(c, 'footer_title') || text(c, 'footer_text')) && (
                <div className={`lp-included__foot ${footerVisual ? 'lp-included__foot--visual' : ''}`} data-reveal="up" style={{ '--i': 1 } as CSSProperties}>
                    <div>
                        {text(c, 'footer_title') && <h3>{text(c, 'footer_title')}</h3>}
                        {text(c, 'footer_text') && <Rich html={text(c, 'footer_text')} />}
                    </div>
                    {footerVisual && <Visual kind="report" />}
                </div>
            )}
        </Frame>
    );
}

// ---- Franja de servicios -------------------------------------------------------------------------------------

export function Marquee({ section, theme }: SectionProps) {
    const { style } = sectionLook(section.style, theme);
    const items = text(section.content, 'items')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 14);
    if (items.length === 0) return null;

    return (
        <section id={section.anchor} className="lp-marquee" style={style} aria-label="Servicios incluidos">
            <Ticker items={items} speed={text(section.content, 'speed')} />
        </section>
    );
}

export const RENDERERS: Record<string, (props: SectionProps) => ReactNode> = {
    hero: Hero,
    calculator: CalculatorSection,
    quiz: QuizSection,
    included: Included,
    marquee: Marquee,
    comparison: Comparison,
    features: Features,
    steps: Steps,
    packages: Packages,
    proof: Proof,
    faq: Faq,
    text: TextBlock,
    cta: Cta,
};
