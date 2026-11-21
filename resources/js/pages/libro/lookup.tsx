import { CARD, Field, HelpCard, INPUT, LibroHeader, SideCard, SideRow, dateTime, plainDate } from '@/components/libro/ui';
import LibroLayout, { type Shell } from '@/layouts/libro-layout';
import { Link, useForm } from '@inertiajs/react';
import { Check, CircleAlert, CircleCheck, FilePlus, IdCard, Search, Ticket } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface Result {
    code: string;
    type: string;
    status: string;
    overdue: boolean;
    created_at: string;
    due_date: string;
    answered_at: string | null;
    response: string | null;
}

interface Props extends Shell {
    days: number;
    result: Result | null;
}

const STEPS = ['Registrado', 'En revisión', 'Respondido'];

/** Línea de avance: registrado → en revisión → respondido. */
function Progress({ answered }: { answered: boolean }) {
    const current = answered ? 2 : 1;
    return (
        <ol className="grid grid-cols-3">
            {STEPS.map((step, i) => {
                const done = i < current || (answered && i === current);
                const active = !answered && i === current;
                return (
                    <li key={step} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex w-full items-center">
                            <span className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : i <= current ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-surface)]'}`} />
                            <span
                                className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                                    done ? 'bg-[var(--c-primary)] text-[var(--c-on-primary)]' : active ? 'bg-[var(--c-accent)] text-[var(--c-dark)] ring-4 ring-[var(--c-accent)]/30' : 'bg-[var(--c-surface)] text-[var(--c-muted)]'
                                }`}
                            >
                                {done ? <Check className="size-4" aria-hidden /> : i + 1}
                            </span>
                            <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? 'bg-transparent' : i < current ? 'bg-[var(--c-primary)]' : 'bg-[var(--c-surface)]'}`} />
                        </span>
                        <span className={`text-xs font-semibold sm:text-sm ${done || active ? '' : 'text-[var(--c-muted)]'}`}>{step}</span>
                    </li>
                );
            })}
        </ol>
    );
}

export default function LibroLookup({ days, result, ...shell }: Props) {
    const form = useForm({ code: '', doc_number: '' });
    const answered = result?.status === 'answered';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('claims.search'), { preserveScroll: true });
    };

    return (
        <LibroLayout shell={shell} title="Consultar mi reclamo">
            <LibroHeader subtitle="Consulta el estado de tu reclamo o queja." />

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
                <div className="grid min-w-0 gap-6">
                    <section aria-labelledby="consulta" className={CARD}>
                        <header className="flex items-start gap-3 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] px-5 py-4 sm:px-6">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--c-primary)] text-[var(--c-on-primary)]">
                                <Search className="size-4" aria-hidden />
                            </span>
                            <div className="pt-0.5">
                                <h2 id="consulta" className="font-[family-name:var(--font-head)] text-sm font-extrabold uppercase tracking-wide sm:text-base">
                                    Consultar mi reclamo
                                </h2>
                                <p className="mt-1 text-sm text-[var(--c-muted)]">Escribe el número de hoja que recibiste en tu correo y el documento con el que la registraste.</p>
                            </div>
                        </header>
                        <form onSubmit={submit} noValidate className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                            <Field label="Número de hoja" id="code" error={form.errors.code} required>
                                <div className="relative">
                                    <Ticket className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--c-muted)]" aria-hidden />
                                    <input id="code" className={`${INPUT} pl-10`} value={form.data.code} maxLength={20} placeholder="Ej.: 2026-000001" aria-invalid={form.errors.code ? true : undefined} onChange={(e) => form.setData('code', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Número de documento" id="doc_number" error={form.errors.doc_number} required>
                                <div className="relative">
                                    <IdCard className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--c-muted)]" aria-hidden />
                                    <input id="doc_number" className={`${INPUT} pl-10`} value={form.data.doc_number} maxLength={20} placeholder="DNI, CE, pasaporte o RUC" aria-invalid={form.errors.doc_number ? true : undefined} onChange={(e) => form.setData('doc_number', e.target.value)} />
                                </div>
                            </Field>
                            <div className="sm:col-span-2">
                                <button type="submit" disabled={form.processing} className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-primary)] px-6 py-3 text-sm font-bold text-[var(--c-on-primary)] transition hover:brightness-110 disabled:opacity-60">
                                    <Search size={18} aria-hidden />
                                    {form.processing ? 'Buscando…' : 'Consultar'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {result && (
                        <section aria-labelledby="resultado" className={CARD}>
                            <header className="flex flex-col gap-3 border-b border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">{result.type === 'queja' ? 'Queja' : 'Reclamo'}</p>
                                    <h2 id="resultado" className="font-[family-name:var(--font-head)] text-xl font-extrabold">
                                        Hoja N° {result.code}
                                    </h2>
                                </div>
                                <span className={`self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto ${answered ? 'bg-emerald-100 text-emerald-800' : result.overdue ? 'bg-rose-100 text-rose-800' : 'bg-[var(--c-accent)] text-[var(--c-dark)]'}`}>
                                    {answered ? 'Respondido' : result.overdue ? 'Fuera de plazo' : 'Pendiente de respuesta'}
                                </span>
                            </header>
                            <div className="grid gap-6 p-5 sm:p-6">
                                <Progress answered={answered} />
                                <dl className="grid gap-x-8 sm:grid-cols-2">
                                    <SideRow label="Fecha de registro">{dateTime.format(new Date(result.created_at))}</SideRow>
                                    <SideRow label="Fecha límite de respuesta">{plainDate(result.due_date)}</SideRow>
                                    {answered && result.answered_at && <SideRow label="Fecha de respuesta">{dateTime.format(new Date(result.answered_at))}</SideRow>}
                                </dl>
                                {answered ? (
                                    <div className="rounded-xl bg-[var(--c-surface)] p-4 sm:p-5">
                                        <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                                            <CircleCheck className="size-4 text-[#059669]" aria-hidden /> Respuesta del proveedor
                                        </p>
                                        <p className="whitespace-pre-line text-sm">{result.response}</p>
                                    </div>
                                ) : (
                                    <p className="flex gap-3 rounded-xl bg-[var(--c-surface)] p-4 text-sm">
                                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-[var(--c-primary)]" aria-hidden />
                                        Estamos revisando tu caso. Te enviaremos la respuesta al correo que registraste, a más tardar el {plainDate(result.due_date)}.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="grid gap-6 lg:sticky lg:top-6">
                    <SideCard icon={CircleAlert} title="Importante" dark>
                        <ul className="grid gap-3 text-sm opacity-90">
                            <li className="flex gap-2.5">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-[var(--c-accent)]" aria-hidden />
                                <span>
                                    Respondemos en un plazo máximo de <strong>{days} días hábiles</strong>.
                                </span>
                            </li>
                            <li className="flex gap-2.5">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-[var(--c-accent)]" aria-hidden />
                                <span>La respuesta también llega al correo que registraste.</span>
                            </li>
                        </ul>
                        <Link href={route('claims.create')} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--c-accent)] px-4 py-2.5 text-sm font-bold text-[var(--c-dark)] transition hover:brightness-95">
                            <FilePlus className="size-4" aria-hidden /> Registrar un reclamo
                        </Link>
                    </SideCard>
                    <HelpCard contact={shell.contact} />
                </aside>
            </div>
        </LibroLayout>
    );
}
