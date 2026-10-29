import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Phone, Trash2 } from 'lucide-react';

interface LeadRow {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    message: string | null;
    status: string;
    campaign: string | null;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props {
    leads: Paginated<LeadRow>;
    statuses: Record<string, string>;
    filter: string | null;
    counts: Record<string, number>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Contactos', href: '/contactos' }];

const dateFormat = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function LeadsIndex({ leads, statuses, filter, counts }: Props) {
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0);

    const remove = (lead: LeadRow) => {
        if (window.confirm(`¿Eliminar el contacto de ${lead.name}?`)) router.delete(route('leads.destroy', lead.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contactos" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Contactos</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Personas que dejaron sus datos en el formulario de la landing.</p>
                </div>

                <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant={!filter ? 'default' : 'outline'}>
                        <Link href={route('leads.index')}>Todos ({total})</Link>
                    </Button>
                    {Object.entries(statuses).map(([key, label]) => (
                        <Button key={key} asChild size="sm" variant={filter === key ? 'default' : 'outline'}>
                            <Link href={route('leads.index', { status: key })}>
                                {label} ({counts[key] ?? 0})
                            </Link>
                        </Button>
                    ))}
                </nav>

                {leads.data.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                        {filter ? 'No hay contactos con este estado.' : 'Todavía no llegó ningún contacto. Aparecerán aquí cuando alguien use el formulario de la landing.'}
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {leads.data.map((lead) => (
                            <li key={lead.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {lead.name}
                                        {lead.company && <span className="text-muted-foreground font-normal"> · {lead.company}</span>}
                                    </p>
                                    <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                        {lead.email && (
                                            <a href={`mailto:${lead.email}`} className="hover:text-foreground inline-flex items-center gap-1.5 hover:underline">
                                                <Mail className="size-3.5" />
                                                {lead.email}
                                            </a>
                                        )}
                                        {lead.phone && (
                                            <a href={`tel:${lead.phone}`} className="hover:text-foreground inline-flex items-center gap-1.5 hover:underline">
                                                <Phone className="size-3.5" />
                                                {lead.phone}
                                            </a>
                                        )}
                                        <span>{dateFormat.format(new Date(lead.created_at))}</span>
                                        {lead.campaign && <span>Campaña: {lead.campaign}</span>}
                                    </p>
                                    {lead.message && <p className="mt-2 max-w-prose text-sm whitespace-pre-line">{lead.message}</p>}
                                </div>
                                <div className="flex items-start gap-2">
                                    <NativeSelect
                                        aria-label={`Estado de ${lead.name}`}
                                        value={lead.status}
                                        className="w-48"
                                        onChange={(e) => router.put(route('leads.update', lead.id), { status: e.target.value }, { preserveScroll: true })}
                                    >
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                    <Button variant="ghost" size="icon" aria-label={`Eliminar contacto de ${lead.name}`} onClick={() => remove(lead)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {leads.links.length > 3 && (
                    <nav aria-label="Paginación" className="flex flex-wrap gap-1">
                        {leads.links.map((link, i) => (
                            <Button key={i} asChild={!!link.url} size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url}>
                                {link.url ? <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                            </Button>
                        ))}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
