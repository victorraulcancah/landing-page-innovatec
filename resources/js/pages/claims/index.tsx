import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, FileText, ImageIcon, Mail, Paperclip, Phone, Search, TriangleAlert, Video } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';

interface Attachment {
    id: number;
    type: string;
    name: string;
    mime: string;
    size: number;
}

interface ClaimRow {
    id: number;
    code: string | null;
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
    status: string;
    response: string | null;
    due_date: string;
    overdue: boolean;
    created_at: string;
    answered_at: string | null;
    attachments: Attachment[];
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    claims: Paginated<ClaimRow>;
    statuses: Record<string, string>;
    types: Record<string, string>;
    goodTypes: Record<string, string>;
    voucherTypes: Record<string, string>;
    days: number;
    filter: string | null;
    search: string;
    counts: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reclamos', href: '/reclamos' }];
const dateTime = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const dateOnly = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
const size = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);
const ATTACHMENT_ICON = { photo: ImageIcon, voucher: FileText, video: Video } as const;
const ATTACHMENT_LABEL: Record<string, string> = { photo: 'Fotografía', voucher: 'Comprobante', video: 'Video' };

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium whitespace-pre-line">{children}</dd>
        </div>
    );
}

function Answer({ claim }: { claim: ClaimRow }) {
    const form = useForm({ response: claim.response ?? '' });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.put(route('claims.update', claim.id), { preserveScroll: true });
            }}
            className="grid gap-2"
        >
            <label htmlFor={`resp-${claim.id}`} className="text-sm font-medium">
                {claim.status === 'answered' ? 'Respuesta enviada (puedes corregirla y volver a enviarla)' : 'Respuesta para el consumidor'}
            </label>
            <Textarea id={`resp-${claim.id}`} rows={4} value={form.data.response} maxLength={3000} onChange={(e) => form.setData('response', e.target.value)} aria-invalid={form.errors.response ? true : undefined} />
            {form.errors.response && <p className="text-destructive text-sm">{form.errors.response}</p>}
            <div className="flex items-center gap-3">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {claim.status === 'answered' ? 'Enviar de nuevo' : 'Responder y marcar como atendido'}
                </Button>
                <span className="text-muted-foreground text-xs">Se envía al correo del consumidor.</span>
            </div>
        </form>
    );
}

export default function ClaimsIndex({ claims, statuses, types, goodTypes, voucherTypes, days, filter, search, counts }: Props) {
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0);
    const [q, setQ] = useState(search);

    const find = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('claims.index'), { ...(filter ? { status: filter } : {}), ...(q.trim() ? { q: q.trim() } : {}) }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reclamos" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <BookOpen className="size-6" />
                        Libro de Reclamaciones
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Hojas registradas desde la landing. El proveedor debe responder en un máximo de {days} días hábiles.</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant={!filter ? 'default' : 'outline'}>
                            <Link href={route('claims.index', search ? { q: search } : {})}>Todos ({total})</Link>
                        </Button>
                        {Object.entries(statuses).map(([key, label]) => (
                            <Button key={key} asChild size="sm" variant={filter === key ? 'default' : 'outline'}>
                                <Link href={route('claims.index', { status: key, ...(search ? { q: search } : {}) })}>
                                    {label} ({counts[key] ?? 0})
                                </Link>
                            </Button>
                        ))}
                    </nav>
                    <form onSubmit={find} className="flex gap-2" role="search">
                        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número, nombre o documento" aria-label="Buscar reclamos" className="w-72" />
                        <Button type="submit" size="sm" variant="outline">
                            <Search />
                            Buscar
                        </Button>
                    </form>
                </div>

                {claims.data.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                        {filter || search ? 'No hay hojas con esos filtros.' : 'Todavía no hay reclamos. Aparecerán aquí cuando alguien use el Libro de Reclamaciones de la landing.'}
                    </p>
                ) : (
                    <ul className="grid gap-3">
                        {claims.data.map((c) => {
                            const product = [c.product_name, c.product_brand, c.product_model].filter(Boolean).join(' · ');
                            const voucher = [voucherTypes[c.voucher_type ?? ''], c.voucher_number, c.purchase_date && dateOnly.format(new Date(`${c.purchase_date}T12:00:00`))].filter(Boolean).join(' · ');
                            return (
                                <li key={c.id} className="rounded-lg border">
                                    <details>
                                        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4">
                                            <span className="font-mono text-sm font-semibold">{c.code}</span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.type === 'queja' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{types[c.type] ?? c.type}</span>
                                            <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                                            {c.attachments.length > 0 && (
                                                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs" title="Archivos adjuntos">
                                                    <Paperclip className="size-3.5" />
                                                    {c.attachments.length}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground text-xs">{dateTime.format(new Date(c.created_at))}</span>
                                            {c.status === 'pending' && c.overdue ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                                                    <TriangleAlert className="size-3.5" />
                                                    Fuera de plazo
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${c.status === 'answered' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                    {c.status === 'answered' ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                                                    {statuses[c.status] ?? c.status}
                                                </span>
                                            )}
                                        </summary>
                                        <div className="grid gap-5 border-t p-4">
                                            <dl className="grid max-w-3xl gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[11rem_1fr]">
                                                <Row label="Consumidor">
                                                    {c.name} · {c.doc_type} {c.doc_number}
                                                </Row>
                                                <Row label="Contacto">
                                                    <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:underline">
                                                            <Mail className="size-3.5" />
                                                            {c.email}
                                                        </a>
                                                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                                                            <Phone className="size-3.5" />
                                                            {c.phone}
                                                        </a>
                                                    </span>
                                                </Row>
                                                <Row label="Dirección">{c.address}</Row>
                                                {c.is_minor && (
                                                    <Row label="Apoderado">
                                                        {c.guardian_name} · {c.guardian_doc_type} {c.guardian_doc_number}
                                                    </Row>
                                                )}
                                                <Row label="Bien contratado">
                                                    {goodTypes[c.good_type] ?? c.good_type}
                                                    {c.amount !== null && ` · Monto reclamado: S/ ${c.amount}`}
                                                </Row>
                                                <Row label="Descripción">{c.good_description}</Row>
                                                {product && <Row label="Producto">{`${product}${c.product_code ? ` (código ${c.product_code})` : ''}`}</Row>}
                                                {voucher && <Row label="Comprobante">{voucher}</Row>}
                                                {c.contract_number && <Row label="N° de contrato">{c.contract_number}</Row>}
                                                <Row label="Detalle">{c.detail}</Row>
                                                {c.solution && <Row label="Solución esperada">{c.solution}</Row>}
                                                <Row label="Pedido">{c.request}</Row>
                                                {c.provider?.name && <Row label="Proveedor">{[c.provider.name, c.provider.ruc && `RUC ${c.provider.ruc}`, c.provider.address].filter(Boolean).join(' · ')}</Row>}
                                                <Row label="Fecha límite">{dateOnly.format(new Date(`${c.due_date}T12:00:00`))}</Row>
                                                {c.answered_at && <Row label="Atendido el">{dateTime.format(new Date(c.answered_at))}</Row>}
                                            </dl>

                                            {c.attachments.length > 0 && (
                                                <div>
                                                    <p className="mb-2 text-sm font-medium">Archivos adjuntos</p>
                                                    <ul className="flex flex-wrap gap-2">
                                                        {c.attachments.map((a) => {
                                                            const Icon = ATTACHMENT_ICON[a.type as keyof typeof ATTACHMENT_ICON] ?? Paperclip;
                                                            return (
                                                                <li key={a.id}>
                                                                    <a href={route('claims.attachment', a.id)} target="_blank" rel="noreferrer" className="hover:bg-accent inline-flex max-w-xs items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                                                                        <Icon className="size-4 shrink-0" />
                                                                        <span className="min-w-0 truncate">
                                                                            {ATTACHMENT_LABEL[a.type] ?? 'Archivo'}: {a.name}
                                                                        </span>
                                                                        <span className="text-muted-foreground shrink-0 text-xs">{size(a.size)}</span>
                                                                    </a>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}

                                            <Answer claim={c} />
                                        </div>
                                    </details>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {claims.links.length > 3 && (
                    <nav aria-label="Paginación" className="flex flex-wrap gap-1">
                        {claims.links.map((link, i) => (
                            <Button key={i} asChild={Boolean(link.url)} size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url}>
                                {link.url ? <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                            </Button>
                        ))}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
