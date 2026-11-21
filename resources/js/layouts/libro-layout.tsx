import '../../css/landing.css';

import { Footer } from '@/components/landing/footer';
import { WhatsappChat } from '@/components/landing/whatsapp-chat';
import { fontHref, fontStack, radiusVars } from '@/lib/landing';
import { type ContactData, type FooterData, type NavbarData, type ThemeData } from '@/types/cms';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { type CSSProperties, type ReactNode } from 'react';

export interface Shell {
    theme: ThemeData;
    navbar: NavbarData;
    contact: ContactData;
    footer: FooterData;
}

/** Marco de las páginas del Libro de Reclamaciones: mismo tema, logo y pie que la landing. */
export default function LibroLayout({ shell, title, children }: { shell: Shell; title: string; children: ReactNode }) {
    const { theme, navbar, contact, footer } = shell;

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

    return (
        <div className="lp" style={rootStyle} data-motion="none">
            <Head title={`${title} · ${navbar.brand_text}`}>
                <meta name="robots" content="noindex" />
                {fonts && <link rel="preconnect" href="https://fonts.bunny.net" crossOrigin="anonymous" />}
                {fonts && <link rel="stylesheet" href={fonts} />}
            </Head>

            <header className="border-b border-[color-mix(in_srgb,var(--c-text)_12%,transparent)] bg-[var(--c-background)] text-[var(--c-text)] print:hidden">
                <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-5 py-3">
                    <Link href={route('home')} className="inline-flex items-center gap-3 font-[family-name:var(--font-head)] text-xl font-extrabold tracking-tight">
                        {navbar.logo ? <img src={navbar.logo} alt={navbar.brand_text} className="h-9 w-auto" /> : <span>{navbar.brand_text}</span>}
                    </Link>
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--c-text)_20%,transparent)] px-3.5 py-2 text-sm font-bold transition hover:bg-[var(--c-surface)]"
                    >
                        <ArrowLeft size={16} aria-hidden />
                        Volver al inicio
                    </Link>
                </div>
            </header>

            <main className="bg-[var(--c-surface)] py-7 text-[var(--c-text)] sm:py-9 print:bg-white print:py-0">
                <div className="mx-auto flex max-w-[80rem] flex-col gap-6 px-5">{children}</div>
            </main>

            <div className="print:hidden">
                <Footer footer={footer} contact={contact} theme={theme} />
            </div>

            <WhatsappChat contact={contact} />
        </div>
    );
}
