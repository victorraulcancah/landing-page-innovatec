/** Colores del tema que el editor ofrece: la clave se guarda como clase (`t-accent`, `m-primary`) y sigue a la paleta. */
export interface RichColor {
    key: string;
    label: string;
    /** Nombre del color dentro del tema, para mostrar la muestra. */
    token: string;
}

export const TONES: RichColor[] = [
    { key: 'primary', label: 'Primario', token: 'primary' },
    { key: 'accent', label: 'Acento', token: 'accent' },
    { key: 'dark', label: 'Oscuro', token: 'dark' },
    { key: 'muted', label: 'Apagado', token: 'muted' },
    { key: 'light', label: 'Claro', token: 'on_dark' },
];

export const MARKS: RichColor[] = [
    { key: 'primary', label: 'Primario', token: 'primary' },
    { key: 'accent', label: 'Acento', token: 'accent' },
    { key: 'surface', label: 'Superficie', token: 'surface' },
    { key: 'dark', label: 'Oscuro', token: 'dark' },
];

const BLOCK_START = /^\s*<(p|ul|ol)[\s>]/i;

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Lleva cualquier valor guardado a HTML. Lo escrito antes del editor era texto plano con líneas en blanco
 * entre párrafos; eso se convierte en párrafos. Un titular (en línea) ya es HTML o texto simple.
 */
export function toRichHtml(value: string | null | undefined, inline = false): string {
    const v = value ?? '';
    if (inline || v.trim() === '' || BLOCK_START.test(v)) return v;

    return v
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
}
