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

// ---- Empresa: el nombre de la empresa (letras, números y signos comunes) ------------------------------------

export function cleanCompany(value: string): string {
    return value
        .replace(/[^\p{L}\p{M}\p{N}\s.,&'’\-/()]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^\s+/, '')
        .slice(0, 150);
}

/** Un nombre de empresa lleva al menos una letra (no se acepta solo números). */
export function isValidCompany(value: string): boolean {
    const v = value.trim();
    return v.length >= 2 && v.length <= 150 && HAS_LETTER.test(v) && /^[\p{L}\p{M}\p{N}\s.,&'’\-/()]+$/u.test(v);
}

// ---- Documento de identidad ------------------------------------------------------------------------------------

/** DNI: 8 números. RUC: 11 números. Carné de extranjería y pasaporte: letras y números (máximo 12). */
export function cleanDoc(type: string, value: string): string {
    if (type === 'DNI') return value.replace(/\D/g, '').slice(0, 8);
    if (type === 'RUC') return value.replace(/\D/g, '').slice(0, 11);
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
}

// ---- Celular / WhatsApp: 9 números ---------------------------------------------------------------------------------

/** Solo números, máximo 9. */
export function cleanPhone(value: string): string {
    return value.replace(/\D/g, '').slice(0, 9);
}

/** Celular peruano: 9 números que empiezan con 9. */
export function isValidPhone(value: string): boolean {
    return /^9\d{8}$/.test(value.replace(/[\s-]+/g, ''));
}
