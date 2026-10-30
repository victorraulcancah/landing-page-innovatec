import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

const SITIO = 'https://magustechnologies.com/';

/**
 * La firma de quien desarrolló el sistema. El logo de Magus es celeste neón: sobre blanco casi no se ve, así que
 * va siempre sobre su propio fondo oscuro, donde brilla. Lleva al sitio de Magus Technologies.
 *
 *   variante «bloque» — la firma grande, para el login: logo, nombre y sitio
 *   variante «chip»   — la firma compacta, para el pie de la landing
 */
export default function CreditoMagus({ variante = 'bloque', className }: { variante?: 'bloque' | 'chip'; className?: string }) {
    const comun =
        'group relative flex items-center bg-[#0a1424] ring-1 ring-[#00e5ff]/40 outline-none transition duration-200 ' +
        'hover:shadow-[0_10px_32px_-10px_rgba(0,229,255,0.5)] hover:ring-[#00e5ff]/60 focus-visible:ring-2 focus-visible:ring-[#00e5ff]';

    if (variante === 'chip') {
        return (
            <a
                href={SITIO}
                target="_blank"
                rel="noopener noreferrer"
                title="Desarrollado por Magus Technologies"
                aria-label="Desarrollado por Magus Technologies (abre magustechnologies.com)"
                className={cn(comun, 'gap-3 rounded-xl px-4 py-2.5', className)}
            >
                <img src="/brand/mgs.png" alt="" className="h-7 w-auto shrink-0" />
                <span className="min-w-0 border-l border-white/10 pl-3 text-[11px] leading-tight text-[#9fb4c7]">
                    Desarrollado por
                    <span className="flex items-center gap-1 text-sm font-semibold text-white">
                        Magus Technologies
                        <ArrowUpRight className="size-3.5 text-[#7fefff] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                </span>
            </a>
        );
    }

    return (
        <a
            href={SITIO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Desarrollado por Magus Technologies (abre magustechnologies.com)"
            className={cn(comun, 'gap-4 rounded-2xl px-5 py-4', className)}
        >
            <img src="/brand/mgs.png" alt="" className="h-10 w-auto shrink-0" />
            <span className="min-w-0 flex-1 border-l border-white/10 pl-4">
                <span className="block text-sm leading-snug font-semibold text-white">Desarrollado por Magus Technologies</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-[#7fefff]">
                    magustechnologies.com
                    <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
            </span>
        </a>
    );
}
