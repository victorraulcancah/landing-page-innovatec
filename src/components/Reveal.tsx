import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Aparece suave al entrar en pantalla. El contenido es visible por defecto:
 * solo se oculta lo que aún está por debajo del pliegue.
 */
export function Reveal({
    children,
    className = '',
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (
            !el ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            el.getBoundingClientRect().top < window.innerHeight * 0.92
        ) {
            return;
        }

        setHidden(true);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHidden(false);
                    observer.disconnect();
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-[opacity,transform] duration-700 ease-out-expo ${
                hidden ? 'translate-y-5 opacity-0' : ''
            } ${className}`}
            style={{ transitionDelay: hidden ? '0ms' : `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export const shell = 'mx-auto w-full max-w-[1320px] px-6 lg:px-12';
