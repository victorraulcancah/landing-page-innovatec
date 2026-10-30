import { AlertTriangle, Check, ClipboardCheck, Cloud, Database, Laptop, Printer, Server, ShieldCheck } from 'lucide-react';
import { type CSSProperties, type ReactNode } from 'react';

/**
 * Ilustraciones del servicio. Son piezas de interfaz dibujadas con los colores del tema (no fotos):
 * muestran lo que el cliente recibe y siguen la paleta si esta cambia. Decorativas: no las lee el lector de pantalla.
 */

export type VisualKind = 'chat' | 'network' | 'backup' | 'inventory' | 'report';

/** Orden automático de las ilustraciones cuando un panel no elige una. */
export const AUTO_VISUALS: VisualKind[] = ['chat', 'network', 'backup', 'inventory'];

const at = (i: number) => ({ '--i': i }) as CSSProperties;

function Window({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
    return (
        <div className={`lp-vis__win ${className}`}>
            <div className="lp-vis__bar">
                <span className="lp-vis__dots" aria-hidden>
                    <i />
                    <i />
                    <i />
                </span>
                <strong>{title}</strong>
            </div>
            {children}
        </div>
    );
}

// ---- Soporte: conversación con ticket -----------------------------------------------------------

function Chat() {
    return (
        <Window title="Soporte por WhatsApp">
            <div className="lp-vis__chat">
                <p className="lp-bubble lp-bubble--in" style={at(0)}>
                    Se cayó el internet en contabilidad.
                </p>
                <p className="lp-bubble lp-bubble--out" style={at(1)}>
                    Recibido. Iniciamos la asistencia remota ahora.
                </p>
                <p className="lp-bubble lp-bubble--out" style={at(2)}>
                    Revisamos la conexión y coordinamos con tu proveedor.
                </p>
                <div className="lp-vis__ticket" style={at(3)}>
                    <span className="lp-vis__ring" aria-hidden />
                    <span>
                        <strong>Ticket abierto</strong>
                        <small>Seguimiento hasta que vuelvan a trabajar</small>
                    </span>
                    <Check size={18} strokeWidth={3} aria-hidden />
                </div>
            </div>
        </Window>
    );
}

// ---- Infraestructura: sedes conectadas por la línea ---------------------------------------------------

const NODES = [
    { x: 64, y: 62, label: 'Sede' },
    { x: 356, y: 62, label: 'Almacén' },
    { x: 64, y: 238, label: 'Nube' },
    { x: 356, y: 238, label: 'ERP' },
];

function Network() {
    return (
        <div className="lp-vis__net">
            <svg viewBox="0 0 420 300" role="presentation" focusable="false">
                {NODES.map((n, i) => {
                    const d = `M210 150 L${n.x} ${n.y}`;
                    return (
                        <g key={n.label}>
                            <path className="lp-net__line" d={d} />
                            <path className="lp-net__signal" d={d} pathLength={1} style={at(i)} />
                        </g>
                    );
                })}
                {NODES.map((n, i) => (
                    <g key={n.label} className="lp-net__node" style={at(i)} transform={`translate(${n.x} ${n.y})`}>
                        <circle r="15" />
                        <g transform={n.y < 150 ? 'translate(0 -34)' : 'translate(0 34)'}>
                            <rect x="-40" y="-13" width="80" height="26" rx="8" />
                            <text textAnchor="middle" y="5">
                                {n.label}
                            </text>
                        </g>
                    </g>
                ))}
                <g className="lp-net__hub" transform="translate(210 150)">
                    <circle r="30" />
                    <circle r="11" className="lp-net__core" />
                </g>
            </svg>
            <p className="lp-vis__cap">
                <Server size={16} aria-hidden /> Tu oficina, tus sedes y tus proveedores en una sola línea
            </p>
        </div>
    );
}

// ---- Información a salvo: backups de la semana y prueba de restauración -------------------------------------

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Backup() {
    return (
        <Window title="Backups monitoreados">
            <div className="lp-vis__backup">
                <ol className="lp-vis__week" aria-hidden>
                    {DAYS.map((d, i) => (
                        <li key={d + i} style={at(i)}>
                            <span className="lp-vis__stop">
                                <Check size={14} strokeWidth={3.5} />
                            </span>
                            <small>{d}</small>
                        </li>
                    ))}
                </ol>
                <div className="lp-vis__row lp-vis__row--ok" style={at(7)}>
                    <Database size={18} aria-hidden />
                    <span>
                        <strong>Prueba de restauración</strong>
                        <small>En un ambiente aislado</small>
                    </span>
                    <em>Aprobada</em>
                </div>
            </div>
        </Window>
    );
}

// ---- Control para crecer: inventario con alertas ------------------------------------------------------------------

const ROWS: { icon: ReactNode; name: string; state: string; warn?: boolean }[] = [
    { icon: <Laptop size={18} />, name: 'Laptop · Contabilidad', state: 'Licencia activa' },
    { icon: <Server size={18} />, name: 'Servidor de archivos', state: 'Respaldo al día' },
    { icon: <ShieldCheck size={18} />, name: 'Firewall · Sede 2', state: 'Vence pronto', warn: true },
    { icon: <Printer size={18} />, name: 'Impresora · Recepción', state: 'Activa' },
];

function Inventory() {
    return (
        <Window title="Inventario vivo">
            <ul className="lp-vis__list" aria-hidden>
                {ROWS.map((r, i) => (
                    <li key={r.name} className={r.warn ? 'is-warn' : ''} style={at(i)}>
                        {r.icon}
                        <strong>{r.name}</strong>
                        <em>
                            {r.warn && <AlertTriangle size={13} strokeWidth={3} />}
                            {r.state}
                        </em>
                    </li>
                ))}
            </ul>
        </Window>
    );
}

// ---- Informe mensual para la gerencia ----------------------------------------------------------------------------------

const REPORT = ['Soporte y visitas', 'Backups verificados', 'Equipos y licencias', 'Estado de tus sistemas'];

function Report() {
    return (
        <Window title="Informe mensual · Gerencia">
            <ul className="lp-vis__list lp-vis__list--report" aria-hidden>
                {REPORT.map((r, i) => (
                    <li key={r} style={at(i)}>
                        <ClipboardCheck size={18} />
                        <strong>{r}</strong>
                        <em>Revisado</em>
                    </li>
                ))}
            </ul>
            <p className="lp-vis__note">
                <Cloud size={15} aria-hidden /> En lenguaje de negocio, no de técnicos
            </p>
        </Window>
    );
}

const KINDS: Record<VisualKind, () => ReactNode> = {
    chat: Chat,
    network: Network,
    backup: Backup,
    inventory: Inventory,
    report: Report,
};

/** Una ilustración lista para insertar; entra en pantalla con la animación de su tipo. */
export function Visual({ kind, className = '', style, scrub, shown }: { kind: VisualKind; className?: string; style?: CSSProperties; scrub?: boolean; shown?: boolean }) {
    const Piece = KINDS[kind];
    if (!Piece) return null;

    return (
        <div className={`lp-vis lp-vis--${kind} ${shown ? 'is-in' : ''} ${className}`.trim()} style={style} data-reveal="vis" data-scrub={scrub ? '' : undefined} aria-hidden>
            <Piece />
        </div>
    );
}

// ---- Franja de servicios ---------------------------------------------------------------------------------------------------

const SPEED: Record<string, number> = { slow: 9, normal: 6, fast: 3.5 };

/** Banda que desliza los servicios, separados por estaciones. La copia es solo para cerrar el bucle. */
export function Ticker({ items, speed }: { items: string[]; speed: string }) {
    if (items.length === 0) return null;
    // Se repiten las palabras hasta llenar el ancho de una pantalla grande.
    const unit = Array.from({ length: Math.max(2, Math.ceil(10 / items.length)) }, () => items).flat();
    const duration = `${Math.max(14, unit.length * (SPEED[speed] ?? SPEED.normal))}s`;
    const track = (hidden: boolean) => (
        <ul className="lp-ticker__track" aria-hidden={hidden || undefined}>
            {unit.map((label, i) => (
                <li key={i}>
                    <span className="lp-ticker__stop" aria-hidden />
                    {label}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="lp-ticker" style={{ '--dur': duration } as CSSProperties}>
            <div className="lp-ticker__lane">
                {track(false)}
                {track(true)}
            </div>
        </div>
    );
}
