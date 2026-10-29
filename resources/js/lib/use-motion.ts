import { type RefObject, useLayoutEffect } from 'react';

export type MotionLevel = 'full' | 'subtle' | 'none';

/**
 * Movimiento de la landing.
 * - Marca el contenedor con `lp--js` antes de pintar: sin JS (o con «Ninguna») todo queda visible.
 * - Observa los elementos [data-reveal] y les pone `is-in` cuando entran en pantalla (una sola vez).
 * - Publica el avance de lectura (--progress) y si hay scroll (data-scrolled) para la barra superior.
 * - Con «reducir movimiento» del sistema pasa a «Suaves» sin desplazamientos: solo aparecen.
 */
export function useMotion(ref: RefObject<HTMLElement | null>, level: MotionLevel, dependency: string) {
    useLayoutEffect(() => {
        const root = ref.current;
        if (!root) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (level === 'none') {
            root.classList.remove('lp--js', 'lp--reduced');
            return;
        }

        root.classList.add('lp--js');
        root.classList.toggle('lp--reduced', reduce);
        if (reduce) root.setAttribute('data-motion', 'subtle');

        const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
        let observer: IntersectionObserver | null = null;

        if (typeof IntersectionObserver === 'undefined') {
            targets.forEach((el) => el.classList.add('is-in'));
        } else {
            observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-in');
                            observer?.unobserve(entry.target);
                        }
                    }
                },
                { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
            );
            targets.forEach((el) => observer?.observe(el));
        }

        let frame = 0;
        const onScroll = () => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                const max = document.documentElement.scrollHeight - window.innerHeight;
                root.style.setProperty('--progress', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
                root.toggleAttribute('data-scrolled', window.scrollY > 8);
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            observer?.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [ref, level, dependency]);
}
