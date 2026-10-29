import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Archive, Copy, Eye, MoreHorizontal, Pencil, Plus, Radio, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface CampaignRow {
    id: number;
    name: string;
    slug: string;
    status: 'draft' | 'active' | 'archived';
    sections_count: number;
    leads_count: number;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Campañas', href: '/campanas' }];

const dateFormat = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CampaignsIndex({ campaigns, statuses }: { campaigns: CampaignRow[]; statuses: Record<string, string> }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const create: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('campaigns.store'), { onSuccess: () => reset() });
    };

    const act = (name: string, campaign: CampaignRow, confirmText?: string) => {
        if (confirmText && !window.confirm(confirmText)) return;
        router.post(route(name, campaign.id), {}, { preserveScroll: true });
    };

    const remove = (campaign: CampaignRow) => {
        if (!window.confirm(`¿Eliminar «${campaign.name}» y todas sus secciones? Esta acción no se puede deshacer.`)) return;
        router.delete(route('campaigns.destroy', campaign.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Campañas" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Campañas</h1>
                    <p className="text-muted-foreground mt-1 max-w-prose text-sm">
                        La landing muestra una sola campaña a la vez. Al poner otra en línea, la anterior queda archivada y la puedes reactivar cuando quieras.
                    </p>
                </div>

                <form onSubmit={create} className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
                    <div className="grid min-w-64 flex-1 gap-1.5">
                        <Label htmlFor="name">Nueva campaña</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ej. ¿Tu backup realmente restaura?" maxLength={120} />
                        {errors.name && (
                            <p role="alert" className="text-destructive text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Plus />
                        Crear campaña
                    </Button>
                </form>

                {campaigns.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                        Todavía no hay campañas. Crea la primera con el formulario de arriba.
                    </p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {campaigns.map((c) => (
                            <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                                <div className="min-w-56 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Link href={route('campaigns.edit', c.id)} className="font-medium hover:underline">
                                            {c.name}
                                        </Link>
                                        <Badge variant={c.status === 'active' ? 'default' : c.status === 'draft' ? 'secondary' : 'outline'}>{statuses[c.status]}</Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {c.sections_count} secciones · {c.leads_count} contactos · Editada {dateFormat.format(new Date(c.updated_at))}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {c.status !== 'active' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => act('campaigns.activate', c, `¿Poner «${c.name}» en línea? La campaña actual quedará archivada.`)}
                                        >
                                            <Radio />
                                            Poner en línea
                                        </Button>
                                    )}
                                    <Button size="sm" asChild>
                                        <Link href={route('campaigns.edit', c.id)}>
                                            <Pencil />
                                            Editar
                                        </Link>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" aria-label={`Más acciones para ${c.name}`}>
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <a href={route('campaigns.preview', c.id)} target="_blank" rel="noreferrer">
                                                    <Eye />
                                                    Vista previa
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => act('campaigns.duplicate', c)}>
                                                <Copy />
                                                Duplicar
                                            </DropdownMenuItem>
                                            {c.status !== 'archived' && (
                                                <DropdownMenuItem onSelect={() => act('campaigns.archive', c, `¿Archivar «${c.name}»?${c.status === 'active' ? ' La landing quedará sin campaña en línea.' : ''}`)}>
                                                    <Archive />
                                                    Archivar
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => remove(c)}>
                                                <Trash2 />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
