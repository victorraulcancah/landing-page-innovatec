import { DocModal } from '@/components/landing/doc-modal';
import { mapLinks, resolveColor, readableOn, safeHref, sectionLook, whatsappHref } from '@/lib/landing';
import { type ContactData, type FooterColumn, type FooterData, type FooterDoc, type FooterLink, type ThemeData } from '@/types/cms';
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { type CSSProperties, useState } from 'react';

export function ContactList({ contact }: { contact: ContactData }) {
    const phoneDigits = contact.phone.replace(/[^\d+]/g, '');
    const maps = mapLinks(contact);
    const items = [
        contact.whatsapp && { icon: MessageCircle, label: 'WhatsApp', text: contact.whatsapp, href: whatsappHref(contact) },
        contact.phone && { icon: Phone, label: 'Teléfono', text: contact.phone, href: `tel:${phoneDigits}` },
        contact.email && { icon: Mail, label: 'Correo', text: contact.email, href: `mailto:${contact.email}` },
        contact.address && { icon: MapPin, label: 'Dirección', text: contact.address, href: maps?.open ?? null },
    ].filter(Boolean) as { icon: typeof Mail; label: string; text: string; href: string | null }[];

    if (items.length === 0) return null;

    return (
        <ul className="lp-contact">
            {items.map(({ icon: Icon, label, text, href }, index) => (
                <li key={label} data-reveal="up" style={{ '--i': index + 2 } as CSSProperties}>
                    <Icon size={20} aria-hidden />
                    <span>
                        <span className="sr-only">{label}: </span>
                        {href ? (
                            <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                                {text}
                            </a>
                        ) : (
                            text
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** Mapa de la ubicación con un botón «Cómo llegar» que abre Google Maps. */
export function LocationMap({ contact }: { contact: ContactData }) {
    const maps = mapLinks(contact);
    if (!maps) return null;

    // El botón va fuera del mapa: así no tapa el logo ni la atribución de Google.
    const open = (
        <a className="lp-btn lp-btn--ghost lp-btn--sm lp-map__open" href={maps.open} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} aria-hidden />
            Cómo llegar en Google Maps
        </a>
    );

    return (
        <div className="lp-map" data-reveal="up" style={{ '--i': 5 } as CSSProperties}>
            {maps.embed && (
                <div className="lp-map__frame">
                    <iframe title="Mapa de nuestra ubicación" src={maps.embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                </div>
            )}
            {open}
        </div>
    );
}

export function Footer({ footer, contact, theme }: { footer: FooterData; contact: ContactData; theme: ThemeData }) {
    const bg = resolveColor(footer.bg_color, theme) ?? theme.dark;
    const fg = resolveColor(footer.text_color, theme) ?? readableOn(bg, theme);
    const look = sectionLook({ bg_color: bg, text_color: fg, accent_color: null, align: 'left', padding: 'md', width: 'normal', image_position: 'right' }, theme);
    const [doc, setDoc] = useState<FooterDoc | null>(null);

    const docs = (footer.docs ?? []).filter((d) => d.label);
    const norm = (s: string) => s.trim().toLowerCase();
    const provider = [footer.provider_name, footer.provider_ruc && `RUC ${footer.provider_ruc}`, footer.provider_address].filter(Boolean).join(' · ');
    const line = 'border-[color-mix(in_srgb,var(--fg)_16%,transparent)]';

    // Columnas de enlaces (Ajustes del sitio → Pie de página). Lo que existe pero ninguna columna enlaza (el Libro de
    // Reclamaciones y los documentos legales) se agrega al final de la última columna, para que nada deje de verse.
    const base = footer.columns ?? [];
    const linked = base.flatMap((c) => c.links);
    const extra: FooterLink[] = [
        ...(footer.claims_enabled && !linked.some((l) => l.kind === 'claims') ? [{ label: footer.claims_label || 'Libro de Reclamaciones', kind: 'claims' as const, value: '' }] : []),
        ...docs.filter((d) => !linked.some((l) => l.kind === 'doc' && norm(l.value || l.label) === norm(d.label))).map((d) => ({ label: d.label, kind: 'doc' as const, value: d.label })),
    ];
    const columns: FooterColumn[] = extra.length === 0 ? base : base.length === 0 ? [{ title: 'Servicio al cliente', links: extra }] : [...base.slice(0, -1), { ...base[base.length - 1], links: [...base[base.length - 1].links, ...extra] }];

    const itemClass = 'cursor-pointer text-left opacity-85 transition hover:underline hover:underline-offset-4 hover:opacity-100';
    const renderLink = (l: FooterLink) => {
        switch (l.kind) {
            case 'claims':
            case 'lookup':
                return footer.claims_enabled ? (
                    <a href={route(l.kind === 'claims' ? 'claims.create' : 'claims.lookup')} className={itemClass}>
                        {l.label}
                    </a>
                ) : null;
            case 'doc': {
                const d = docs.find((x) => norm(x.label) === norm(l.value || l.label));
                return d ? (
                    <button type="button" onClick={() => setDoc(d)} aria-haspopup="dialog" className={itemClass}>
                        {l.label}
                    </button>
                ) : null;
            }
            case 'anchor':
                return (
                    <a href={`${route('home')}#${l.value}`} className={itemClass}>
                        {l.label}
                    </a>
                );
            case 'whatsapp':
                return (
                    <a href={whatsappHref(contact, l.value || undefined)} target="_blank" rel="noopener noreferrer" className={itemClass}>
                        {l.label}
                    </a>
                );
            case 'phone':
                return (
                    <a href={`tel:${(l.value || contact.phone).replace(/[^\d+]/g, '')}`} className={itemClass}>
                        {l.label}
                    </a>
                );
            case 'email':
                return (
                    <a href={`mailto:${l.value || contact.email}`} className={itemClass}>
                        {l.label}
                    </a>
                );
            default: {
                const href = safeHref(l.value);
                return (
                    <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={itemClass}>
                        {l.label}
                    </a>
                );
            }
        }
    };

    return (
        <footer className="lp-footer" style={look.style}>
            <div className="mx-auto max-w-[80rem] px-5">
                <div className={`grid gap-x-8 gap-y-10 border-t pt-8 sm:grid-cols-2 lg:[grid-template-columns:var(--cols)] ${line}`} style={{ '--cols': `minmax(0,1.25fr) repeat(${Math.max(columns.length, 1)}, minmax(0,1fr))` } as CSSProperties}>
                    <div className="sm:col-span-2 lg:col-span-1">
                        {footer.text && <p className="lp-footer__text">{footer.text}</p>}
                        {footer.legal && <p className="lp-footer__legal">{footer.legal}</p>}
                        {contact.website && <p className="lp-footer__legal">{contact.website}</p>}
                        {footer.show_contact && (
                            <div className="mt-5">
                                <ContactList contact={contact} />
                            </div>
                        )}
                    </div>

                    {columns.map((c, i) => {
                        const items = c.links.map((l, k) => ({ key: `${i}-${k}`, node: renderLink(l) })).filter((x) => x.node);
                        if (!c.title && items.length === 0) return null;
                        return (
                            <nav key={i} aria-label={c.title || 'Enlaces'}>
                                {c.title && <h2 className="font-[family-name:var(--font-head)] text-[0.95rem] font-extrabold tracking-wide">{c.title}</h2>}
                                <ul className="mt-4 grid gap-2.5 text-sm">
                                    {items.map((x) => (
                                        <li key={x.key} className="flex items-start gap-2.5">
                                            <span aria-hidden className="mt-[0.6rem] size-1 shrink-0 rounded-full bg-current opacity-50" />
                                            {x.node}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        );
                    })}
                </div>

                {provider && <p className="mt-10 text-xs opacity-70">{provider}</p>}
            </div>

            {doc && <DocModal doc={doc} onClose={() => setDoc(null)} />}
        </footer>
    );
}
