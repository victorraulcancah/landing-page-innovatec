import { useColorTokens } from '@/components/admin/color-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MARKS, TONES, toRichHtml, type RichColor } from '@/lib/rich';
import { cn } from '@/lib/utils';
import { Mark } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlignCenter, AlignLeft, AlignRight, Bold, Eraser, Highlighter, Italic, Link2, List, ListOrdered, Palette, Redo2, Strikethrough, Underline, Undo2, Unlink } from 'lucide-react';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

/** Marca que guarda el color de texto como clase del tema (`t-accent`), no como valor fijo. */
const classMark = (name: string, prefix: string) =>
    Mark.create({
        name,
        addAttributes() {
            return {
                color: {
                    default: null,
                    parseHTML: (el) =>
                        [...el.classList].find((c) => c.startsWith(prefix))?.slice(prefix.length) ?? null,
                    renderHTML: (attrs) => (attrs.color ? { class: `${prefix}${attrs.color}` } : {}),
                },
            };
        },
        parseHTML() {
            return [{ tag: 'span', getAttrs: (el) => ([...(el as HTMLElement).classList].some((c) => c.startsWith(prefix)) ? null : false) }];
        },
        renderHTML({ HTMLAttributes }) {
            return ['span', HTMLAttributes, 0];
        },
    });

const Tone = classMark('tone', 't-');
const Highlight = classMark('highlight', 'm-');

/** Un titular es un solo párrafo: sin Enter que cree otros. */
const InlineDocument = Document.extend({ content: 'paragraph' });

const FALLBACK_THEME: Record<string, string> = { primary: '#1c53ee', accent: '#ff9c34', dark: '#161443', muted: '#334155', surface: '#e8f9ff', on_dark: '#ffffff' };

/** https:// por defecto; correo y teléfono se reconocen solos; # y / quedan como están. */
function normalizeHref(input: string): string {
    const v = input.trim();
    if (!v) return '';
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(v)) return `mailto:${v}`;
    if (/^\+?[\d\s().-]{6,}$/.test(v)) return `tel:${v.replace(/[^\d+]/g, '')}`;
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(v)) return v;
    return `https://${v}`;
}

interface RichTextFieldProps {
    label: string;
    value: string;
    onChange: (html: string) => void;
    /** true = una sola línea con formato en línea (titulares). */
    inline?: boolean;
}

type Panel = 'color' | 'highlight' | 'link' | null;

export function RichTextField({ label, value, onChange, inline = false }: RichTextFieldProps) {
    const id = useId();
    const tokens = useColorTokens();
    const palette = { ...FALLBACK_THEME, ...(tokens?.theme ?? {}) };
    const [panel, setPanel] = useState<Panel>(null);
    const [href, setHref] = useState('');
    const emitted = useRef(value);

    const editor = useEditor({
        shouldRerenderOnTransaction: true,
        content: toRichHtml(value, inline),
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                code: false,
                codeBlock: false,
                horizontalRule: false,
                ...(inline
                    ? { document: false, bulletList: false, orderedList: false, listItem: false, listKeymap: false, link: false }
                    : { link: { openOnClick: false, autolink: false, HTMLAttributes: { rel: 'noopener noreferrer', target: null } } }),
            }),
            ...(inline ? [InlineDocument] : [TextAlign.configure({ types: ['paragraph'] })]),
            Tone,
            Highlight,
        ],
        editorProps: {
            attributes: { id, role: 'textbox', 'aria-multiline': inline ? 'false' : 'true', 'aria-label': label },
        },
        onUpdate: ({ editor: ed }) => {
            let html = ed.isEmpty ? '' : ed.getHTML();
            if (inline) html = html.replace(/^<p[^>]*>([\s\S]*)<\/p>$/, '$1');
            emitted.current = html;
            onChange(html);
        },
    });

    // Si el valor cambia desde fuera (p. ej. se reordena una lista), el editor lo sigue.
    useEffect(() => {
        if (!editor || value === emitted.current) return;
        emitted.current = value;
        editor.commands.setContent(toRichHtml(value, inline), { emitUpdate: false });
    }, [value, editor, inline]);

    if (!editor) return <div className="min-h-24 rounded-md border border-input" aria-hidden />;

    const run = () => editor.chain().focus();
    const swatch = (c: RichColor) => palette[c.token] ?? '#ffffff';

    const openLink = () => {
        setHref((editor.getAttributes('link').href as string | undefined) ?? '');
        setPanel(panel === 'link' ? null : 'link');
    };
    const applyLink = () => {
        const url = normalizeHref(href);
        if (!url) run().unsetLink().run();
        else run().extendMarkRange('link').setLink({ href: url, target: /^https?:/i.test(url) ? '_blank' : null }).run();
        setPanel(null);
    };

    const tool = (name: string, icon: ReactNode, active: boolean, action: () => void, disabled = false) => (
        <button
            type="button"
            key={name}
            title={name}
            aria-label={name}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={action}
            className={cn(
                'flex size-8 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-40',
                active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground',
            )}
        >
            {icon}
        </button>
    );
    const divider = (k: string) => <span key={k} aria-hidden className="bg-border mx-0.5 h-5 w-px" />;

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id} onClick={() => editor.commands.focus()}>
                {label}
            </Label>
            <div className="rich-editor border-input focus-within:border-ring focus-within:ring-ring/50 overflow-hidden rounded-md border focus-within:ring-[3px]" style={Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--c-${k.replace('_', '-')}`, v]))}>
                <div role="toolbar" aria-label={`Formato de ${label}`} className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b border-input p-1">
                    {tool('Negrita', <Bold className="size-4" />, editor.isActive('bold'), () => run().toggleBold().run())}
                    {tool('Cursiva', <Italic className="size-4" />, editor.isActive('italic'), () => run().toggleItalic().run())}
                    {tool('Subrayado', <Underline className="size-4" />, editor.isActive('underline'), () => run().toggleUnderline().run())}
                    {tool('Tachado', <Strikethrough className="size-4" />, editor.isActive('strike'), () => run().toggleStrike().run())}
                    {divider('d1')}
                    {tool('Color del texto', <Palette className="size-4" />, panel === 'color' || editor.isActive('tone'), () => setPanel(panel === 'color' ? null : 'color'))}
                    {tool('Resaltado', <Highlighter className="size-4" />, panel === 'highlight' || editor.isActive('highlight'), () => setPanel(panel === 'highlight' ? null : 'highlight'))}
                    {!inline && (
                        <>
                            {divider('d2')}
                            {tool('Lista con viñetas', <List className="size-4" />, editor.isActive('bulletList'), () => run().toggleBulletList().run())}
                            {tool('Lista numerada', <ListOrdered className="size-4" />, editor.isActive('orderedList'), () => run().toggleOrderedList().run())}
                            {divider('d3')}
                            {tool('Alinear a la izquierda', <AlignLeft className="size-4" />, editor.isActive({ textAlign: 'left' }), () => run().setTextAlign('left').run())}
                            {tool('Centrar', <AlignCenter className="size-4" />, editor.isActive({ textAlign: 'center' }), () => run().setTextAlign('center').run())}
                            {tool('Alinear a la derecha', <AlignRight className="size-4" />, editor.isActive({ textAlign: 'right' }), () => run().setTextAlign('right').run())}
                            {divider('d4')}
                            {tool('Enlace', <Link2 className="size-4" />, panel === 'link' || editor.isActive('link'), openLink)}
                            {tool('Quitar enlace', <Unlink className="size-4" />, false, () => run().unsetLink().run(), !editor.isActive('link'))}
                        </>
                    )}
                    {divider('d5')}
                    {tool('Quitar formato', <Eraser className="size-4" />, false, () => run().unsetAllMarks().clearNodes().run())}
                    {tool('Deshacer', <Undo2 className="size-4" />, false, () => run().undo().run(), !editor.can().undo())}
                    {tool('Rehacer', <Redo2 className="size-4" />, false, () => run().redo().run(), !editor.can().redo())}
                </div>

                {(panel === 'color' || panel === 'highlight') && (
                    <div role="group" aria-label={panel === 'color' ? 'Color del texto' : 'Color de resaltado'} className="flex flex-wrap items-center gap-2 border-b border-input p-2">
                        {(panel === 'color' ? TONES : MARKS).map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                title={c.label}
                                aria-label={c.label}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    const mark = panel === 'color' ? 'tone' : 'highlight';
                                    run().setMark(mark, { color: c.key }).run();
                                    setPanel(null);
                                }}
                                className="size-7 rounded-full border border-input ring-offset-2 hover:ring-2 hover:ring-ring"
                                style={{ backgroundColor: swatch(c) }}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                run().unsetMark(panel === 'color' ? 'tone' : 'highlight').run();
                                setPanel(null);
                            }}
                        >
                            Quitar
                        </Button>
                        <span className="text-muted-foreground text-xs">Son los colores del tema: si cambias la paleta, cambian también.</span>
                    </div>
                )}

                {panel === 'link' && (
                    <form
                        className="flex flex-wrap items-center gap-2 border-b border-input p-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyLink();
                        }}
                    >
                        <Input aria-label="Dirección del enlace" value={href} onChange={(e) => setHref(e.target.value)} placeholder="uco360.pe, correo, teléfono o #contacto" className="h-8 min-w-48 flex-1" autoFocus />
                        <Button type="submit" size="sm">
                            Aplicar
                        </Button>
                    </form>
                )}

                <EditorContent editor={editor} className={cn('rich-editor__area', inline && 'rich-editor__area--inline')} />
            </div>
        </div>
    );
}
