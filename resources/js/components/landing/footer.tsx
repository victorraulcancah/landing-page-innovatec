import { resolveColor, readableOn, sectionLook, whatsappHref } from '@/lib/landing';
import { type ContactData, type FooterData, type ThemeData } from '@/types/cms';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { type CSSProperties } from 'react';

export function ContactList({ contact }: { contact: ContactData }) {
    const phoneDigits = contact.phone.replace(/[^\d+]/g, '');
    const items = [
        contact.whatsapp && { icon: MessageCircle, label: 'WhatsApp', text: contact.whatsapp, href: whatsappHref(contact) },
        contact.phone && { icon: Phone, label: 'Teléfono', text: contact.phone, href: `tel:${phoneDigits}` },
        contact.email && { icon: Mail, label: 'Correo', text: contact.email, href: `mailto:${contact.email}` },
        contact.address && { icon: MapPin, label: 'Dirección', text: contact.address, href: null },
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

export function Footer({ footer, contact, theme }: { footer: FooterData; contact: ContactData; theme: ThemeData }) {
    const bg = resolveColor(footer.bg_color, theme) ?? theme.dark;
    const fg = resolveColor(footer.text_color, theme) ?? readableOn(bg, theme);
    const look = sectionLook({ bg_color: bg, text_color: fg, accent_color: null, align: 'left', padding: 'md', width: 'normal', image_position: 'right' }, theme);

    return (
        <footer className="lp-footer" style={look.style}>
            <div className="lp-footer__inner">
                <div>
                    {footer.text && <p className="lp-footer__text">{footer.text}</p>}
                    {footer.legal && <p className="lp-footer__legal">{footer.legal}</p>}
                    {contact.website && <p className="lp-footer__legal">{contact.website}</p>}
                </div>
                {footer.show_contact && <ContactList contact={contact} />}
            </div>
        </footer>
    );
}
