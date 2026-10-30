import { ColorField } from '@/components/admin/color-field';
import { ImageField } from '@/components/admin/image-field';
import { RichTextField } from '@/components/admin/rich-text-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { type Cta, type FieldDef, type Json } from '@/types/cms';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';

type Values = Record<string, Json>;

const CTA_VALUE_HINT: Record<string, { label: string; placeholder: string } | null> = {
    lead_form: null,
    whatsapp: { label: 'Mensaje inicial (opcional)', placeholder: 'Si lo dejas vacío se usa el mensaje de Ajustes del sitio' },
    phone: { label: 'Número (opcional)', placeholder: 'Si lo dejas vacío se usa el teléfono de Ajustes del sitio' },
    email: { label: 'Correo (opcional)', placeholder: 'Si lo dejas vacío se usa el correo de Ajustes del sitio' },
    anchor: { label: 'Ancla de la sección', placeholder: 'ej. contacto' },
    url: { label: 'Enlace', placeholder: 'https://…' },
};

/** Valor vacio razonable para un campo; sirve para agregar elementos a una lista. */
export function blankValue(field: FieldDef): Json {
    switch (field.type) {
        case 'toggle':
            return false;
        case 'number':
            return field.min ?? 0;
        case 'select':
            return Object.keys(field.options ?? {})[0] ?? '';
        case 'cta':
            return { label: '', action: 'lead_form', value: '' };
        case 'list':
            return [];
        case 'color':
        case 'image':
            return null;
        default:
            return '';
    }
}

function blankItem(fields: FieldDef[]): Values {
    return Object.fromEntries(fields.map((f) => [f.key, blankValue(f)]));
}

interface SchemaFormProps {
    fields: FieldDef[];
    values: Values;
    onChange: (values: Values) => void;
    errors?: Record<string, string>;
    errorPrefix?: string;
}

export function SchemaForm({ fields, values, onChange, errors = {}, errorPrefix = '' }: SchemaFormProps) {
    return (
        <div className="grid gap-4">
            {fields.map((field) => (
                <FieldControl
                    key={field.key}
                    field={field}
                    value={values[field.key] ?? blankValue(field)}
                    onChange={(value) => onChange({ ...values, [field.key]: value })}
                    error={errors[`${errorPrefix}${field.key}`]}
                />
            ))}
        </div>
    );
}

interface FieldControlProps {
    field: FieldDef;
    value: Json;
    onChange: (value: Json) => void;
    error?: string;
}

function FieldControl({ field, value, onChange, error }: FieldControlProps) {
    const id = useId();

    const wrap = (control: React.ReactNode) => (
        <div className="grid gap-1.5">
            {control}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );

    switch (field.type) {
        case 'text':
            return wrap(
                <>
                    <Label htmlFor={id}>{field.label}</Label>
                    <Input id={id} value={String(value ?? '')} maxLength={field.max} onChange={(e) => onChange(e.target.value)} />
                </>,
            );
        case 'number':
            return wrap(
                <>
                    <Label htmlFor={id}>{field.label}</Label>
                    <Input
                        id={id}
                        type="number"
                        inputMode="decimal"
                        min={field.min}
                        max={field.max}
                        value={typeof value === 'number' || typeof value === 'string' ? value : ''}
                        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                </>,
            );
        case 'textarea':
            return wrap(
                <>
                    <Label htmlFor={id}>{field.label}</Label>
                    <Textarea id={id} rows={4} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
                </>,
            );
        case 'richtext':
        case 'richline':
            return wrap(<RichTextField label={field.label} value={String(value ?? '')} onChange={onChange} inline={field.type === 'richline'} />);
        case 'toggle':
            return wrap(
                <div className="flex items-center gap-2">
                    <Checkbox id={id} checked={value === true} onCheckedChange={(c) => onChange(c === true)} />
                    <Label htmlFor={id} className="font-normal">
                        {field.label}
                    </Label>
                </div>,
            );
        case 'select':
            return wrap(
                <>
                    <Label htmlFor={id}>{field.label}</Label>
                    <NativeSelect id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
                        {Object.entries(field.options ?? {}).map(([k, label]) => (
                            <option key={k} value={k}>
                                {label}
                            </option>
                        ))}
                    </NativeSelect>
                </>,
            );
        case 'color':
            return wrap(<ColorField label={field.label} value={(value as string | null) ?? null} onChange={onChange} optional />);
        case 'image':
            return wrap(<ImageField label={field.label} value={(value as string | null) ?? null} onChange={onChange} />);
        case 'cta':
            return wrap(<CtaControl label={field.label} actions={field.actions ?? {}} value={value as unknown as Cta} onChange={onChange} />);
        case 'list':
            return wrap(<ListControl field={field} value={Array.isArray(value) ? (value as Values[]) : []} onChange={onChange} />);
        default:
            return null;
    }
}

export function CtaControl({ label, actions, value, onChange }: { label: string; actions: Record<string, string>; value: Cta; onChange: (v: Json) => void }) {
    const id = useId();
    const cta: Cta = { label: '', action: 'lead_form', value: '', ...((value ?? {}) as Partial<Cta>) };
    const hint = CTA_VALUE_HINT[cta.action];
    const set = (patch: Partial<Cta>) => onChange({ ...cta, ...patch });

    return (
        <fieldset className="grid gap-3 rounded-lg border border-input p-3">
            <legend className="px-1 text-sm font-medium">{label}</legend>
            <div className="grid gap-1.5">
                <Label htmlFor={`${id}-label`}>Texto del botón (vacío = no se muestra)</Label>
                <Input id={`${id}-label`} value={cta.label} maxLength={80} onChange={(e) => set({ label: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor={`${id}-action`}>Al hacer clic</Label>
                <NativeSelect id={`${id}-action`} value={cta.action} onChange={(e) => set({ action: e.target.value })}>
                    {Object.entries(actions).map(([k, text]) => (
                        <option key={k} value={k}>
                            {text}
                        </option>
                    ))}
                </NativeSelect>
            </div>
            {hint && (
                <div className="grid gap-1.5">
                    <Label htmlFor={`${id}-value`}>{hint.label}</Label>
                    <Input id={`${id}-value`} value={cta.value} placeholder={hint.placeholder} onChange={(e) => set({ value: e.target.value })} />
                </div>
            )}
        </fieldset>
    );
}

function ListControl({ field, value, onChange }: { field: FieldDef; value: Values[]; onChange: (v: Json) => void }) {
    const [open, setOpen] = useState<number | null>(null);
    const subFields = field.fields ?? [];

    const update = (index: number, item: Values) => onChange(value.map((v, i) => (i === index ? item : v)));
    const remove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
        setOpen(null);
    };
    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= value.length) return;
        const next = [...value];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
        setOpen(target);
    };
    const add = () => {
        onChange([...value, blankItem(subFields)]);
        setOpen(value.length);
    };

    return (
        <div className="grid gap-2">
            <span className="text-sm leading-none font-medium">{field.label}</span>
            {value.length === 0 && <p className="text-muted-foreground text-sm">Todavía no hay elementos.</p>}
            <ul className="grid gap-2">
                {value.map((item, index) => {
                    const title = String(item[field.itemLabel ?? ''] ?? '').trim() || `Elemento ${index + 1}`;
                    const isOpen = open === index;
                    return (
                        <li key={index} className="rounded-lg border border-input">
                            <div className="flex items-center gap-1 p-1.5">
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    className="hover:bg-accent flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium"
                                >
                                    {isOpen ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                                    <span className="truncate">{title}</span>
                                </button>
                                <Button type="button" variant="ghost" size="icon" aria-label="Subir" disabled={index === 0} onClick={() => move(index, -1)}>
                                    <ArrowUp />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label="Bajar" disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                                    <ArrowDown />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar ${title}`} onClick={() => remove(index)}>
                                    <Trash2 />
                                </Button>
                            </div>
                            {isOpen && (
                                <div className="border-t border-input p-3">
                                    <SchemaForm fields={subFields} values={item} onChange={(v) => update(index, v)} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {value.length < 30 && (
                <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={add}>
                    <Plus />
                    Agregar
                </Button>
            )}
        </div>
    );
}
