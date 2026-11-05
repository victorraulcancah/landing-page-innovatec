/**
 * Google Analytics 4 (gtag). Solo se carga si el panel tiene un ID de medición (G-XXXXXXXXXX) y el visitante no pidió
 * privacidad. Sin ID, todo esto no hace nada: `track` es una función vacía.
 */

type Gtag = (...args: unknown[]) => void;

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: Gtag;
    }
}

const ID = /^G-[A-Z0-9]{4,14}$/;

let started = false;

/** El navegador avisa «no me sigas» (Do Not Track o Global Privacy Control): se respeta y no se mide. */
function prefersPrivacy(): boolean {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}

export function startAnalytics(id: string): boolean {
    if (started) return true;
    if (typeof window === 'undefined' || !ID.test(id) || prefersPrivacy()) return false;

    window.dataLayer = window.dataLayer ?? [];
    // gtag espera el objeto `arguments`, no una lista: por eso es una función normal.
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    started = true;
    return true;
}

/** Envía un evento a Analytics; no hace nada si la medición no está activa. */
export function track(name: string, params: Record<string, string | number | boolean> = {}): void {
    if (started) window.gtag?.('event', name, params);
}

/** Qué clic cuenta como acción de contacto, según a dónde lleva el enlace. */
export function eventForLink(href: string): string | null {
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) return 'click_whatsapp';
    if (/^tel:/i.test(href)) return 'click_phone';
    if (/^mailto:/i.test(href)) return 'click_email';
    if (/^https?:\/\/(www\.google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.)/i.test(href)) return 'click_maps';
    return null;
}
