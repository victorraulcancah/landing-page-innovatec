import { ctaHref, isDark, resolveColor, readableOn, sectionLook, type CtaContext, type PublicSection } from '@/lib/landing';
import { type NavbarData, type ThemeData } from '@/types/cms';
import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface NavbarProps {
    navbar: NavbarData;
    theme: ThemeData;
    sections: PublicSection[];
    ctaContext: CtaContext;
}

interface NavLink {
    label: string;
    href: string;
    anchor: string | null;
}

export function Navbar({ navbar, theme, sections, ctaContext }: NavbarProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string | null>(null);

    const bg = resolveColor(navbar.bg_color, theme) ?? theme.background;
    const fg = resolveColor(navbar.text_color, theme) ?? readableOn(bg, theme);
    const dark = isDark(bg);

    const look = useMemo(
        () => sectionLook({ bg_color: navbar.bg_color, text_color: navbar.text_color, accent_color: null, align: 'left', padding: 'md', width: 'normal', image_position: 'right' }, theme),
        [navbar.bg_color, navbar.text_color, theme],
    );

    const links: NavLink[] = useMemo(() => {
        if (navbar.links_mode === 'manual') {
            return navbar.links.map((l) => {
                const target = l.target.trim();
                const anchor = target.startsWith('#') ? target.slice(1) : null;
                return { label: l.label, href: /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(target) ? target : `#${target}`, anchor };
            });
        }
        return sections.filter((s) => s.nav_label).map((s) => ({ label: s.nav_label as string, href: `#${s.anchor}`, anchor: s.anchor }));
    }, [navbar.links_mode, navbar.links, sections]);

    // Marca la seccion que se esta leyendo.
    useEffect(() => {
        const anchors = links.map((l) => l.anchor).filter((a): a is string => Boolean(a));
        const nodes = anchors.map((a) => document.getElementById(a)).filter((n): n is HTMLElement => n !== null);
        if (nodes.length === 0 || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActive(visible.target.id);
            },
            { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
        );
        nodes.forEach((n) => observer.observe(n));
        return () => observer.disconnect();
    }, [links]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const cta = navbar.show_cta && navbar.cta.label ? navbar.cta : null;
    const centered = navbar.logo_position === 'center';

    const brand = (
        <a href="#top" className={`lp-brand ${dark && navbar.logo ? 'lp-brand--plaque' : ''}`} onClick={() => setOpen(false)}>
            {navbar.logo ? <img src={navbar.logo} alt={navbar.brand_text} /> : <span>{navbar.brand_text}</span>}
            {navbar.brand_sub && <small>{navbar.brand_sub}</small>}
        </a>
    );

    return (
        <header
            className={`lp-nav lp-nav--links-${navbar.links_align} ${centered ? 'lp-nav--center' : ''} ${navbar.sticky ? '' : 'lp-nav--static'} ${navbar.border ? 'lp-nav--border' : ''}`}
            style={{ ...look.style, '--bg': bg, '--fg': fg } as React.CSSProperties}
        >
            <div className="lp-nav__inner">
                {brand}

                {links.length > 0 ? (
                    <nav aria-label="Principal" className="contents">
                        <ul className="lp-nav__links">
                            {links.map((l) => (
                                <li key={l.href + l.label}>
                                    <a href={l.href} aria-current={l.anchor && active === l.anchor ? 'true' : undefined}>
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ) : (
                    <span className="lp-nav__spacer" />
                )}

                {cta && (
                    <a className="lp-btn lp-btn--sm lp-nav__cta" href={ctaHref(cta, ctaContext)}>
                        {cta.label}
                    </a>
                )}

                {(links.length > 0 || cta) && (
                    <button type="button" className="lp-nav__toggle" aria-expanded={open} aria-controls="lp-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen((v) => !v)}>
                        {open ? <X /> : <Menu />}
                    </button>
                )}
            </div>

            {open && (
                <div id="lp-menu" className="lp-nav__panel">
                    <ul>
                        {links.map((l) => (
                            <li key={l.href + l.label}>
                                <a href={l.href} onClick={() => setOpen(false)}>
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {cta && (
                        <a className="lp-btn" href={ctaHref(cta, ctaContext)} onClick={() => setOpen(false)}>
                            {cta.label}
                        </a>
                    )}
                </div>
            )}
        </header>
    );
}
