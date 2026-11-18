import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, LoaderCircle, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

interface FileFieldProps {
    label: string;
    value: string | null;
    /** «document»: PDF, Word, Excel o PowerPoint. «video»: MP4/WebM, o un enlace de YouTube o Vimeo. */
    kind: 'document' | 'video';
    onChange: (value: string | null) => void;
}

const ACCEPT = {
    document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    video: '.mp4,.webm,video/mp4,video/webm',
} as const;

export function FileField({ label, value, kind, onChange }: FileFieldProps) {
    const id = useId();
    const input = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        const body = new FormData();
        body.append('file', file);

        try {
            const response = await fetch(route('media.file'), {
                method: 'POST',
                body,
                headers: { 'X-XSRF-TOKEN': xsrfToken(), Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await response.json().catch(() => null);
            if (!response.ok) {
                setError(json?.errors?.file?.[0] ?? (response.status === 413 ? 'El archivo es demasiado pesado para el servidor.' : 'No se pudo subir el archivo. Prueba con otro.'));
            } else {
                onChange(json.url);
            }
        } catch {
            setError('No se pudo subir el archivo. Revisa tu conexión e inténtalo de nuevo.');
        } finally {
            setUploading(false);
            if (input.current) input.current.value = '';
        }
    };

    const isLink = Boolean(value && /^https:/i.test(value));
    const shown = value ? (isLink ? value : decodeURIComponent(value.split('/').pop() ?? value)) : '';

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex flex-wrap items-center gap-2">
                {kind === 'video' ? (
                    <Input
                        id={id}
                        className="min-w-0 flex-1 basis-64"
                        placeholder="https://www.youtube.com/watch?v=…  o  https://vimeo.com/…"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value.trim() === '' ? null : e.target.value.trim())}
                    />
                ) : (
                    <span className={`min-w-0 flex-1 basis-48 truncate rounded-md border border-dashed border-input px-3 py-2 text-sm ${value ? '' : 'text-muted-foreground'}`}>{value ? shown : 'Sin archivo'}</span>
                )}
                <input ref={input} type="file" accept={ACCEPT[kind]} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
                    {uploading ? <LoaderCircle className="animate-spin" /> : <FileUp />}
                    {kind === 'video' ? 'Subir MP4' : value ? 'Cambiar' : 'Subir archivo'}
                </Button>
                {value && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                        <Trash2 />
                        Quitar
                    </Button>
                )}
            </div>
            {kind === 'video' && !value && <p className="text-muted-foreground text-xs">Lo más simple: sube el video a YouTube o Vimeo y pega aquí el enlace. También puedes subir un MP4 de hasta 40 MB.</p>}
            {value && !isLink && (
                <a href={value} target="_blank" rel="noreferrer" className="text-primary w-fit text-xs underline">
                    Abrir el archivo subido
                </a>
            )}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
