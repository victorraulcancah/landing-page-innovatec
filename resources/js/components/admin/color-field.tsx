import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { createContext, useContext, useEffect, useId, useState } from 'react';

const HEX = /^#[0-9a-fA-F]{6}$/;

interface ColorTokens {
    /** Nombre del color del tema -> etiqueta legible. */
    labels: Record<string, string>;
    /** Color real (#RRGGBB) de cada nombre, para mostrar la muestra. */
    theme: Record<string, string>;
}

const ColorTokensContext = createContext<ColorTokens | null>(null);

/** Habilita en los campos de color la lista de colores del tema. */
export const ColorTokensProvider = ColorTokensContext.Provider;

export const useColorTokens = () => useContext(ColorTokensContext);

interface ColorFieldProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    /** Color que se hereda cuando el valor esta vacio; si no hay, el campo es obligatorio. */
    inherited?: string | null;
    optional?: boolean;
    /** Fuerza un campo de solo color hexadecimal (la paleta misma no puede apuntar a si misma). */
    plain?: boolean;
}

export function ColorField({ label, value, onChange, inherited = null, optional = false, plain = false }: ColorFieldProps) {
    const id = useId();
    const tokens = useContext(ColorTokensContext);
    const [draft, setDraft] = useState(value && HEX.test(value) ? value : '');

    useEffect(() => setDraft(value && HEX.test(value) ? value : ''), [value]);

    const useTokens = !plain && tokens !== null;
    const isToken = useTokens && value !== null && value in (tokens?.labels ?? {});
    const resolved = isToken ? (tokens!.theme[value!] ?? '#ffffff') : (value ?? inherited ?? '#ffffff');
    const swatch = HEX.test(resolved) ? resolved : '#ffffff';

    const commit = (text: string) => {
        setDraft(text);
        if (HEX.test(text)) onChange(text.toLowerCase());
        else if (text === '' && optional) onChange(null);
    };

    const hexControls = (
        <div className="flex items-center gap-2">
            <input
                type="color"
                aria-label={`${label}: selector de color`}
                value={swatch}
                onChange={(e) => onChange(e.target.value.toLowerCase())}
                className="size-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
            />
            <Input
                id={useTokens ? undefined : id}
                aria-label={`${label}: código del color`}
                value={draft}
                onChange={(e) => commit(e.target.value)}
                onBlur={() => setDraft(value && HEX.test(value) ? value : '')}
                placeholder={inherited ? `Heredado ${inherited}` : '#RRGGBB'}
                spellCheck={false}
                className="font-mono"
            />
            {!useTokens && optional && value && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                    Heredar
                </Button>
            )}
        </div>
    );

    if (!useTokens) {
        return (
            <div className="grid gap-1.5">
                <Label htmlFor={id}>{label}</Label>
                {hexControls}
            </div>
        );
    }

    const mode = value === null ? '' : isToken ? value : 'custom';

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-2">
                <span aria-hidden className="size-10 shrink-0 rounded-md border border-input" style={{ backgroundColor: value === null && !inherited ? 'transparent' : swatch }} />
                <NativeSelect
                    id={id}
                    value={mode}
                    onChange={(e) => {
                        const next = e.target.value;
                        if (next === '') onChange(null);
                        else if (next === 'custom') onChange(HEX.test(swatch) ? swatch : '#1c53ee');
                        else onChange(next);
                    }}
                >
                    {optional && <option value="">Heredado</option>}
                    <optgroup label="Colores del tema">
                        {Object.entries(tokens!.labels).map(([key, text]) => (
                            <option key={key} value={key}>
                                {text}
                            </option>
                        ))}
                    </optgroup>
                    <option value="custom">Color personalizado…</option>
                </NativeSelect>
            </div>
            {mode === 'custom' && hexControls}
        </div>
    );
}
