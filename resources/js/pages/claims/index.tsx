import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Mail, Phone } from 'lucide-react';

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
    amount: string | null;
    good_description: string;
    detail: string;
    request: string;
    provider: { name?: string; ruc?: string; address?: string } | null;
    status: string;
    response: string | null;
    created_at: string;
    answered_at: string | null;
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
    filter: string | null;
    counts: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reclamos', href: '/reclamos' }];
const dateFormat = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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

export default function ClaimsIndex({ claims, statuses, types, goodTypes, filter, counts }: Props) {
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reclamos" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <BookOpen className="size-6" />
                        Libro de Reclamaciones
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Hojas de reclamación registradas desde la landing. El proveedor debe responder en un máximo de 15 días hábiles.</p>
                </div>

                <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant={!filter ? 'default' : 'outline'}>
                        <Link href={route('claims.index')}>Todos ({total})</Link>
                    </Button>
                    {Object.entries(statuses).map(([key, label]) => (
                        <Button key={key} asChild size="sm" variant={filter === key ? 'default' : 'outline'}>
                            <Link href={route('claims.index', { status: key })}>
                                {label} ({counts[key] ?? 0})
                            </Link>
                        </Button>
                    ))}
                </nav>

                {claims.data.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                        {filter ? 'No hay hojas con este estado.' : 'Todavía no hay reclamos. Aparecerán aquí cuando alguien use el Libro de Reclamaciones de la landing.'}
                    </p>
                ) : (
                    <ul className="grid gap-3">
                        {claims.data.map((c) => (
                            <li key={c.id} className="rounded-lg border">
                                <details className="group">
                                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4">
                                        <span className="font-mono text-sm font-semibold">{c.code}</span>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.type === 'queja' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{types[c.type] ?? c.type}</span>
                                        <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                                        <span className="text-muted-foreground text-xs">{dateFormat.format(new Date(c.created_at))}</span>
                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${c.status === 'answered' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            {c.status === 'answered' ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                                            {statuses[c.status] ?? c.status}
                                        </span>
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
                                            <Row label="Domicilio">{c.address}</Row>
                                            {c.is_minor && (
                                                <Row label="Apoderado">
                                                    {c.guardian_name} · {c.guardian_doc_type} {c.guardian_doc_number}
                                                </Row>
                                            )}
                                            <Row label="Bien contratado">
                                                {goodTypes[c.good_type] ?? c.good_type}
                                                {c.amount !== null && ` · S/ ${c.amount}`}
                                            </Row>
                                            <Row label="Descripción">{c.good_description}</Row>
                                            <Row label="Detalle">{c.detail}</Row>
                                            <Row label="Pedido">{c.request}</Row>
                                            {c.provider?.name && (
                                                <Row label="Proveedor">
                                                    {[c.provider.name, c.provider.ruc && `RUC ${c.provider.ruc}`, c.provider.address].filter(Boolean).join(' · ')}
                                                </Row>
                                            )}
                                            {c.answered_at && <Row label="Atendido el">{dateFormat.format(new Date(c.answered_at))}</Row>}
                                        </dl>
                                        <Answer claim={c} />
                                    </div>
                                </details>
                            </li>
                        ))}
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
