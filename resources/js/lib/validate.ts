/**
 * Limpieza y validación de los datos de contacto. Son las mismas reglas que usa el servidor
 * (app/Support/LeadRules.php): el navegador evita que se escriba lo que no corresponde y avisa antes de enviar;
 * el servidor vuelve a revisar todo.
 */

const HAS_LETTER = /\p{L}/u;

// ---- Nombre: solo letras, espacios y . ' - ------------------------------------------------------------------

export function cleanName(value: string): string {
    return value
        .replace(/[^\p{L}\p{M}\s.'’-]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+/, '')
        .slice(0, 120);
}

export function isValidName(value: string): boolean {
    const v = value.trim();
    return v.length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(v);
}

// ---- Empresa: un RUC (11 dígitos) o el nombre de la empresa ---------------------------------------------------

/** Sin letras se escribe un RUC: solo dígitos (máximo 11). Con letras es un nombre: letras, números y signos comunes. */
export function cleanCompany(value: string): string {
    if (!HAS_LETTER.test(value)) {
        let digits = 0;
        return [...value.replace(/[^\d\s-]/g, '')]
            .filter((ch) => (/\d/.test(ch) ? ++digits <= 11 : true))
            .join('')
            .replace(/^\s+/, '')
            .slice(0, 20);
    }
    return value
        .replace(/[^\p{L}\p{M}\p{N}\s.,&'’\-/()]/gu, '')
        .replace(/^\s+/, '')
        .slice(0, 150);
}

/** RUC peruano: 11 dígitos que empiezan con 10, 15, 16, 17 o 20 y cumplen el dígito verificador (módulo 11). */
export function isValidRuc(value: string): boolean {
    const d = value.replace(/[\s-]+/g, '');
    if (!/^(10|15|16|17|20)\d{9}$/.test(d)) return false;
    const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    return (11 - (sum % 11)) % 10 === Number(d[10]);
}

export function isValidCompany(value: string): boolean {
    const v = value.trim();
    if (!v || v.length > 150) return false;
    if (!HAS_LETTER.test(v)) return isValidRuc(v);
    return /^[\p{L}\p{M}\p{N}\s.,&'’\-/()]+$/u.test(v);
}

// ---- Celular / WhatsApp ----------------------------------------------------------------------------------------

/**
 * Solo números, «+» al inicio, espacios y guiones. Corta el largo: 9 dígitos (celular peruano), 11 si empieza con 51,
 * y hasta 15 si lleva «+» (otro país).
 */
export function cleanPhone(value: string): string {
    const kept = value.replace(/[^\d+\-()\s]/g, '').replace(/(?!^)\+/g, '');
    const digits = kept.replace(/\D/g, '');
    const cap = kept.trimStart().startsWith('+') ? 15 : digits.startsWith('0051') ? 13 : digits.startsWith('51') ? 11 : 9;
    let count = 0;
    return [...kept]
        .filter((ch) => (/\d/.test(ch) ? ++count <= cap : true))
        .join('')
        .replace(/^\s+/, '')
        .slice(0, 24);
}

/** Celular peruano de 9 dígitos que empieza con 9 (con o sin +51), o un número de otro país con «+». */
export function isValidPhone(value: string): boolean {
    const compact = value.trim().replace(/[\s\-()]+/g, '');
    return /^(?:\+?51|0051)?9\d{8}$/.test(compact) || /^\+(?!51)\d{8,15}$/.test(compact);
}
