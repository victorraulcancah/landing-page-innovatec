import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useInView } from '../hooks';

/** Envuelve una zona: añade la clase `is-in` cuando entra en pantalla para disparar sus animaciones. */
export function InView({
    children,
    className = '',
    as: Tag = 'div',
    threshold = 0.2,
    style,
}: {
    children: ReactNode;
    className?: string;
    as?: ElementType;
    threshold?: number;
    style?: CSSProperties;
}) {
    const [ref, seen] = useInView<HTMLElement>(threshold);

    return (
        <Tag ref={ref} className={`${className} ${seen ? 'is-in' : ''}`} style={style}>
            {children}
        </Tag>
    );
}

/** Texto cuyas palabras suben desde una máscara, una tras otra. Úsalo dentro de un `.is-in`. */
export function SplitText({ text, base = 0 }: { text: string; base?: number }) {
    return (
        <>
            {text.split(' ').map((word, i) => (
                <span key={`${word}-${i}`} className="split-word" style={{ ['--i' as string]: i, ['--base' as string]: `${base}ms` }}>
                    <span>{word}</span>
                    {i < text.split(' ').length - 1 ? ' ' : ''}
                </span>
            ))}
        </>
    );
}

/** Marca como visible (`is-in`) tras el primer pintado: para la portada, que ya está en pantalla. */
export function useOnLoad(): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));

        return () => cancelAnimationFrame(id);
    }, []);

    return ready;
}

/** Hace que una tarjeta reciba la posición del puntero para su luz de fondo. */
export function trackPointer(e: React.PointerEvent<HTMLElement>): void {
    const rect = e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}
