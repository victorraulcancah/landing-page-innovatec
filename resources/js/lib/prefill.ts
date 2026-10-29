const KEY = 'lp-prefill';

/** Guarda un mensaje para el formulario de contacto (p. ej. el resultado de la calculadora). */
export function setPrefill(message: string) {
    try {
        sessionStorage.setItem(KEY, message);
    } catch {
        /* sin almacenamiento: el evento basta mientras la página siga abierta */
    }
    window.dispatchEvent(new CustomEvent('lp:prefill', { detail: message }));
}

export function getPrefill(): string {
    try {
        return sessionStorage.getItem(KEY) ?? '';
    } catch {
        return '';
    }
}

export function clearPrefill() {
    try {
        sessionStorage.removeItem(KEY);
    } catch {
        /* nada que limpiar */
    }
}
