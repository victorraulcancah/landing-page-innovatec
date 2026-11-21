import { Block, CheckRow, Field, FileDrop, HelpCard, INPUT, LibroHeader, Notice, SideCard, SideRow, addWeekdays, dateOnly, dateTime } from '@/components/libro/ui';
import LibroLayout, { type Shell } from '@/layouts/libro-layout';
import { cleanDoc, cleanName, cleanPhone } from '@/lib/validate';
import { Link, useForm } from '@inertiajs/react';
import { CircleAlert, CircleCheck, ClipboardList, FileText, ImagePlus, Mail, Search, Send, Smartphone, Video } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useEffect, useState } from 'react';

interface Props extends Shell {
    options: { docTypes: Record<string, string>; voucherTypes: Record<string, string>; solutions: Record<string, string> };
    days: number;
}

interface ClaimForm {
    // 1. Consumidor
    name: string;
    doc_type: string;
    doc_number: string;
    phone: string;
    email: string;
    address: string;
    is_minor: boolean;
    guardian_name: string;
    guardian_doc_type: string;
    guardian_doc_number: string;
    // 2. Compra
    voucher_type: string;
    voucher_number: string;
    purchase_date: string;
    contract_number: string;
    product_code: string;
    product_name: string;
    product_brand: string;
    product_model: string;
    good_type: string;
    amount: string;
    good_description: string;
    // 3 y 4. Tipo y detalle
    type: string;
    detail: string;
    expected_solution: string;
    solution_other: string;
    request: string;
    // 5. Adjuntos
    photos: File[];
    voucher_file: File | null;
    video: File | null;
    // 6. Confirmación
    accepted_truth: boolean;
    accepted_privacy: boolean;
    accepted_conforme: boolean;
    website_url: string;
    [key: string]: string | boolean | File | File[] | null;
}

const DOC_HELP: Record<string, string> = { DNI: 'El DNI tiene 8 números.', RUC: 'El RUC tiene 11 números.' };

function WithIcon({ icon: Icon, children }: { icon: typeof Mail; children: ReactNode }) {
    return (
        <div className="relative">
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--c-muted)]" aria-hidden />
            {children}
        </div>
    );
}

function TypeOption({ value, current, onChange, title, text }: { value: string; current: string; onChange: (v: string) => void; title: string; text: string }) {
    const on = current === value;
    return (
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${on ? 'border-[var(--c-primary)] bg-[var(--c-primary)]/8' : 'border-[color-mix(in_srgb,var(--c-text)_14%,transparent)] hover:border-[var(--c-primary)]/50'}`}>
            <input type="radio" name="type" value={value} checked={on} onChange={() => onChange(value)} className="mt-1 size-4 accent-[var(--c-primary)]" />
            <span>
                <span className="block font-bold">{title}</span>
                <span className="block text-sm text-[var(--c-muted)]">{text}</span>
            </span>
        </label>
    );
}

/** Hora actual: se actualiza cada minuto. */
function useNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(t);
    }, []);
    return now;
}

export default function LibroCreate({ options, days, ...shell }: Props) {
    const form = useForm<ClaimForm>({
        name: '', doc_type: 'DNI', doc_number: '', phone: '', email: '', address: '',
        is_minor: false, guardian_name: '', guardian_doc_type: 'DNI', guardian_doc_number: '',
        voucher_type: '', voucher_number: '', purchase_date: '', contract_number: '',
        product_code: '', product_name: '', product_brand: '', product_model: '',
        good_type: 'servicio', amount: '', good_description: '',
        type: 'reclamo', detail: '', expected_solution: '', solution_other: '', request: '',
        photos: [], voucher_file: null, video: null,
        accepted_truth: false, accepted_privacy: false, accepted_conforme: false,
        website_url: '',
    });
    const { data, setData, errors, processing, progress } = form;
    const err = errors as Record<string, string | undefined>;
    const now = useNow();
    const dueDate = addWeekdays(now, days);
    const { provider_name, provider_ruc, provider_address } = shell.footer;
    const photoError = err.photos ?? Object.entries(err).find(([k]) => k.startsWith('photos.'))?.[1];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('claims.store'), { forceFormData: true, onError: () => document.querySelector('[aria-invalid=true], [role=alert]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }) });
    };

    const docs = Object.entries(options.docTypes);
    const ctl = (name: keyof ClaimForm & string) => ({ id: name, value: data[name] as string, 'aria-invalid': err[name] ? (true as const) : undefined });

    return (
        <LibroLayout shell={shell} title="Libro de Reclamaciones">
            <LibroHeader subtitle="Registra tu reclamo o queja y te daremos una respuesta." />

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
                <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-6">
                    {/* 1. Consumidor */}
                    <Block n={1} title="Datos del consumidor" cols="sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Nombres y apellidos" id="name" error={err.name} required className="sm:col-span-2 xl:col-span-1">
                            <input className={INPUT} {...ctl('name')} autoComplete="name" maxLength={150} placeholder="Ej.: Juan Carlos Pérez López" onChange={(e) => setData('name', cleanName(e.target.value))} />
                        </Field>
                        <Field label="Tipo de documento" id="doc_type" error={err.doc_type} required>
                            <select className={INPUT} {...ctl('doc_type')} onChange={(e) => setData((d) => ({ ...d, doc_type: e.target.value, doc_number: cleanDoc(e.target.value, d.doc_number) }))}>
                                {docs.map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Número de documento" id="doc_number" error={err.doc_number} required hint={DOC_HELP[data.doc_type]}>
                            <input className={INPUT} {...ctl('doc_number')} inputMode={data.doc_type === 'DNI' || data.doc_type === 'RUC' ? 'numeric' : 'text'} placeholder={data.doc_type === 'DNI' ? 'Ej.: 12345678' : undefined} onChange={(e) => setData('doc_number', cleanDoc(data.doc_type, e.target.value))} />
                        </Field>
                        <Field label="Celular" id="phone" error={err.phone} required hint="9 números, empieza con 9.">
                            <WithIcon icon={Smartphone}>
                                <input className={`${INPUT} pl-10`} {...ctl('phone')} type="tel" inputMode="numeric" maxLength={9} autoComplete="tel" placeholder="Ej.: 987654321" onChange={(e) => setData('phone', cleanPhone(e.target.value))} />
                            </WithIcon>
                        </Field>
                        <Field label="Correo electrónico" id="email" error={err.email} required hint="Aquí te enviaremos la copia y la respuesta.">
                            <WithIcon icon={Mail}>
                                <input className={`${INPUT} pl-10`} {...ctl('email')} type="email" autoComplete="email" maxLength={150} placeholder="correo@ejemplo.com" onChange={(e) => setData('email', e.target.value)} />
                            </WithIcon>
                        </Field>
                        <Field label="Dirección" id="address" error={err.address} required className="sm:col-span-2 xl:col-span-1">
                            <input className={INPUT} {...ctl('address')} autoComplete="street-address" maxLength={255} placeholder="Ej.: Av. Javier Prado Este 1166, San Isidro" onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                        <CheckRow id="is_minor" checked={data.is_minor} onChange={(v) => setData('is_minor', v)} className="sm:col-span-2 xl:col-span-3">
                            El consumidor es menor de edad (se piden los datos del apoderado)
                        </CheckRow>
                        {data.is_minor && (
                            <div className="grid gap-5 rounded-xl bg-[var(--c-surface)] p-4 sm:col-span-2 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
                                <Field label="Nombre del padre, madre o apoderado" id="guardian_name" error={err.guardian_name} required className="sm:col-span-2 xl:col-span-1">
                                    <input className={INPUT} {...ctl('guardian_name')} maxLength={150} onChange={(e) => setData('guardian_name', cleanName(e.target.value))} />
                                </Field>
                                <Field label="Tipo de documento" id="guardian_doc_type" error={err.guardian_doc_type} required>
                                    <select className={INPUT} {...ctl('guardian_doc_type')} onChange={(e) => setData((d) => ({ ...d, guardian_doc_type: e.target.value, guardian_doc_number: cleanDoc(e.target.value, d.guardian_doc_number) }))}>
                                        {docs.map(([k, v]) => (
                                            <option key={k} value={k}>
                                                {v}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Número de documento" id="guardian_doc_number" error={err.guardian_doc_number} required hint={DOC_HELP[data.guardian_doc_type]}>
                                    <input className={INPUT} {...ctl('guardian_doc_number')} onChange={(e) => setData('guardian_doc_number', cleanDoc(data.guardian_doc_type, e.target.value))} />
                                </Field>
                            </div>
                        )}
                    </Block>

                    {/* 2. Compra */}
                    <Block n={2} title="Información de la compra" description="Completa lo que tengas a la mano; solo lo marcado con * es obligatorio." cols="sm:grid-cols-2 xl:grid-cols-3">
                        <Field label="Tipo de comprobante" id="voucher_type" error={err.voucher_type}>
                            <select className={INPUT} {...ctl('voucher_type')} onChange={(e) => setData('voucher_type', e.target.value)}>
                                <option value="">Seleccionar</option>
                                {Object.entries(options.voucherTypes).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Número de comprobante" id="voucher_number" error={err.voucher_number}>
                            <input className={INPUT} {...ctl('voucher_number')} maxLength={30} placeholder="Ej.: F001-00012345" onChange={(e) => setData('voucher_number', e.target.value)} />
                        </Field>
                        <Field label="Fecha de compra" id="purchase_date" error={err.purchase_date}>
                            <input className={INPUT} {...ctl('purchase_date')} type="date" max={new Date().toISOString().slice(0, 10)} onChange={(e) => setData('purchase_date', e.target.value)} />
                        </Field>
                        <Field label="N° de contrato o de propuesta" id="contract_number" error={err.contract_number}>
                            <input className={INPUT} {...ctl('contract_number')} maxLength={30} placeholder="Ej.: UCO-000123" onChange={(e) => setData('contract_number', e.target.value)} />
                        </Field>
                        <Field label="Código del producto o equipo" id="product_code" error={err.product_code}>
                            <input className={INPUT} {...ctl('product_code')} maxLength={50} placeholder="Ej.: serie o código de inventario" onChange={(e) => setData('product_code', e.target.value)} />
                        </Field>
                        <Field label="Nombre del producto" id="product_name" error={err.product_name}>
                            <input className={INPUT} {...ctl('product_name')} maxLength={150} placeholder="Ej.: Servidor / Firewall" onChange={(e) => setData('product_name', e.target.value)} />
                        </Field>
                        <Field label="Marca" id="product_brand" error={err.product_brand}>
                            <input className={INPUT} {...ctl('product_brand')} maxLength={80} onChange={(e) => setData('product_brand', e.target.value)} />
                        </Field>
                        <Field label="Modelo" id="product_model" error={err.product_model}>
                            <input className={INPUT} {...ctl('product_model')} maxLength={80} onChange={(e) => setData('product_model', e.target.value)} />
                        </Field>
                        <Field label="Tipo de bien" id="good_type" error={err.good_type} required>
                            <select className={INPUT} {...ctl('good_type')} onChange={(e) => setData('good_type', e.target.value)}>
                                <option value="servicio">Servicio</option>
                                <option value="producto">Producto</option>
                            </select>
                        </Field>
                        <Field label="Monto reclamado (S/)" id="amount" error={err.amount} required>
                            <input className={INPUT} {...ctl('amount')} type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00" onChange={(e) => setData('amount', e.target.value)} />
                        </Field>
                        <Field label="Descripción del producto o servicio" id="good_description" error={err.good_description} required className="sm:col-span-2">
                            <textarea className={INPUT} {...ctl('good_description')} rows={2} maxLength={1000} placeholder="Describe brevemente qué contrataste o compraste" onChange={(e) => setData('good_description', e.target.value)} />
                        </Field>
                    </Block>

                    {/* 3. Tipo de registro */}
                    <Block n={3} title="Tipo de registro">
                        <TypeOption value="reclamo" current={data.type} onChange={(v) => setData('type', v)} title="Reclamo" text="Disconformidad relacionada con el producto o servicio." />
                        <TypeOption value="queja" current={data.type} onChange={(v) => setData('type', v)} title="Queja" text="Disconformidad relacionada con la atención recibida." />
                        {err.type && <p className="text-sm font-semibold text-[#be123c] sm:col-span-2">{err.type}</p>}
                    </Block>

                    {/* 4. Detalle */}
                    <Block n={4} title="Detalle">
                        <Field label="Detalle del reclamo o queja" id="detail" error={err.detail} required hint="Mínimo 20 caracteres." className="sm:col-span-2">
                            <textarea className={INPUT} {...ctl('detail')} rows={5} maxLength={3000} placeholder="Describe aquí tu reclamo o queja con el mayor detalle posible…" onChange={(e) => setData('detail', e.target.value)} />
                        </Field>
                        <Field label="¿Qué solución esperas?" id="expected_solution" error={err.expected_solution}>
                            <select className={INPUT} {...ctl('expected_solution')} onChange={(e) => setData('expected_solution', e.target.value)}>
                                <option value="">Seleccionar solución esperada</option>
                                {Object.entries(options.solutions).map(([k, v]) => (
                                    <option key={k} value={k}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        {data.expected_solution === 'otra' ? (
                            <Field label="Otra solución (especifica)" id="solution_other" error={err.solution_other} required>
                                <input className={INPUT} {...ctl('solution_other')} maxLength={255} placeholder="Escribe aquí la solución que esperas" onChange={(e) => setData('solution_other', e.target.value)} />
                            </Field>
                        ) : (
                            <div className="hidden sm:block" />
                        )}
                        <Field label="Pedido concreto del consumidor" id="request" error={err.request} required hint="Mínimo 10 caracteres." className="sm:col-span-2">
                            <textarea className={INPUT} {...ctl('request')} rows={3} maxLength={2000} placeholder="Indica qué solicitas a la empresa" onChange={(e) => setData('request', e.target.value)} />
                        </Field>
                    </Block>

                    {/* 5. Adjuntos */}
                    <Block n={5} title="Información adicional" optional description="Puedes adjuntar archivos que nos ayuden a entender mejor tu caso." cols="sm:grid-cols-3">
                        <FileDrop id="photos" icon={ImagePlus} title="Adjuntar fotografías" formats="JPG, PNG (máx. 5 MB c/u, hasta 5)" accept="image/jpeg,image/png" maxMb={5} multiple max={5} files={data.photos} onChange={(f) => setData('photos', f)} error={photoError} />
                        <FileDrop id="voucher_file" icon={FileText} title="Adjuntar factura" formats="PDF, JPG, PNG (máx. 5 MB)" accept="application/pdf,image/jpeg,image/png" maxMb={5} files={data.voucher_file ? [data.voucher_file] : []} onChange={(f) => setData('voucher_file', f[0] ?? null)} error={err.voucher_file} />
                        <FileDrop id="video" icon={Video} title="Adjuntar video" formats="MP4 (máx. 20 MB)" accept="video/mp4" maxMb={20} files={data.video ? [data.video] : []} onChange={(f) => setData('video', f[0] ?? null)} error={err.video} />
                    </Block>

                    {/* 6. Confirmación */}
                    <Block n={6} title="Confirmación" cols="grid-cols-1">
                        <div className="grid gap-3">
                            <CheckRow id="accepted_truth" checked={data.accepted_truth} onChange={(v) => setData('accepted_truth', v)} error={err.accepted_truth}>
                                Declaro que la información proporcionada es verdadera.
                            </CheckRow>
                            <CheckRow id="accepted_privacy" checked={data.accepted_privacy} onChange={(v) => setData('accepted_privacy', v)} error={err.accepted_privacy}>
                                Acepto el tratamiento de mis datos personales de acuerdo con la Ley de Protección de Datos Personales.
                            </CheckRow>
                            <CheckRow id="accepted_conforme" checked={data.accepted_conforme} onChange={(v) => setData('accepted_conforme', v)} error={err.accepted_conforme}>
                                He leído y estoy conforme con el contenido de mi reclamo.
                            </CheckRow>
                        </div>

                        <Notice>
                            La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá responder en un plazo no mayor a {days} días hábiles.
                        </Notice>

                        {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
                        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                            <label>
                                No llenar este campo
                                <input type="text" tabIndex={-1} autoComplete="off" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)} />
                            </label>
                        </div>

                        <div className="grid gap-3 border-t border-[color-mix(in_srgb,var(--c-text)_10%,transparent)] pt-5">
                            {Object.keys(errors).length > 0 && (
                                <p role="alert" className="text-sm font-semibold text-[#be123c]">
                                    Revisa los campos marcados en rojo.
                                </p>
                            )}
                            {progress && (
                                <div className="h-2 overflow-hidden rounded-full bg-[var(--c-surface)]" role="progressbar" aria-valuenow={progress.percentage ?? 0} aria-valuemin={0} aria-valuemax={100}>
                                    <div className="h-full bg-[var(--c-primary)] transition-all" style={{ width: `${progress.percentage ?? 0}%` }} />
                                </div>
                            )}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[var(--c-muted)]">
                                    Los campos con <span className="text-[#e11d48]">*</span> son obligatorios.
                                </p>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--r-btn)] bg-[var(--c-primary)] px-7 py-3.5 font-[family-name:var(--font-head)] text-sm font-bold text-[var(--c-on-primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send size={18} aria-hidden />
                                    {processing ? (progress ? `Subiendo archivos… ${progress.percentage ?? 0}%` : 'Enviando…') : 'Enviar hoja de reclamación'}
                                </button>
                            </div>
                        </div>
                    </Block>
                </form>

                <aside className="grid gap-6 lg:self-stretch">
                    <SideCard icon={ClipboardList} title="Información automática">
                        <dl>
                            <SideRow label="N.º de reclamación">
                                <span className="font-medium italic text-[var(--c-muted)]">Se asigna al enviar</span>
                            </SideRow>
                            <SideRow label="Fecha y hora">{dateTime.format(now)}</SideRow>
                            <SideRow label="Canal">Web · {typeof window !== 'undefined' ? window.location.host : ''}</SideRow>
                            <SideRow label="Estado">
                                <span className="rounded-full bg-[var(--c-accent)] px-2.5 py-0.5 text-xs font-bold text-[var(--c-dark)]">Pendiente</span>
                            </SideRow>
                            <SideRow label="Fecha límite de respuesta">
                                {days} días hábiles
                                <span className="block text-xs font-normal text-[var(--c-muted)]">hasta el {dateOnly.format(dueDate)}</span>
                            </SideRow>
                        </dl>
                        {(provider_name || provider_ruc || provider_address) && (
                            <div className="mt-4 rounded-xl bg-[var(--c-surface)] p-4 text-sm">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--c-muted)]">Proveedor</p>
                                {provider_name && <p className="font-semibold">{provider_name}</p>}
                                {provider_ruc && <p className="text-[var(--c-muted)]">RUC {provider_ruc}</p>}
                                {provider_address && <p className="text-[var(--c-muted)]">{provider_address}</p>}
                            </div>
                        )}
                    </SideCard>

                    <div className="grid gap-6 lg:sticky lg:top-6">
                        <SideCard icon={CircleAlert} title="Importante" dark>
                            <ul className="grid gap-3 text-sm opacity-90">
                                {[
                                    <>
                                        Tu reclamo será atendido en un plazo máximo de <strong>{days} días hábiles</strong>.
                                    </>,
                                    'Recibirás una copia de tu hoja y la respuesta en tu correo electrónico.',
                                    'Puedes hacer seguimiento con tu número de reclamación y tu documento.',
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-2.5">
                                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-[var(--c-accent)]" aria-hidden />
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href={route('claims.lookup')} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--c-accent)] px-4 py-2.5 text-sm font-bold text-[var(--c-dark)] transition hover:brightness-95">
                                <Search className="size-4" aria-hidden /> Consultar mi reclamo
                            </Link>
                        </SideCard>
                        <HelpCard contact={shell.contact} />
                    </div>
                </aside>
            </div>
        </LibroLayout>
    );
}
