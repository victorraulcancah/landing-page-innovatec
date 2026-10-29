import '../../css/landing.css';

import { Footer } from '@/components/landing/footer';
import { Navbar } from '@/components/landing/navbar';
import { RENDERERS } from '@/components/landing/sections';
import { fontHref, fontStack, radiusVars, sectionLook, type CtaContext, type PublicSection } from '@/lib/landing';
import { type ContactData, type FooterData, type NavbarData, type ThemeData } from '@/types/cms';
import { Head, Link } from '@inertiajs/react';
import { type CSSProperties } from 'react';

interface Props {
    campaign: { id: number; name: string; meta_title: string | null; meta_description: string | null } | null;
    sections: PublicSection[];
    theme: ThemeData;
    navbar: NavbarData;
    contact: ContactData;
    footer: FooterData;
    preview: boolean;
}

export default function Landing({ campaign, sections, theme, navbar, contact, footer, preview }: Props) {
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
        <div className="lp" id="top" style={rootStyle}>
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
                        return <Renderer key={section.id} section={section} theme={theme} ctx={ctx} contact={contact} campaignId={campaign.id} preview={preview} cut={cut} />;
                    })
                )}
            </main>

            <Footer footer={footer} contact={contact} theme={theme} />
        </div>
    );
}
