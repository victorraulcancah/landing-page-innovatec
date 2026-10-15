import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { content } from '../content';
import { useReducedMotion } from '../hooks';

/** Telón de entrada: el logo aparece y el telón sube. Solo CSS; se oculta solo. */
export function Curtain() {
    const [gone, setGone] = useState(false);

    // Seguro: aunque el navegador frene las animaciones, el telón se retira solo.
    useEffect(() => {
        const id = window.setTimeout(() => setGone(true), 2600);

        return () => window.clearTimeout(id);
    }, []);

    if (gone) {
        return null;
    }

    return (
        <div className="curtain" aria-hidden="true">
            <img src={content.brand.logo} alt="" className="h-12 w-auto" />
        </div>
    );
}

/** Botón que se acerca suavemente al puntero (no en pantallas táctiles ni con menos movimiento). */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduced = useReducedMotion();

    const move = (e: PointerEvent<HTMLSpanElement>) => {
        if (reduced || e.pointerType !== 'mouse' || !ref.current) {
            return;
        }

        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (e.clientY - (rect.top + rect.height / 2)) * strength;

        ref.current.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };

    const leave = () => {
        if (ref.current) {
            ref.current.style.transform = '';
        }
    };

    return (
        <span
            ref={ref}
            onPointerMove={move}
            onPointerLeave={leave}
            className="inline-block transition-transform duration-300 ease-out-expo"
        >
            {children}
        </span>
    );
}

/** Inclina una tarjeta hacia el puntero. Úsalo en onPointerMove / onPointerLeave. */
export function tiltMove(e: PointerEvent<HTMLElement>): void {
    if (e.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    el.style.setProperty('--rx', `${((0.5 - py) * 7).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
}

export function tiltLeave(e: PointerEvent<HTMLElement>): void {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
}

const sections = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'partner', label: 'Aliado técnico' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'valores', label: 'Valores' },
    { id: 'cifras', label: 'En campo' },
    { id: 'experiencia', label: 'Experiencia' },
    { id: 'marcas', label: 'Marcas' },
];

/** Puntos de navegación a la derecha que marcan la sección actual, y un anillo de progreso para volver arriba. */
export function PageRail() {
    const [active, setActive] = useState('inicio');
    const [showTop, setShowTop] = useState(false);
    const ring = useRef<SVGCircleElement>(null);
    const circumference = 2 * Math.PI * 20;

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const mark = window.innerHeight * 0.45;
            let current = sections[0].id;

            for (const section of sections) {
                const el = document.getElementById(section.id);

                if (el && el.getBoundingClientRect().top <= mark) {
                    current = section.id;
                }
            }

            setActive((prev) => (prev === current ? prev : current));

            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;

            if (ring.current) {
                ring.current.style.strokeDashoffset = String(circumference * (1 - progress));
            }

            setShowTop(window.scrollY > 700);
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
    }, [circumference]);

    return (
        <>
            <nav aria-label="Secciones de la página" className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
                <ul className="flex flex-col items-end gap-3">
                    {sections.map((section) => {
                        const isActive = section.id === active;

                        return (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    aria-label={section.label}
                                    aria-current={isActive ? 'location' : undefined}
                                    className="group flex items-center gap-3"
                                >
                                    <span
                                        className={`text-xs transition-all duration-300 ease-out-expo ${
                                            isActive
                                                ? 'translate-x-0 text-white opacity-100'
                                                : 'translate-x-2 text-white/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        {section.label}
                                    </span>
                                    <span
                                        className={`block rounded-full transition-all duration-300 ease-out-expo ${
                                            isActive
                                                ? 'h-2.5 w-2.5 bg-signal shadow-[0_0_0_4px_rgba(6,194,240,0.2)]'
                                                : 'h-1.5 w-1.5 bg-white/35 group-hover:bg-white'
                                        }`}
                                    />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <a
                href="#inicio"
                aria-label="Volver arriba"
                className={`fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full bg-night/85 text-white backdrop-blur transition-all duration-500 ease-out-expo hover:text-signal ${
                    showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                }`}
            >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="absolute inset-0 -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                    <circle
                        ref={ring}
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#06c2f0"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                    />
                </svg>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </a>
        </>
    );
}

/** Hexágonos de contorno que giran y flotan muy despacio (decoración, sin significado). */
export function Hexes({ className = '' }: { className?: string }) {
    return (
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="hex-spin absolute -right-16 top-10 size-72 text-signal/20"
            >
                <path d="M50 4l40 23v46L50 96 10 73V27z" />
                <path d="M50 20l26 15v30L50 80 24 65V35z" />
            </svg>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                className="hex-spin absolute -left-10 bottom-4 size-48 text-white/10 [animation-duration:120s,14s]"
            >
                <path d="M50 4l40 23v46L50 96 10 73V27z" />
            </svg>
        </div>
    );
}
