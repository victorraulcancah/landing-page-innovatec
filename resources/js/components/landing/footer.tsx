import { PdfModal } from '@/components/landing/pdf-modal';
import { mapLinks, resolveColor, readableOn, sectionLook, whatsappHref } from '@/lib/landing';
import { type ContactData, type FooterData, type ThemeData } from '@/types/cms';
import { BookOpen, Download, ExternalLink, FileText, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
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
    const [pdf, setPdf] = useState<{ title: string; file: string } | null>(null);

    const docs = (footer.docs ?? []).filter((d) => d.file && d.label);
    const provider = [footer.provider_name, footer.provider_ruc && `RUC ${footer.provider_ruc}`, footer.provider_address].filter(Boolean).join(' · ');
    const hasLinks = footer.claims_enabled || docs.length > 0;
    const line = 'border-[color-mix(in_srgb,var(--fg)_16%,transparent)]';

    return (
        <footer className="lp-footer" style={look.style}>
            <div className="lp-footer__inner">
                <div>
                    {footer.text && <p className="lp-footer__text">{footer.text}</p>}
                    {footer.legal && <p className="lp-footer__legal">{footer.legal}</p>}
                    {contact.website && <p className="lp-footer__legal">{contact.website}</p>}
                </div>
                {footer.show_contact && <ContactList contact={contact} />}

                {/* Libro de Reclamaciones y documentos legales (se editan en Ajustes del sitio → Pie de página). */}
                {hasLinks && (
                    <nav aria-label="Información legal" className={`col-span-full flex flex-wrap items-center gap-x-7 gap-y-4 border-t pt-5 ${line}`}>
                        {footer.claims_enabled && (
                            <a
                                href={route('claims.create')}
                                className={`group inline-flex items-center gap-3 rounded-xl border bg-white/5 py-2 pl-2 pr-4 text-left text-sm font-bold transition hover:bg-white/10 ${line}`}
                            >
                                <span className="grid size-9 place-items-center rounded-lg bg-[#be123c] text-white transition group-hover:scale-105">
                                    <BookOpen size={20} aria-hidden />
                                </span>
                                {footer.claims_label || 'Libro de Reclamaciones'}
                            </a>
                        )}
                        {docs.map((d, i) => (
                            <div key={i} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                <span className="inline-flex items-center gap-2 font-bold">
                                    <FileText size={18} aria-hidden />
                                    {d.label}
                                </span>
                                <button type="button" onClick={() => setPdf({ title: d.label, file: d.file as string })} aria-haspopup="dialog" className="cursor-pointer font-semibold underline underline-offset-4 transition hover:opacity-75">
                                    Ver
                                </button>
                                <a href={d.file as string} download={`${d.label.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}.pdf`} className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 transition hover:opacity-75">
                                    <Download size={14} aria-hidden />
                                    Descargar
                                </a>
                            </div>
                        ))}
                    </nav>
                )}

                {provider && <p className={`col-span-full text-xs opacity-70 ${hasLinks ? '' : `border-t pt-5 ${line}`}`}>{provider}</p>}
            </div>

            {pdf && <PdfModal title={pdf.title} file={pdf.file} onClose={() => setPdf(null)} />}
        </footer>
    );
}
