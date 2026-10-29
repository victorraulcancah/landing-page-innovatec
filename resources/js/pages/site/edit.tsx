import { ColorField, ColorTokensProvider } from '@/components/admin/color-field';
import { ImageField } from '@/components/admin/image-field';
import { CtaControl, SchemaForm } from '@/components/admin/schema-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type ContactData, type FieldDef, type FooterData, type Json, type NavbarData, type ThemeData } from '@/types/cms';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';

interface Props {
    theme: ThemeData;
    navbar: NavbarData;
    contact: ContactData;
    footer: FooterData;
    themeColors: Record<string, string>;
    colorTokens: Record<string, string>;
    fonts: Record<string, string>;
    radii: Record<string, string>;
    ctaActions: Record<string, string>;
    anchors: { anchor: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ajustes del sitio', href: '/sitio' }];

type Tab = 'navbar' | 'theme' | 'contact' | 'footer';

const TABS: [Tab, string][] = [
    ['navbar', 'Barra de navegación'],
    ['theme', 'Colores y tipografía'],
    ['contact', 'Contacto'],
    ['footer', 'Pie de página'],
];

export default function SiteEdit(props: Props) {
    const [tab, setTab] = useState<Tab>('navbar');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajustes del sitio" />
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Ajustes del sitio</h1>
                    <p className="text-muted-foreground mt-1 max-w-prose text-sm">
                        Valen para todas las campañas. Cada campaña puede sobrescribir los colores y la tipografía desde su propia pestaña de ajustes.
                    </p>
                </div>

                <div role="tablist" aria-label="Ajustes del sitio" className="flex flex-wrap gap-1 border-b">
                    {TABS.map(([key, label]) => (
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

                <ColorTokensProvider value={{ labels: props.colorTokens, theme: props.theme as unknown as Record<string, string> }}>
                    {tab === 'navbar' && <NavbarForm navbar={props.navbar} ctaActions={props.ctaActions} anchors={props.anchors} />}
                    {tab === 'footer' && <FooterForm footer={props.footer} />}
                </ColorTokensProvider>
                {tab === 'theme' && <ThemeForm theme={props.theme} themeColors={props.themeColors} fonts={props.fonts} radii={props.radii} />}
                {tab === 'contact' && <ContactForm contact={props.contact} />}
            </div>
        </AppLayout>
    );
}

function Err({ message }: { message?: string }) {
    return message ? (
        <p role="alert" className="text-destructive text-sm">
            {message}
        </p>
    ) : null;
}

function SaveButton({ processing, isDirty }: { processing: boolean; isDirty: boolean }) {
    return (
        <div>
            <Button type="submit" disabled={processing || !isDirty}>
                <Save />
                {processing ? 'Guardando…' : 'Guardar cambios'}
            </Button>
        </div>
    );
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(c === true)} />
            <Label htmlFor={id} className="font-normal">
                {label}
            </Label>
        </div>
    );
}

const LINKS_FIELD: FieldDef = {
    key: 'links',
    label: 'Enlaces del menú',
    type: 'list',
    itemLabel: 'label',
    fields: [
        { key: 'label', label: 'Texto', type: 'text', max: 40 },
        { key: 'target', label: 'Destino (#ancla o https://…)', type: 'text', max: 300 },
    ],
};

function NavbarForm({ navbar, ctaActions, anchors }: { navbar: NavbarData; ctaActions: Record<string, string>; anchors: Props['anchors'] }) {
    const form = useForm<NavbarData>({ ...navbar });
    const { data, setData, put, processing, errors, isDirty } = form;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('site.update', 'navbar'), { preserveScroll: true });
            }}
            className="grid gap-8"
        >
            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Marca</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="brand_text">Nombre de la marca</Label>
                        <Input id="brand_text" value={data.brand_text} maxLength={40} onChange={(e) => setData('brand_text', e.target.value)} />
                        <Err message={errors.brand_text} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="brand_sub">Texto pequeño junto a la marca</Label>
                        <Input id="brand_sub" value={data.brand_sub ?? ''} maxLength={60} onChange={(e) => setData('brand_sub', e.target.value)} />
                    </div>
                </div>
                <ImageField label="Logo (si no hay, se muestra el nombre)" value={data.logo} onChange={(v) => setData('logo', v)} />
                <div className="grid gap-1.5 sm:max-w-xs">
                    <Label htmlFor="logo_position">Posición de la marca</Label>
                    <NativeSelect id="logo_position" value={data.logo_position} onChange={(e) => setData('logo_position', e.target.value as NavbarData['logo_position'])}>
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                    </NativeSelect>
                </div>
            </fieldset>

            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Enlaces</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                        <Label htmlFor="links_mode">De dónde salen</Label>
                        <NativeSelect id="links_mode" value={data.links_mode} onChange={(e) => setData('links_mode', e.target.value as NavbarData['links_mode'])}>
                            <option value="auto">Automático: secciones con texto en el menú</option>
                            <option value="manual">Manual: los que escribo abajo</option>
                        </NativeSelect>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="links_align">Posición de los enlaces</Label>
                        <NativeSelect id="links_align" value={data.links_align} onChange={(e) => setData('links_align', e.target.value as NavbarData['links_align'])}>
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                        </NativeSelect>
                    </div>
                </div>
                {data.links_mode === 'manual' && (
                    <>
                        <SchemaForm
                            fields={[LINKS_FIELD]}
                            values={{ links: data.links as unknown as Json }}
                            onChange={(v) => setData('links', v.links as unknown as NavbarData['links'])}
                            errors={errors}
                        />
                        {anchors.length > 0 && (
                            <p className="text-muted-foreground text-sm">
                                Anclas de la campaña en línea:{' '}
                                {anchors.map((a) => (
                                    <code key={a.anchor} className="bg-muted mr-1.5 rounded px-1.5 py-0.5 text-xs">
                                        #{a.anchor}
                                    </code>
                                ))}
                            </p>
                        )}
                    </>
                )}
                {data.links_mode === 'auto' && (
                    <p className="text-muted-foreground text-sm">
                        El menú se arma con las secciones de la campaña que tengan un «Texto en el menú». Así cambia solo cuando cambias de campaña.
                    </p>
                )}
            </fieldset>

            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Botón de la barra</legend>
                <Check id="show_cta" label="Mostrar botón en la barra" checked={data.show_cta} onChange={(v) => setData('show_cta', v)} />
                {data.show_cta && <CtaControl label="Botón" actions={ctaActions} value={data.cta} onChange={(v) => setData('cta', v as unknown as NavbarData['cta'])} />}
            </fieldset>

            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Apariencia</legend>
                <p className="text-muted-foreground -mt-2 text-sm">Los colores vacíos toman los del tema de la campaña.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <ColorField label="Color de fondo" value={data.bg_color} optional onChange={(v) => setData('bg_color', v)} />
                    <ColorField label="Color del texto" value={data.text_color} optional onChange={(v) => setData('text_color', v)} />
                </div>
                <Check id="sticky" label="Mantener la barra fija al bajar" checked={data.sticky} onChange={(v) => setData('sticky', v)} />
                <Check id="border" label="Línea separadora inferior" checked={data.border} onChange={(v) => setData('border', v)} />
            </fieldset>

            <SaveButton processing={processing} isDirty={isDirty} />
        </form>
    );
}

function ThemeForm({ theme, themeColors, fonts, radii }: { theme: ThemeData; themeColors: Record<string, string>; fonts: Record<string, string>; radii: Record<string, string> }) {
    const { data, setData, put, processing, errors, isDirty } = useForm<ThemeData>({ ...theme });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('site.update', 'theme'), { preserveScroll: true });
            }}
            className="grid gap-8"
        >
            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Paleta</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(themeColors).map(([key, label]) => (
                        <div key={key} className="grid gap-1.5">
                            <ColorField label={label} plain value={data[key as keyof ThemeData] as string} onChange={(v) => v && setData(key as keyof ThemeData, v as never)} />
                            <Err message={errors[key as keyof ThemeData]} />
                        </div>
                    ))}
                </div>
            </fieldset>
            <fieldset className="grid gap-4">
                <legend className="mb-1 text-base font-semibold">Tipografía y formas</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="heading_font">Fuente de titulares</Label>
                        <NativeSelect id="heading_font" value={data.heading_font} onChange={(e) => setData('heading_font', e.target.value)}>
                            {Object.entries(fonts).map(([value, text]) => (
                                <option key={value} value={value}>
                                    {text}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="body_font">Fuente del texto</Label>
                        <NativeSelect id="body_font" value={data.body_font} onChange={(e) => setData('body_font', e.target.value)}>
                            {Object.entries(fonts).map(([value, text]) => (
                                <option key={value} value={value}>
                                    {text}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="radius">Esquinas</Label>
                        <NativeSelect id="radius" value={data.radius} onChange={(e) => setData('radius', e.target.value as ThemeData['radius'])}>
                            {Object.entries(radii).map(([value, text]) => (
                                <option key={value} value={value}>
                                    {text}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>
            </fieldset>
            <SaveButton processing={processing} isDirty={isDirty} />
        </form>
    );
}

function ContactForm({ contact }: { contact: ContactData }) {
    const { data, setData, put, processing, errors, isDirty } = useForm<ContactData>({ ...contact });
    const fields: [keyof ContactData, string, string?][] = [
        ['whatsapp', 'WhatsApp (solo números; si son 9 dígitos se asume Perú, +51)'],
        ['phone', 'Teléfono'],
        ['email', 'Correo de contacto'],
        ['website', 'Sitio web'],
        ['address', 'Dirección'],
    ];

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('site.update', 'contact'), { preserveScroll: true });
            }}
            className="grid gap-6"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(([key, label]) => (
                    <div key={key} className={`grid gap-1.5 ${key === 'address' ? 'sm:col-span-2' : ''}`}>
                        <Label htmlFor={key}>{label}</Label>
                        <Input id={key} value={data[key]} onChange={(e) => setData(key, e.target.value)} />
                        <Err message={errors[key]} />
                    </div>
                ))}
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="whatsapp_message">Mensaje inicial de WhatsApp</Label>
                <Textarea id="whatsapp_message" rows={3} value={data.whatsapp_message} onChange={(e) => setData('whatsapp_message', e.target.value)} />
                <p className="text-muted-foreground text-sm">Aparece escrito cuando el visitante abre el chat desde un botón.</p>
            </div>
            <SaveButton processing={processing} isDirty={isDirty} />
        </form>
    );
}

function FooterForm({ footer }: { footer: FooterData }) {
    const { data, setData, put, processing, isDirty } = useForm<FooterData>({ ...footer });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                put(route('site.update', 'footer'), { preserveScroll: true });
            }}
            className="grid gap-6"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="footer_text">Texto principal</Label>
                    <Input id="footer_text" value={data.text} onChange={(e) => setData('text', e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="footer_legal">Texto legal</Label>
                    <Input id="footer_legal" value={data.legal} onChange={(e) => setData('legal', e.target.value)} />
                </div>
            </div>
            <Check id="footer_contact" label="Mostrar datos de contacto en el pie" checked={data.show_contact} onChange={(v) => setData('show_contact', v)} />
            <div className="grid gap-4 sm:grid-cols-2">
                <ColorField label="Color de fondo" value={data.bg_color} optional onChange={(v) => setData('bg_color', v)} />
                <ColorField label="Color del texto" value={data.text_color} optional onChange={(v) => setData('text_color', v)} />
            </div>
            <SaveButton processing={processing} isDirty={isDirty} />
        </form>
    );
}
