import { toRichHtml } from '@/lib/rich';
import DOMPurify from 'dompurify';
import { type CSSProperties, type ElementType, useMemo } from 'react';

const COLOR_CLASS = /^[tm]-(primary|accent|dark|muted|light|surface)$/;
const ALIGN = /^text-align:\s*(left|center|right|justify);?$/;

let ready = false;

/** El servidor ya limpia al guardar; esto es una segunda barrera al pintar. */
function prepare() {
    if (ready) return;
    ready = true;

    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (!(node instanceof Element)) return;

        const classes = (node.getAttribute('class') ?? '').split(/\s+/).filter((c) => COLOR_CLASS.test(c));
        if (classes.length > 0) node.setAttribute('class', classes.join(' '));
        else node.removeAttribute('class');

        const align = (node.getAttribute('style') ?? '').split(';').map((s) => s.trim()).find((s) => ALIGN.test(s));
        if (align) node.setAttribute('style', align);
        else node.removeAttribute('style');

        if (node.tagName === 'A') {
            if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
            else node.removeAttribute('target');
        }
    });
}

function sanitize(html: string, inline: boolean): string {
    if (typeof window === 'undefined') return '';
    prepare();

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: inline ? ['strong', 'em', 'u', 's', 'br', 'span'] : ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'span', 'a'],
        ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
        ADD_URI_SAFE_ATTR: ['target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });
}

interface RichProps {
    html: string;
    /** true = una sola línea (titulares): se pinta dentro de un h1/h2 sin párrafos. */
    inline?: boolean;
    as?: ElementType;
    className?: string;
    id?: string;
    style?: CSSProperties;
    reveal?: string;
}

/** Texto escrito con el editor del panel, listo para la landing. */
const TITLE_ALIGN = /^\s*<p[^>]*style="[^"]*text-align:\s*(left|center|right|justify)[^"]*"[^>]*>([\s\S]*)<\/p>\s*$/i;

export function Rich({ html, inline = false, as: Tag = 'div', className = '', id, style, reveal }: RichProps) {
    // Un titular con alineación llega envuelto en <p style="text-align:…">: se aplica al propio h1/h2.
    const titled = inline ? TITLE_ALIGN.exec(html) : null;
    const align = titled?.[1].toLowerCase() as CSSProperties['textAlign'] | undefined;
    const source = titled ? titled[2] : html;
    const safe = useMemo(() => sanitize(toRichHtml(source, inline), inline), [source, inline]);
    if (!safe) return null;

    return <Tag id={id} style={align ? { ...style, textAlign: align } : style} data-reveal={reveal} className={`lp-rich ${className}`.trim()} dangerouslySetInnerHTML={{ __html: safe }} />;
}
