import { type ContactData, type Cta, type Json, type SectionStyle, type ThemeData } from '@/types/cms';
import { type CSSProperties } from 'react';

export interface PublicSection {
    id: number;
    type: string;
    anchor: string;
    nav_label: string | null;
    content: Record<string, Json>;
    style: SectionStyle;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const TOKENS = ['background', 'surface', 'primary', 'accent', 'dark', 'text', 'muted', 'on_primary', 'on_dark'];

/** Un color guardado puede ser #RRGGBB o el nombre de un color del tema. */
export function resolveColor(value: string | null | undefined, theme: ThemeData): string | null {
    if (!value) return null;
    if (HEX.test(value)) return value.toLowerCase();
    if (TOKENS.includes(value)) return theme[value as keyof ThemeData] as string;
    return null;
}

export function luminance(hex: string): number {
    const channel = (i: number) => {
        const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

export function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

export const isDark = (hex: string) => luminance(hex) < 0.179;

/** De los dos colores de texto del tema, el que mejor se lee sobre este fondo. */
export function readableOn(bg: string, theme: ThemeData): string {
    return contrast(bg, theme.on_dark) >= contrast(bg, theme.text) ? theme.on_dark : theme.text;
}

/** Texto para un fondo cualquiera (botones): blanco o azul noche, el de mayor contraste. */
export function inkOn(bg: string, theme: ThemeData): string {
    return contrast(bg, '#ffffff') >= contrast(bg, theme.dark) ? '#ffffff' : theme.dark;
}

export interface SectionLook {
    style: CSSProperties;
    dark: boolean;
}

/** Variables CSS de una seccion a partir de su estilo y del tema. */
export function sectionLook(style: SectionStyle, theme: ThemeData): SectionLook {
    const bg = resolveColor(style.bg_color, theme) ?? theme.background;
    const fg = resolveColor(style.text_color, theme) ?? readableOn(bg, theme);
    const dark = isDark(bg);
    const accent = resolveColor(style.accent_color, theme);
    const line = accent ?? (dark ? theme.accent : theme.primary);
    const btnBg = accent ?? (dark ? theme.accent : theme.primary);
    const btnFg = accent || dark ? inkOn(btnBg, theme) : theme.on_primary;

    return {
        dark,
        style: {
            '--bg': bg,
            '--fg': fg,
            '--line': line,
            '--btn-bg': btnBg,
            '--btn-fg': btnFg,
            '--danger': dark ? '#ff8a7a' : '#b42318',
            '--danger-ink': dark ? theme.dark : '#ffffff',
        } as CSSProperties,
    };
}

export function fontStack(name: string): string {
    return name === 'system' ? "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" : `'${name}', system-ui, sans-serif`;
}

export function fontHref(names: string[]): string | null {
    const families = [...new Set(names)].filter((n) => n !== 'system');
    if (families.length === 0) return null;
    const query = families.map((n) => `${n.toLowerCase().replace(/\s+/g, '-')}:400,500,600,700,800`).join('|');
    return `https://fonts.bunny.net/css?family=${query}&display=swap`;
}

const RADIUS: Record<string, [string, string]> = {
    none: ['0px', '0px'],
    sm: ['4px', '6px'],
    md: ['10px', '12px'],
    lg: ['18px', '22px'],
    full: ['24px', '999px'],
};

export function radiusVars(radius: string): Record<string, string> {
    const [card, btn] = RADIUS[radius] ?? RADIUS.md;
    return { '--r': card, '--r-btn': btn };
}

export function safeHref(url: string): string {
    return /^(https?:\/\/|mailto:|tel:|#|\/)/i.test(url.trim()) ? url.trim() : '#';
}

export function whatsappHref(contact: ContactData, message?: string): string {
    let digits = (contact.whatsapp || '').replace(/\D/g, '');
    if (digits.length === 9) digits = `51${digits}`;
    const text = (message || contact.whatsapp_message || '').trim();
    return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export interface MapLinks {
    /** A dónde lleva «Cómo llegar». */
    open: string;
    /** Mapa incrustado; nulo si no hay dirección ni código de mapa. */
    embed: string | null;
}

/** Enlaces del mapa: los que escribió el administrador o, si faltan, los armados con la dirección. */
export function mapLinks(contact: ContactData): MapLinks | null {
    const address = (contact.address || '').trim();
    const open = (contact.map_url || '').trim();
    const embed = (contact.map_embed || '').trim();
    const coords = (contact.map_coords || '').trim();
    if (!address && !open && !embed) return null;

    const query = encodeURIComponent(/per[uú]/i.test(address) ? address : `${address}, Perú`);
    return {
        open: open || `https://www.google.com/maps/search/?api=1&query=${query}`,
        // Prioridad: el código exacto de Google, luego el punto sacado del enlace y, al final, la dirección escrita.
        embed: embed || (coords ? `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&z=17&output=embed` : address ? `https://maps.google.com/maps?q=${query}&z=16&output=embed` : null),
    };
}

export interface CtaContext {
    contact: ContactData;
    /** Ancla de la seccion con formulario; a donde lleva «Ir al formulario». */
    formAnchor: string;
}

export function ctaHref(cta: Cta, ctx: CtaContext): string {
    const value = (cta.value || '').trim();
    switch (cta.action) {
        case 'whatsapp':
            return whatsappHref(ctx.contact, value);
        case 'phone':
            return `tel:${(value || ctx.contact.phone).replace(/[^\d+]/g, '')}`;
        case 'email':
            return `mailto:${value || ctx.contact.email}`;
        case 'anchor':
            return `#${value.replace(/^#/, '')}`;
        case 'url':
            return safeHref(value);
        default:
            return `#${ctx.formAnchor}`;
    }
}

/** Separa «Soporte · Infraestructura · …» en estaciones de la linea. */
export function splitStations(note: string): string[] {
    return note
        .split(/[·|•]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6);
}

// ---- Lectura segura del contenido (viene del servidor como JSON) -----------

export const text = (c: Record<string, Json>, key: string): string => (typeof c[key] === 'string' ? (c[key] as string) : '');

export const flag = (c: Record<string, Json>, key: string): boolean => c[key] === true;

export function list<T extends Record<string, Json>>(c: Record<string, Json>, key: string): T[] {
    return Array.isArray(c[key]) ? (c[key] as unknown as T[]) : [];
}

export function ctaOf(c: Record<string, Json>, key: string): Cta | null {
    const v = c[key];
    if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
    const cta = v as unknown as Cta;
    return cta.label ? cta : null;
}

export function paragraphs(body: string): string[] {
    return body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}
