import '../../css/landing.css';

import { Footer } from '@/components/landing/footer';
import { Calculator, Popup, PromoBar } from '@/components/landing/interactive';
import { Navbar } from '@/components/landing/navbar';
import { RENDERERS } from '@/components/landing/sections';
import { eventForLink, startAnalytics, track } from '@/lib/analytics';
import { fontHref, fontStack, radiusVars, sectionLook, type CtaContext, type PublicSection } from '@/lib/landing';
import { useMotion } from '@/lib/use-motion';
import { type AnalyticsData, type ContactData, type FooterData, type NavbarData, type ThemeData } from '@/types/cms';
import { Head, Link, usePage } from '@inertiajs/react';
import { type CSSProperties, useEffect, useRef } from 'react';

interface Props {
    campaign: { id: number; name: string; meta_title: string | null; meta_description: string | null } | null;
    sections: PublicSection[];
    theme: ThemeData;
    navbar: NavbarData;
    contact: ContactData;
    footer: FooterData;
    analytics?: AnalyticsData;
    preview: boolean;
}

export default function Landing({ campaign, sections: allSections, theme, navbar, contact, footer, analytics, preview }: Props) {
    // La barra de anuncio y los pop-ups no forman parte del orden de la página; la calculadora «en portada» va dentro de la portada.
    const promo = allSections.find((s) => s.type === 'promo');
    const popups = allSections.filter((s) => s.type === 'popup');
    const heroCalc = allSections.some((s) => s.type === 'hero') ? allSections.find((s) => s.type === 'calculator' && s.content.in_hero === true) : undefined;
    const sections = allSections.filter((s) => s.type !== 'promo' && s.type !== 'popup' && s !== heroCalc);

    const rootRef = useRef<HTMLDivElement>(null);
    useMotion(rootRef, theme.motion ?? 'full', sections.map((s) => s.id).join(','));

    // Analytics: solo con ID en el panel, y no cuenta las visitas de quien administra (sesión iniciada) ni la vista previa.
    const admin = Boolean(usePage<{ auth?: { user?: unknown } }>().props.auth?.user);
    const gaId = analytics?.ga_id ?? '';
    useEffect(() => {
        if (!gaId || preview || admin) return;
        if (!startAnalytics(gaId)) return;

        // Los clics que son un contacto (WhatsApp, teléfono, correo, mapa) y los botones que llevan al formulario.
        const onClick = (e: MouseEvent) => {
            const link = (e.target as Element | null)?.closest?.('a[href]');
            if (!link) return;
            const href = link.getAttribute('href') ?? '';
            const label = (link.textContent ?? '').trim().slice(0, 60);
            const contactEvent = eventForLink(href);
            if (contactEvent) track(contactEvent, { link_text: label });
            else if (href.startsWith('#') && href.length > 1 && link.closest('.lp-btn, .lp-nav__cta, .lp-calc__cta, .lp-stop__go')) track('click_cta', { link_text: label, destino: href });
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [gaId, preview, admin]);

    const formSection = sections.find((s) => s.type === 'cta' && s.content.show_form === true) ?? sections.find((s) => s.type === 'cta');
    const ctx: CtaContext = { contact, formAnchor: formSection?.anchor ?? 'contacto' };

    const rootStyle = {
        '--c-primary': theme.primary,
        '--c-on-primary': theme.on_primary,
        '--c-accent': theme.accent,
        '--c-background': theme.background,
        '--c-surface': theme.surface,
        '--c-text': theme.text,
        '--c-muted': theme.muted,
        '--c-dark': theme.dark,
        '--c-on-dark': theme.on_dark,
        '--font-head': fontStack(theme.heading_font),
        '--font-body': fontStack(theme.body_font),
        ...radiusVars(theme.radius),
    } as CSSProperties;

    const fonts = fontHref([theme.heading_font, theme.body_font]);
    const title = campaign?.meta_title || campaign?.name || navbar.brand_text;

    return (
        <div className="lp" id="top" style={rootStyle} ref={rootRef} data-motion={theme.motion ?? 'full'}>
            <Head title={title}>
                {campaign?.meta_description && <meta name="description" content={campaign.meta_description} />}
                {fonts && <link rel="preconnect" href="https://fonts.bunny.net" crossOrigin="anonymous" />}
                {fonts && <link rel="stylesheet" href={fonts} />}
            </Head>

            <a href="#contenido" className="lp-skip">
                Saltar al contenido
            </a>

            {preview && campaign && (
                <div className="lp-preview">
                    Vista previa de «{campaign.name}» ·{' '}
                    <Link href={route('campaigns.edit', campaign.id)} className="underline">
                        Volver al panel
                    </Link>
                </div>
            )}

            {promo && <PromoBar section={promo} theme={theme} ctx={ctx} />}

            <Navbar navbar={navbar} theme={theme} sections={sections} ctaContext={ctx} />

            <main id="contenido" tabIndex={-1} style={{ outline: 'none' }}>
                {!campaign || sections.length === 0 ? (
                    <div className="lp-empty">
                        <h1 className="lp-h2" style={{ marginInline: 'auto' }}>
                            Estamos preparando esta página
                        </h1>
                        {contact.email && <p>Escríbenos a {contact.email}</p>}
                    </div>
                ) : (
                    sections.map((section, index) => {
                        const Renderer = RENDERERS[section.type];
                        if (!Renderer) return null;
                        // Donde cambia el fondo entre dos secciones, el borde se corta en diagonal (alternando el sentido).
                        const bg = (s: PublicSection) => String((sectionLook(s.style, theme).style as Record<string, unknown>)['--bg']);
                        const changes = index > 0 && bg(sections[index - 1]) !== bg(section);
                        const cutsBefore = sections.slice(1, index).filter((s, i) => bg(sections[i]) !== bg(s)).length;
                        const cut = changes ? (cutsBefore % 2 === 0 ? 'up' : 'down') : null;
                        const aside = section.type === 'hero' && heroCalc ? <Calculator section={heroCalc} ctx={ctx} /> : undefined;
                        return <Renderer key={section.id} section={section} theme={theme} ctx={ctx} contact={contact} campaignId={campaign.id} preview={preview} cut={cut} aside={aside} />;
                    })
                )}
            </main>

            <Footer footer={footer} contact={contact} theme={theme} />

            {popups.map((popup) => (
                <Popup key={popup.id} section={popup} theme={theme} ctx={ctx} />
            ))}
        </div>
    );
}
