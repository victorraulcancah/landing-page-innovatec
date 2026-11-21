import { whatsappHref } from '@/lib/landing';
import { type ContactData } from '@/types/cms';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const KEY = 'lp-chat-opened';

/** Logotipo de WhatsApp (lucide no trae marcas). */
function WhatsappIcon({ size = 28 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    );
}

/**
 * Chat por WhatsApp: botón verde flotante y, pasados unos segundos, un globo de conversación con el mensaje y el
 * botón para chatear. Reemplaza a la ventana emergente. Todo se edita en Ajustes del sitio → Contacto.
 */
export function WhatsappChat({ contact }: { contact: ContactData }) {
    const enabled = contact.chat_enabled !== false && (contact.whatsapp ?? '').replace(/\D/g, '') !== '';
    const delay = contact.chat_delay ?? 8;
    const [open, setOpen] = useState(false);
    const [time] = useState(() => new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date()));

    // El globo se abre solo una vez por visita; si se cierra, queda el botón.
    useEffect(() => {
        if (!enabled || delay <= 0) return;
        try {
            if (sessionStorage.getItem(KEY) === '1') return;
        } catch {
            /* sin almacenamiento */
        }
        const timer = setTimeout(() => {
            setOpen(true);
            try {
                sessionStorage.setItem(KEY, '1');
            } catch {
                /* sin almacenamiento */
            }
        }, delay * 1000);
        return () => clearTimeout(timer);
    }, [enabled, delay]);

    if (!enabled) return null;

    const left = contact.chat_position === 'left';
    const label = contact.chat_button || 'Chatear por WhatsApp';

    return (
        <div className={`fixed bottom-4 z-40 flex flex-col gap-3 sm:bottom-5 print:hidden ${left ? 'left-4 items-start sm:left-5' : 'right-4 items-end sm:right-5'}`}>
            {open && (
                <section aria-label={contact.chat_title || 'Chat de WhatsApp'} className="w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white text-[#111b21] shadow-2xl ring-1 ring-black/10 duration-300 motion-safe:animate-in motion-safe:slide-in-from-bottom-3">
                    <header className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
                            <WhatsappIcon size={24} />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold leading-tight">{contact.chat_title || 'UCO360 · Soporte'}</p>
                            <p className="flex items-center gap-1.5 text-xs text-white/80">
                                <span className="size-2 rounded-full bg-[#25d366]" aria-hidden />
                                En línea
                            </p>
                        </div>
                        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar el chat" className="grid size-8 cursor-pointer place-items-center rounded-full transition hover:bg-white/15">
                            <X size={18} aria-hidden />
                        </button>
                    </header>
                    <div className="bg-[#efeae2] px-4 py-5">
                        <p className="relative max-w-[92%] rounded-xl rounded-tl-none bg-white px-3.5 py-2.5 text-[15px] leading-snug shadow-sm">
                            {contact.chat_message}
                            <span className="mt-1 block text-right text-[11px] text-[#667781]">{time}</span>
                        </p>
                    </div>
                    <div className="bg-white p-3">
                        <a
                            href={whatsappHref(contact)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-5 py-3 text-[15px] font-bold text-white transition hover:brightness-95"
                        >
                            <WhatsappIcon size={22} />
                            {label}
                        </a>
                    </div>
                </section>
            )}

            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={label}
                aria-expanded={open}
                className="relative grid size-14 cursor-pointer place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition duration-200 hover:scale-105 sm:size-16"
            >
                {!open && <span aria-hidden className="absolute inset-0 rounded-full bg-[#25d366] opacity-40 motion-safe:animate-ping" />}
                <span className="relative">{open ? <X size={28} aria-hidden /> : <WhatsappIcon size={32} />}</span>
            </button>
        </div>
    );
}
