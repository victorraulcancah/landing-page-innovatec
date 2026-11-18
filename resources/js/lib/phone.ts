/** Deja pasar solo lo que puede llevar un teléfono: números, «+» al inicio, espacios, guiones y paréntesis. */
export function cleanPhone(value: string): string {
    const kept = value.replace(/[^\d+\-()\s]/g, '').replace(/(?!^)\+/g, '');
    return kept.slice(0, 20);
}

/** Un teléfono válido tiene entre 7 y 15 dígitos y ningún otro carácter fuera de «+ - ( )» y espacios. */
export function isValidPhone(value: string): boolean {
    const digits = value.replace(/\D/g, '').length;
    return digits >= 7 && digits <= 15 && /^\+?[\d\s\-()]+$/.test(value.trim());
}
