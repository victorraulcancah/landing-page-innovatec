import { CARD, LibroHeader, Notice, plainDate, dateTime } from '@/components/libro/ui';
import LibroLayout, { type Shell } from '@/layouts/libro-layout';
import { Link } from '@inertiajs/react';
import { CircleCheck, FilePlus, Mail, Paperclip, Printer, Search } from 'lucide-react';

interface Claim {
    code: string;
    type: string;
    name: string;
    doc_type: string;
    doc_number: string;
    address: string;
    phone: string;
    email: string;
    is_minor: boolean;
    guardian_name: string | null;
    guardian_doc_type: string | null;
    guardian_doc_number: string | null;
    good_type: string;
    voucher_type: string | null;
    voucher_number: string | null;
    purchase_date: string | null;
    contract_number: string | null;
    product_code: string | null;
    product_name: string | null;
    product_brand: string | null;
    product_model: string | null;
    amount: string | null;
    good_description: string;
    detail: string;
    solution: string | null;
    request: string;
    provider: { name?: string; ruc?: string; address?: string } | null;
    created_at: string;
    due_date: string;
    attachments: { type: string; name: string; size: number }[];
}

interface Props extends Shell {
    claim: Claim;
    options: { docTypes: Record<string, string>; voucherTypes: Record<string, string>; types: Record<string, string>; goodTypes: Record<string, string> };
    days: number;
}

const ATTACHMENT: Record<string, string> = { photo: 'Fotografía', voucher: 'Comprobante', video: 'Video' };

export default function LibroReceipt({ claim: c, options, days, ...shell }: Props) {
    const product = [c.product_name, c.product_brand, c.product_model].filter(Boolean).join(' · ');
    const voucher = [options.voucherTypes[c.voucher_type ?? ''], c.voucher_number, c.purchase_date && plainDate(c.purchase_date)].filter(Boolean).join(' · ');

    const rows: [string, string | null][] = [
        ['Consumidor', `${c.name} · ${c.doc_type} ${c.doc_number}`],
        ['Contacto', `${c.phone} · ${c.email}`],
        ['Dirección', c.address],
        [c.is_minor ? 'Apoderado' : '', c.is_minor ? `${c.guardian_name} · ${c.guardian_doc_type} ${c.guardian_doc_number}` : null],
        ['Tipo de bien', options.goodTypes[c.good_type]],
        ['Monto reclamado', c.amount !== null ? `S/ ${Number(c.amount).toFixed(2)}` : null],
        ['Descripción', c.good_description],
        ['Producto', product ? `${product}${c.product_code ? ` (código ${c.product_code})` : ''}` : null],
        ['Comprobante', voucher || null],
        ['N° de contrato', c.contract_number],
        ['Tipo de registro', options.types[c.type]],
        ['Detalle', c.detail],
        ['Solución esperada', c.solution],
        ['Pedido', c.request],
    ];

    return (
        <LibroLayout shell={shell} title={`Hoja N° ${c.code}`}>
            <LibroHeader subtitle="Constancia de tu hoja de reclamación." />

            <section className={`${CARD} grid place-items-center gap-3 px-6 py-8 text-center print:shadow-none print:ring-0`} role="status">
                <span className="grid size-14 place-items-center rounded-full bg-[#059669] text-white print:hidden">
                    <CircleCheck className="size-8" aria-hidden />
                </span>
                <h2 className="font-[family-name:var(--font-head)] text-2xl font-extrabold">¡Registramos tu hoja de reclamación!</h2>
                <p className="rounded-xl bg-[var(--c-surface)] px-6 py-3 text-sm">
                    Tu número de hoja es <strong className="font-[family-name:var(--font-head)] text-2xl">{c.code}</strong>
                </p>
                <p className="flex max-w-xl items-start gap-2 text-sm text-[var(--c-muted)] print:hidden">
                    <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                    Te enviamos una copia a {c.email}. Guarda tu número de hoja y tu documento para consultar el estado.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3 print:hidden">
                    <button type="button" onClick={() => window.print()} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-primary)] px-5 py-3 text-sm font-bold text-[var(--c-on-primary)] transition hover:brightness-110">
                        <Printer size={18} aria-hidden /> Imprimir o guardar como PDF
                    </button>
                    <Link href={route('claims.lookup')} className="inline-flex items-center gap-2 rounded-[var(--r-btn)] border border-[color-mix(in_srgb,var(--c-text)_22%,transparent)] px-5 py-3 text-sm font-bold transition hover:bg-[var(--c-surface)]">
                        <Search size={18} aria-hidden /> Consultar mi reclamo
                    </Link>
                    <Link href={route('claims.create')} className="inline-flex items-center gap-2 rounded-[var(--r-btn)] border border-[color-mix(in_srgb,var(--c-text)_22%,transparent)] px-5 py-3 text-sm font-bold transition hover:bg-[var(--c-surface)]">
                        <FilePlus size={18} aria-hidden /> Registrar otro
                    </Link>
                </div>
            </section>

            <section className={`${CARD} print:shadow-none print:ring-1`} aria-label="Hoja de reclamación">
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] px-5 py-4 sm:px-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">Hoja de reclamación</p>
                        <h2 className="font-[family-name:var(--font-head)] text-xl font-extrabold">N° {c.code}</h2>
                    </div>
                    <p className="text-sm text-[var(--c-muted)]">{dateTime.format(new Date(c.created_at))}</p>
                </header>
                <div className="grid gap-5 p-5 sm:p-6">
                    {c.provider && (c.provider.name || c.provider.ruc || c.provider.address) && (
                        <p className="rounded-xl bg-[var(--c-surface)] px-4 py-3 text-sm">
                            <strong>Proveedor:</strong> {[c.provider.name, c.provider.ruc && `RUC ${c.provider.ruc}`, c.provider.address].filter(Boolean).join(' · ')}
                        </p>
                    )}
                    <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[12rem_1fr]">
                        {rows
                            .filter(([label, value]) => label && value)
                            .map(([label, value]) => (
                                <div key={label} className="contents">
                                    <dt className="text-[var(--c-muted)]">{label}</dt>
                                    <dd className="whitespace-pre-line font-medium">{value}</dd>
                                </div>
                            ))}
                        <div className="contents">
                            <dt className="text-[var(--c-muted)]">Fecha límite de respuesta</dt>
                            <dd className="font-medium">
                                {plainDate(c.due_date)} <span className="font-normal text-[var(--c-muted)]">({days} días hábiles)</span>
                            </dd>
                        </div>
                    </dl>
                    {c.attachments.length > 0 && (
                        <div>
                            <p className="mb-2 text-sm font-bold">Archivos adjuntos</p>
                            <ul className="grid gap-1.5 text-sm">
                                {c.attachments.map((a, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Paperclip className="size-4 shrink-0 text-[var(--c-muted)]" aria-hidden />
                                        <span className="font-medium">{ATTACHMENT[a.type] ?? 'Archivo'}:</span>
                                        <span className="min-w-0 truncate text-[var(--c-muted)]">{a.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Notice>La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.</Notice>
                </div>
            </section>
        </LibroLayout>
    );
}
