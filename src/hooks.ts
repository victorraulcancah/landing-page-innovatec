import { useEffect, useRef, useState, type RefObject } from 'react';

/** True cuando la persona pidió menos movimiento en su sistema. */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

/** Marca un elemento como "visto" la primera vez que entra en pantalla. */
export function useInView<T extends HTMLElement>(threshold = 0.2): [RefObject<T | null>, boolean] {
    const ref = useRef<T>(null);
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el || seen) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSeen(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [seen, threshold]);

    return [ref, seen];
}

/** Cuenta de 0 a `target` cuando `active` pasa a true. Sin animación muestra el valor final. */
export function useCountUp(target: number, active: boolean, duration = 1600): number {
    const reduced = useReducedMotion();
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) {
            return;
        }

        if (reduced) {
            setValue(target);

            return;
        }

        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);

            setValue(Math.round(target * eased));

            if (t < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [active, target, duration, reduced]);

    return value;
}

/** Progreso de lectura de la página (0 a 1) escrito directo en un elemento, sin re-renderizar. */
export function useScrollProgress(barRef: RefObject<HTMLElement | null>): void {
    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${progress})`;
            }
        };

        const onScroll = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(frame);
        };
    }, [barRef]);
}
