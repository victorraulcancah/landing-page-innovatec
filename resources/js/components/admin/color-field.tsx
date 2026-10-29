import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useId, useState } from 'react';

const HEX = /^#[0-9a-fA-F]{6}$/;

interface ColorFieldProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    /** Color que se hereda cuando el valor esta vacio; si no hay, el campo es obligatorio. */
    inherited?: string | null;
    optional?: boolean;
}

export function ColorField({ label, value, onChange, inherited = null, optional = false }: ColorFieldProps) {
    const id = useId();
    const [draft, setDraft] = useState(value ?? '');

    useEffect(() => setDraft(value ?? ''), [value]);

    const swatch = value ?? inherited ?? '#ffffff';

    const commit = (text: string) => {
        setDraft(text);
        if (HEX.test(text)) onChange(text.toLowerCase());
        else if (text === '' && optional) onChange(null);
    };

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    aria-label={`${label}: selector de color`}
                    value={HEX.test(swatch) ? swatch : '#ffffff'}
                    onChange={(e) => onChange(e.target.value.toLowerCase())}
                    className="size-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1"
                />
                <Input
                    id={id}
                    value={draft}
                    onChange={(e) => commit(e.target.value)}
                    onBlur={() => setDraft(value ?? '')}
                    placeholder={inherited ? `Heredado ${inherited}` : '#RRGGBB'}
                    spellCheck={false}
                    className="font-mono"
                />
                {optional && value && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                        Heredar
                    </Button>
                )}
            </div>
        </div>
    );
}
