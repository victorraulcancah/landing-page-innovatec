import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Megaphone, Palette, Users } from 'lucide-react';

interface Props {
    stats: {
        active: { id: number; name: string } | null;
        campaigns: number;
        leads_new: number;
        leads_total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inicio', href: '/dashboard' }];

export default function Dashboard({ stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inicio" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Panel de la landing</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Administra la campaña que ven tus visitantes, el diseño del sitio y los contactos que llegan.</p>
                </div>

                <section aria-labelledby="live" className="rounded-lg border p-5">
                    <h2 id="live" className="text-muted-foreground text-sm font-medium">
                        En línea ahora
                    </h2>
                    {stats.active ? (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xl font-semibold">{stats.active.name}</p>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <a href="/" target="_blank" rel="noreferrer">
                                        <ExternalLink />
                                        Ver la landing
                                    </a>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href={route('campaigns.edit', stats.active.id)}>Editar campaña</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-muted-foreground">No hay ninguna campaña en línea: la landing aparece vacía.</p>
                            <Button asChild size="sm">
                                <Link href={route('campaigns.index')}>Elegir una campaña</Link>
                            </Button>
                        </div>
                    )}
                </section>

                <section aria-label="Accesos" className="grid gap-4 md:grid-cols-3">
                    <Link href={route('campaigns.index')} className="hover:bg-accent rounded-lg border p-5">
                        <Megaphone className="text-muted-foreground size-5" />
                        <p className="mt-3 font-medium">Campañas</p>
                        <p className="text-muted-foreground mt-1 text-sm">{stats.campaigns} en total. Crea, edita y cambia la que está en línea.</p>
                    </Link>
                    <Link href={route('site.edit')} className="hover:bg-accent rounded-lg border p-5">
                        <Palette className="text-muted-foreground size-5" />
                        <p className="mt-3 font-medium">Ajustes del sitio</p>
                        <p className="text-muted-foreground mt-1 text-sm">Barra de navegación, colores, tipografía, contacto y pie.</p>
                    </Link>
                    <Link href={route('leads.index')} className="hover:bg-accent rounded-lg border p-5">
                        <Users className="text-muted-foreground size-5" />
                        <p className="mt-3 font-medium">Contactos</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {stats.leads_new} nuevos de {stats.leads_total}.
                        </p>
                    </Link>
                </section>
            </div>
        </AppLayout>
    );
}
