import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

interface ImageFieldProps {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
}

export function ImageField({ label, value, onChange }: ImageFieldProps) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        const body = new FormData();
        body.append('image', file);

        try {
            const response = await fetch(route('media.store'), {
                method: 'POST',
                body,
                headers: { 'X-XSRF-TOKEN': xsrfToken(), Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await response.json();
            if (!response.ok) {
                setError(json?.errors?.image?.[0] ?? 'No se pudo subir la imagen. Prueba con otra.');
            } else {
                onChange(json.url);
            }
        } catch {
            setError('No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.');
        } finally {
            setUploading(false);
            if (input.current) input.current.value = '';
        }
    };

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-3">
                {value ? (
                    <img src={value} alt="" className="h-16 w-24 rounded-md border border-input bg-muted object-cover" />
                ) : (
                    <div className="text-muted-foreground flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-input text-xs">Sin imagen</div>
                )}
                <input
                    id={id}
                    ref={input}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
                    {uploading ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
                    {value ? 'Cambiar' : 'Subir imagen'}
                </Button>
                {value && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                        <Trash2 />
                        Quitar
                    </Button>
                )}
            </div>
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
