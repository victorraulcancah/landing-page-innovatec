import { ColorField, ColorTokensProvider } from '@/components/admin/color-field';
import { SchemaForm } from '@/components/admin/schema-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type CampaignData, type CampaignSectionData, type Json, type SectionSchema, type SectionStyle, type ThemeData } from '@/types/cms';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, ExternalLink, Plus, Radio, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
    campaign: CampaignData;
    sections: CampaignSectionData[];
    schema: SectionSchema;
    themeColors: Record<string, string>;
    colorTokens: Record<string, string>;
    globalTheme: ThemeData;
    fonts: Record<string, string>;
    radii: Record<string, string>;
    statuses: Record<string, string>;
}

type Tab = 'sections' | 'settings';

export default function CampaignEdit({ campaign, sections, schema, themeColors, colorTokens, globalTheme, fonts, radii, statuses }: Props) {
    const [tab, setTab] = useState<Tab>('sections');
    const [openId, setOpenId] = useState<number | null>(sections[0]?.id ?? null);

    // Colores reales de la campaña (tema del sitio + sus cambios) para las muestras del selector.
    const resolvedTheme = Object.fromEntries(
        Object.keys(colorTokens).map((key) => [key, (campaign.theme?.[key as keyof ThemeData] as string | undefined) || (globalTheme[key as keyof ThemeData] as string)]),
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Campañas', href: '/campanas' },
        { title: campaign.name, href: `/campanas/${campaign.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campaign.name} />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
                            <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'draft' ? 'secondary' : 'outline'}>{statuses[campaign.status]}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">Cada sección se guarda por separado. Usa la vista previa para ver cómo queda.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route('campaigns.preview', campaign.id)} target="_blank" rel="noreferrer">
                                <ExternalLink />
                                Vista previa
                            </a>
                        </Button>
                        {campaign.status !== 'active' && (
                            <Button
                                size="sm"
                                onClick={() =>
                                    window.confirm(`¿Poner «${campaign.name}» en línea? La campaña actual quedará archivada.`) &&
                                    router.post(route('campaigns.activate', campaign.id), {}, { preserveScroll: true })
                                }
                            >
                                <Radio />
                                Poner en línea
                            </Button>
                        )}
                    </div>
                </header>

                <div role="tablist" aria-label="Editor de campaña" className="flex gap-1 border-b">
                    {(
                        [
                            ['sections', `Secciones (${sections.length})`],
                            ['settings', 'Ajustes y colores de la campaña'],
                        ] as [Tab, string][]
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            onClick={() => setTab(key)}
                            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === key ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground border-transparent'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'sections' ? (
                    <ColorTokensProvider value={{ labels: colorTokens, theme: resolvedTheme }}>
                        <SectionsTab campaignId={campaign.id} sections={sections} schema={schema} openId={openId} setOpenId={setOpenId} />
                    </ColorTokensProvider>
                ) : (
                    <SettingsTab campaign={campaign} themeColors={themeColors} globalTheme={globalTheme} fonts={fonts} radii={radii} />
                )}
            </div>
        </AppLayout>
    );
}

function SectionsTab({
    campaignId,
    sections,
    schema,
    openId,
    setOpenId,
}: {
    campaignId: number;
    sections: CampaignSectionData[];
    schema: SectionSchema;
    openId: number | null;
    setOpenId: (id: number | null) => void;
}) {
    const [newType, setNewType] = useState(Object.keys(schema)[0]);

    return (
        <div className="grid gap-4">
            <ol className="grid gap-3">
                {sections.map((section, index) => (
                    <SectionEditor
                        key={section.id}
                        section={section}
                        def={schema[section.type]}
                        index={index}
                        total={sections.length}
                        open={openId === section.id}
                        onToggleOpen={() => setOpenId(openId === section.id ? null : section.id)}
                    />
                ))}
            </ol>

            <div className="rounded-lg border border-dashed p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="grid min-w-56 flex-1 gap-1.5">
                        <Label htmlFor="new-section">Agregar una sección al final</Label>
                        <NativeSelect id="new-section" value={newType} onChange={(e) => setNewType(e.target.value)}>
                            {Object.entries(schema).map(([key, def]) => (
                                <option key={key} value={key}>
                                    {def.label}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <Button type="button" onClick={() => router.post(route('sections.store', campaignId), { type: newType }, { preserveScroll: true })}>
                        <Plus />
                        Agregar sección
                    </Button>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{schema[newType]?.description}</p>
            </div>
        </div>
    );
}

interface SectionState {
    is_visible: boolean;
    anchor: string;
    nav_label: string;
    content: Record<string, Json>;
    style: SectionStyle;
}

function toState(section: CampaignSectionData): SectionState {
    return {
        is_visible: section.is_visible,
        anchor: section.anchor ?? '',
        nav_label: section.nav_label ?? '',
        content: section.content,
        style: section.style,
    };
}

function SectionEditor({
    section,
    def,
    index,
    total,
    open,
    onToggleOpen,
}: {
    section: CampaignSectionData;
    def: SectionSchema[string];
    index: number;
    total: number;
    open: boolean;
    onToggleOpen: () => void;
}) {
    const signature = JSON.stringify(section);
    const [state, setState] = useState<SectionState>(() => toState(section));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Cuando el servidor devuelve la seccion guardada, el formulario toma esos valores.
    useEffect(() => {
        setState(toState(section));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature]);

    const dirty = useMemo(() => JSON.stringify(state) !== JSON.stringify(toState(section)), [state, section]);

    const save = () => {
        setSaving(true);
        router.put(
            route('sections.update', section.id),
            { is_visible: state.is_visible, anchor: state.anchor, nav_label: state.nav_label, content: state.content, style: state.style } as never,
            {
                preserveScroll: true,
                onError: (e) => setErrors(e),
                onSuccess: () => setErrors({}),
                onFinish: () => setSaving(false),
            },
        );
    };

    const move = (direction: 'up' | 'down') => router.post(route('sections.move', section.id), { direction }, { preserveScroll: true });
    const remove = () => {
        if (window.confirm(`¿Eliminar la sección «${def.label}»? Esta acción no se puede deshacer.`)) {
            router.delete(route('sections.destroy', section.id), { preserveScroll: true });
        }
    };

    const title = String(section.content.title ?? '').trim();

    return (
        <li className={`rounded-lg border ${section.is_visible ? '' : 'bg-muted/40'}`}>
            <div className="flex items-center gap-1 p-2">
                <button
                    type="button"
                    onClick={onToggleOpen}
                    aria-expanded={open}
                    className="hover:bg-accent flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-2 text-left"
                >
                    {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                    <span className="min-w-0">
                        <span className="block text-sm font-medium">
                            {def.label}
                            {!section.is_visible && <span className="text-muted-foreground ml-2 font-normal">· Oculta</span>}
                            {dirty && <span className="ml-2 text-xs font-normal text-amber-600">· Sin guardar</span>}
                        </span>
                        {title && <span className="text-muted-foreground block truncate text-sm">{title}</span>}
                    </span>
                </button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={section.is_visible ? 'Ocultar en la landing' : 'Mostrar en la landing'}
                    title={section.is_visible ? 'Visible: clic para ocultar' : 'Oculta: clic para mostrar'}
                    onClick={() => router.post(route('sections.toggle', section.id), {}, { preserveScroll: true })}
                >
                    {section.is_visible ? <Eye /> : <EyeOff />}
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Subir sección" disabled={index === 0} onClick={() => move('up')}>
                    <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Bajar sección" disabled={index === total - 1} onClick={() => move('down')}>
                    <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar sección ${def.label}`} onClick={remove}>
                    <Trash2 />
                </Button>
            </div>

            {open && (
                <div className="grid gap-6 border-t p-4">
                    <section aria-labelledby={`c-${section.id}`} className="grid gap-4">
                        <h3 id={`c-${section.id}`} className="text-sm font-semibold">
                            Contenido
                        </h3>
                        <SchemaForm fields={def.content} values={state.content} onChange={(content) => setState((s) => ({ ...s, content }))} />
                    </section>

                    <section aria-labelledby={`a-${section.id}`} className="grid gap-4">
                        <h3 id={`a-${section.id}`} className="text-sm font-semibold">
                            Apariencia
                        </h3>
                        <p className="text-muted-foreground -mt-2 text-sm">Los colores vacíos usan los de la campaña.</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <SchemaForm
                                fields={def.style}
                                values={state.style as unknown as Record<string, Json>}
                                onChange={(style) => setState((s) => ({ ...s, style: style as unknown as SectionStyle }))}
                            />
                        </div>
                    </section>

                    <section aria-labelledby={`m-${section.id}`} className="grid gap-4">
                        <h3 id={`m-${section.id}`} className="text-sm font-semibold">
                            Menú y enlace
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor={`nav-${section.id}`}>Texto en el menú (vacío = no aparece)</Label>
                                <Input id={`nav-${section.id}`} value={state.nav_label} maxLength={40} onChange={(e) => setState((s) => ({ ...s, nav_label: e.target.value }))} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor={`anchor-${section.id}`}>Ancla (para enlaces a esta sección)</Label>
                                <Input
                                    id={`anchor-${section.id}`}
                                    value={state.anchor}
                                    maxLength={64}
                                    onChange={(e) => setState((s) => ({ ...s, anchor: e.target.value.toLowerCase() }))}
                                    placeholder="ej. servicios"
                                />
                                {errors.anchor && (
                                    <p role="alert" className="text-destructive text-sm">
                                        {errors.anchor}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <Button type="button" onClick={save} disabled={saving || !dirty}>
                            <Save />
                            {saving ? 'Guardando…' : 'Guardar sección'}
                        </Button>
                        {dirty && !saving && (
                            <Button type="button" variant="ghost" onClick={() => setState(toState(section))}>
                                Descartar cambios
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
}

function SettingsTab({
    campaign,
    themeColors,
    globalTheme,
    fonts,
    radii,
}: {
    campaign: CampaignData;
    themeColors: Record<string, string>;
    globalTheme: ThemeData;
    fonts: Record<string, string>;
    radii: Record<string, string>;
}) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: campaign.name,
        slug: campaign.slug,
        meta_title: campaign.meta_title ?? '',
        meta_description: campaign.meta_description ?? '',
        theme: { ...(campaign.theme ?? {}) } as Record<string, string | null>,
    });

    const setTheme = (key: string, value: string | null) => setData('theme', { ...data.theme, [key]: value });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('campaigns.update', campaign.id), { preserveScroll: true });
            }}
            className="grid gap-8"
        >
            <section className="grid gap-4" aria-labelledby="general">
                <h2 id="general" className="text-base font-semibold">
                    General
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="c-name">Nombre interno</Label>
                        <Input id="c-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p role="alert" className="text-destructive text-sm">{errors.name}</p>}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="c-slug">Identificador</Label>
                        <Input id="c-slug" value={data.slug} onChange={(e) => setData('slug', e.target.value.toLowerCase())} className="font-mono" />
                        {errors.slug && <p role="alert" className="text-destructive text-sm">{errors.slug}</p>}
                    </div>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="c-meta-title">Título en Google y en la pestaña</Label>
                    <Input id="c-meta-title" value={data.meta_title} maxLength={160} onChange={(e) => setData('meta_title', e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="c-meta-desc">Descripción en Google</Label>
                    <Textarea id="c-meta-desc" rows={3} value={data.meta_description} maxLength={300} onChange={(e) => setData('meta_description', e.target.value)} />
                </div>
            </section>

            <section className="grid gap-4" aria-labelledby="theme">
                <div>
                    <h2 id="theme" className="text-base font-semibold">
                        Colores y tipografía de esta campaña
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Lo que dejes vacío usa los valores generales del sitio (Ajustes del sitio). Aquí puedes dar a cada campaña su propia paleta.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(themeColors).map(([key, label]) => (
                        <ColorField
                            key={key}
                            label={label}
                            value={data.theme[key] ?? null}
                            inherited={globalTheme[key as keyof ThemeData] as string}
                            optional
                            plain
                            onChange={(v) => setTheme(key, v)}
                        />
                    ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    {(
                        [
                            ['heading_font', 'Fuente de titulares', fonts],
                            ['body_font', 'Fuente del texto', fonts],
                            ['radius', 'Esquinas', radii],
                        ] as [string, string, Record<string, string>][]
                    ).map(([key, label, options]) => (
                        <div key={key} className="grid gap-1.5">
                            <Label htmlFor={`t-${key}`}>{label}</Label>
                            <NativeSelect id={`t-${key}`} value={data.theme[key] ?? ''} onChange={(e) => setTheme(key, e.target.value || null)}>
                                <option value="">Heredar del sitio</option>
                                {Object.entries(options).map(([value, text]) => (
                                    <option key={value} value={value}>
                                        {text}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    ))}
                </div>
            </section>

            <div>
                <Button type="submit" disabled={processing || !isDirty}>
                    <Save />
                    {processing ? 'Guardando…' : 'Guardar ajustes'}
                </Button>
            </div>
        </form>
    );
}
