import { useRef, type PointerEvent } from 'react';
import { content } from './content';
import { LeadForm } from './components/LeadForm';
import { Curtain, Hexes, Magnetic, PageRail, sections, tiltLeave, tiltMove, useActiveSection } from './components/Chrome';
import { InView, SplitText, trackPointer } from './components/Motion';
import { NetworkMesh } from './components/NetworkMesh';
import { Reveal, shell } from './components/Reveal';
import { useCountUp, useInView, useReducedMotion, useScrollProgress } from './hooks';
import { useEffect, useState } from 'react';

const pill =
    'btn-shine inline-flex min-h-12 items-center gap-3 rounded-full border px-8 text-sm font-medium transition-colors duration-200';

function Arrow() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Titular que se "transmite" palabra por palabra al entrar en pantalla. */
function Heading({ text, className = '' }: { text: string; className?: string }) {
    return (
        <InView as="div" threshold={0.5}>
            <h2
                className={`font-display text-[clamp(1.35rem,2.9vw,2.4rem)] leading-[1.15] uppercase text-balance text-white ${className}`}
            >
                <SplitText text={text} />
            </h2>
            <span className="signal-line mt-5 block h-px w-24 bg-signal" />
        </InView>
    );
}

function Check({ index }: { index: number }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="draw-check mt-1 shrink-0 text-signal"
            style={{ ['--i' as string]: index }}
        >
            <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const bar = useRef<HTMLDivElement>(null);
    const active = useActiveSection();
    const links = sections.filter((section) => section.nav !== false);

    useScrollProgress(bar);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter] duration-300 ${
                scrolled || open ? 'bg-night/90 backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            <div className={`${shell} flex h-[76px] items-center justify-between gap-6`}>
                <a href="#inicio" aria-label={content.brand.name} className="animate-fade">
                    <img src={content.brand.logo} alt={content.brand.name} className="h-8 w-auto sm:h-9" />
                </a>
                <nav
                    aria-label="Principal"
                    className="animate-fade flex items-center gap-5 text-sm xl:gap-7"
                    style={{ ['--delay' as string]: '200ms' }}
                >
                    {links.map((link) => (
                        <a
                            key={link.id}
                            href={`#${link.id}`}
                            aria-current={active === link.id ? 'location' : undefined}
                            className={`nav-link hidden whitespace-nowrap transition-colors hover:text-white lg:inline ${
                                active === link.id ? 'is-active text-white' : 'text-white/70'
                            }`}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#contacto"
                        className="btn-shine inline-flex min-h-10 items-center rounded-full border border-white/80 px-5 font-medium text-white transition-colors hover:bg-white hover:text-night"
                    >
                        Contáctanos
                    </a>
                    <button
                        type="button"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={open}
                        aria-controls="menu-movil"
                        onClick={() => setOpen((v) => !v)}
                        className="relative flex size-10 items-center justify-center rounded-full border border-white/30 text-white lg:hidden"
                    >
                        <span
                            className={`absolute h-px w-4 bg-current transition-transform duration-300 ease-out-expo ${
                                open ? 'rotate-45' : '-translate-y-1'
                            }`}
                        />
                        <span
                            className={`absolute h-px w-4 bg-current transition-transform duration-300 ease-out-expo ${
                                open ? '-rotate-45' : 'translate-y-1'
                            }`}
                        />
                    </button>
                </nav>
            </div>
            {open && (
                <div id="menu-movil" className="menu-drop absolute inset-x-0 top-full border-t border-white/10 bg-night lg:hidden">
                    <ul className={`${shell} py-3`}>
                        {links.map((link) => (
                            <li key={link.id}>
                                <a
                                    href={`#${link.id}`}
                                    onClick={() => setOpen(false)}
                                    aria-current={active === link.id ? 'location' : undefined}
                                    className={`flex min-h-12 items-center justify-between border-b border-white/10 text-base ${
                                        active === link.id ? 'text-signal' : 'text-white/85'
                                    }`}
                                >
                                    {link.label}
                                    {active === link.id && <span className="size-1.5 rounded-full bg-signal" />}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div
                ref={bar}
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal"
            />
        </header>
    );
}

function Hero() {
    const reduced = useReducedMotion();
    const glow = useRef<HTMLDivElement>(null);

    const follow = (e: PointerEvent<HTMLElement>) => {
        if (!glow.current || reduced) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();

        glow.current.style.setProperty('--gx', `${e.clientX - rect.left}px`);
        glow.current.style.setProperty('--gy', `${e.clientY - rect.top}px`);
    };

    return (
        <section
            onPointerMove={follow}
            id="inicio"
            className="relative isolate overflow-hidden bg-night pb-24 pt-32 lg:pb-32 lg:pt-40"
        >
            <div className="aurora absolute -inset-[12%] -z-20 bg-[radial-gradient(ellipse_60%_70%_at_75%_30%,#0b2f78_0%,#071a45_42%,#050b1a_78%)]" />
            <div className="animate-fade absolute inset-0 -z-10 opacity-70" style={{ ['--delay' as string]: '1000ms' }}>
                <NetworkMesh animate={!reduced} />
            </div>
            <div
                ref={glow}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(420px_circle_at_var(--gx,75%)_var(--gy,35%),rgba(6,194,240,0.14),transparent_70%)]"
            />
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,11,26,0.5)_0%,rgba(5,11,26,0.15)_40%,#050b1a_100%)]"
                aria-hidden="true"
            />

            <div className={`${shell} hero-exit grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] xl:gap-16`}>
                <div>
                    <h1 className="split-load font-display text-[clamp(1.1rem,2.25vw,2.5rem)] leading-[1.18] uppercase text-white">
                        <SplitText text={content.hero.title} base={1050} />
                    </h1>
                    <span className="signal-load mt-7 block h-px w-32 bg-signal [animation-delay:1.8s]" />
                    <p
                        className="animate-rise mt-7 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg"
                        style={{ ['--delay' as string]: '1800ms' }}
                    >
                        {content.hero.text}
                    </p>
                    <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ ['--delay' as string]: '1950ms' }}>
                        <Magnetic>
                            <a href="#contacto" className={`${pill} btn-arrow border-signal bg-signal text-night hover:border-white hover:bg-white`}>
                                {content.hero.primaryCta}
                                <Arrow />
                            </a>
                        </Magnetic>
                        <a href="#servicios" className={`${pill} border-white/70 text-white hover:border-white hover:bg-white hover:text-night`}>
                            {content.hero.secondaryCta}
                        </a>
                    </div>
                </div>

                <div
                    id="contacto"
                    className="animate-rise border border-white/15 bg-night/70 p-6 backdrop-blur-sm sm:p-8"
                    style={{ ['--delay' as string]: '1600ms' }}
                >
                    <h2 className="font-display text-lg uppercase leading-snug text-white">{content.form.title}</h2>
                    <p className="mb-6 mt-3 text-sm leading-relaxed text-white/70">{content.form.text}</p>
                    <LeadForm />
                </div>
            </div>

            <a
                href="#partner"
                aria-label="Bajar a la siguiente sección"
                className="animate-fade absolute bottom-6 left-1/2 hidden h-12 w-px -translate-x-1/2 overflow-hidden bg-white/20 lg:block"
                style={{ ['--delay' as string]: '2500ms' }}
            >
                <span className="scroll-cue block h-4 w-px bg-signal" />
            </a>
        </section>
    );
}

function Partner() {
    return (
        <section id="partner" className="relative isolate bg-night py-20 lg:py-28">
            <Hexes />
            <InView className={`${shell} grid items-center gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20`}>
                <div className="relative">
                    <span className="hud-corner tl" />
                    <span className="hud-corner tr" />
                    <span className="hud-corner bl" />
                    <span className="hud-corner br" />
                    <div className="unveil scan overflow-hidden">
                        <img src={content.partner.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    </div>
                </div>
                <div>
                    <Heading text={content.partner.title} />
                    <Reveal delay={250}>
                        <p className="mt-7 max-w-[60ch] text-base leading-[1.8] text-white/75 sm:text-lg">
                            {content.partner.text}
                        </p>
                    </Reveal>
                </div>
            </InView>
        </section>
    );
}

function ServiceCard({ service, index }: { service: (typeof content.services.items)[number]; index: number }) {
    const [ref, seen] = useInView<HTMLElement>(0.3);

    return (
        <article
            ref={ref}
            onPointerMove={(e) => {
                trackPointer(e);
                tiltMove(e);
            }}
            onPointerLeave={tiltLeave}
            className={`spotlight tilt flex h-full flex-col overflow-hidden border border-white/15 bg-night ${
                seen ? 'is-in' : ''
            }`}
            style={{ ['--delay' as string]: `${index * 90}ms` }}
        >
            <div className="scan overflow-hidden">
                <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    className="parallax aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out-expo"
                />
            </div>
            <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-base uppercase leading-snug text-white sm:text-lg">{service.title}</h3>
                <ul className="mt-6 space-y-3 text-sm leading-relaxed text-white/80">
                    {service.points.map((point, k) => (
                        <li key={point} className="flex gap-3">
                            <Check index={k} />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

function Services() {
    return (
        <section id="servicios" className="bg-night-2 py-20 lg:py-28">
            <div className={shell}>
                <Heading text={content.services.title} />
                <ul className="mt-12 grid gap-4 lg:grid-cols-3">
                    {content.services.items.map((service, i) => (
                        <li key={service.title}>
                            <Reveal delay={i * 110} className="h-full">
                                <ServiceCard service={service} index={i} />
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Values() {
    return (
        <section id="valores" className="relative isolate bg-night py-20 lg:py-28">
            <Hexes />
            <div className={shell}>
                <div className="mx-auto flex max-w-[56ch] flex-col items-center text-center">
                    <Heading text={content.values.title} />
                    <Reveal delay={200}>
                        <p className="mt-5 text-base leading-relaxed text-white/70">{content.values.text}</p>
                    </Reveal>
                </div>
                <ul className="mt-14 grid gap-px overflow-hidden bg-white/15 md:grid-cols-3">
                    {content.values.items.map((item, i) => (
                        <li key={item.title} onPointerMove={trackPointer} className="spotlight bg-night p-8">
                            <Reveal delay={i * 110}>
                                <h3 className="font-display text-base uppercase text-signal">{item.title}</h3>
                                <p className="mt-4 text-[15px] leading-relaxed text-white/75">{item.text}</p>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function StatRow({ stat, index }: { stat: (typeof content.stats.items)[number]; index: number }) {
    const [ref, seen] = useInView<HTMLLIElement>(0.5);
    const value = useCountUp(stat.value, seen, 1500 + index * 150);

    return (
        <li
            ref={ref}
            className={`relative grid items-baseline gap-x-10 gap-y-3 border-t border-white/15 py-8 transition-[opacity,transform] duration-700 ease-out-expo md:grid-cols-[minmax(0,320px)_1fr] ${
                seen ? 'is-in translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 90}ms` }}
        >
            <span aria-hidden="true" className="stat-bar absolute -top-px left-0 h-px w-full bg-signal" />
            <div>
                <p className="font-display text-[clamp(2rem,4.5vw,3.6rem)] leading-none text-white">
                    <span className="text-signal">{stat.prefix}</span>
                    <span className="tabular-nums">{value}</span>
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/70">{stat.unit}</p>
            </div>
            <p className="max-w-[60ch] text-base leading-relaxed text-white/75">{stat.text}</p>
        </li>
    );
}

function Stats() {
    return (
        <section id="cifras" className="bg-night-2 py-20 lg:py-28">
            <div className={shell}>
                <Heading text={content.stats.title} />
                <ul className="mt-12 border-b border-white/15">
                    {content.stats.items.map((stat, i) => (
                        <StatRow key={stat.unit} stat={stat} index={i} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function CertTile({ cert, hidden = false }: { cert: { name: string; image: string }; hidden?: boolean }) {
    return (
        <li aria-hidden={hidden || undefined} className="mr-3 shrink-0">
            <figure className="flex size-28 items-center justify-center rounded-md bg-white p-3">
                <img src={cert.image} alt={hidden ? '' : cert.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            </figure>
        </li>
    );
}

function Experience() {
    const { experience } = content;

    return (
        <section id="experiencia" className="relative isolate overflow-hidden bg-night py-20 lg:py-28">
            <div className={shell}>
                <InView className="max-w-[760px]">
                    <Heading text={experience.title} />
                    <Reveal delay={200}>
                        <h3 className="mt-8 font-display text-base uppercase text-signal">{experience.client}</h3>
                        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-white/75">{experience.text}</p>
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {experience.technologies.map((tech) => (
                                <li key={tech} className="rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80">
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </InView>
            </div>

            <div className="mt-16">
                <p className={`${shell} mb-5 text-sm text-white/60`}>{experience.certificationsTitle}</p>
                <div className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <ul className="marquee-track">
                        {experience.certifications.map((cert) => (
                            <CertTile key={cert.name} cert={cert} />
                        ))}
                        {experience.certifications.map((cert) => (
                            <CertTile key={`${cert.name}-copy`} cert={cert} hidden />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function BrandTile({ brand, hidden = false }: { brand: { name: string; image: string }; hidden?: boolean }) {
    return (
        <li aria-hidden={hidden || undefined} className="mr-3 shrink-0">
            <figure className="flex h-20 w-40 items-center justify-center rounded-md bg-white px-4">
                <img
                    src={brand.image}
                    alt={hidden ? '' : brand.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                />
            </figure>
        </li>
    );
}

function Brands() {
    return (
        <section id="marcas" className="bg-night-2 py-20 lg:py-24">
            <div className={shell}>
                <Heading text={content.brands.title} />
            </div>
            <div className="marquee marquee-reverse mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <ul className="marquee-track">
                    {content.brands.items.map((brand) => (
                        <BrandTile key={brand.name} brand={brand} />
                    ))}
                    {content.brands.items.map((brand) => (
                        <BrandTile key={`${brand.name}-copy`} brand={brand} hidden />
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Closing() {
    return (
        <section className="bg-night py-20 sm:py-24">
            <InView className={`${shell} flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center`}>
                <div>
                    <h2 className="max-w-[24ch] font-display text-[clamp(1.25rem,2.6vw,2.1rem)] leading-[1.15] uppercase text-balance text-white">
                        <SplitText text={content.cta.title} />
                    </h2>
                </div>
                <Reveal delay={350}>
                    <Magnetic>
                        <a href="#contacto" className={`${pill} btn-arrow border-signal bg-signal text-night hover:border-white hover:bg-white`}>
                            {content.cta.button}
                            <Arrow />
                        </a>
                    </Magnetic>
                </Reveal>
            </InView>
        </section>
    );
}

function Footer() {
    const { contact, brand } = content;

    return (
        <footer className="border-t border-white/10 bg-[#030813]">
            <Reveal>
                <div className={`${shell} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]`}>
                    <div>
                        <img src={brand.logo} alt={brand.name} className="h-9 w-auto" />
                        <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-white/60">
                            Integración de soluciones de Tecnologías de la Información y Comunicaciones.
                        </p>
                    </div>
                    <ul className="space-y-3 text-sm text-white/65">
                        <li>
                            <a className="nav-link transition-colors hover:text-signal" href={`mailto:${contact.email}`}>
                                {contact.email}
                            </a>
                        </li>
                        <li>
                            <a
                                className="nav-link transition-colors hover:text-signal"
                                href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                            >
                                {contact.phone}
                            </a>
                        </li>
                    </ul>
                    <ul className="space-y-3 text-sm text-white/65">
                        <li className="max-w-[30ch] leading-relaxed">{contact.address}</li>
                        <li>
                            <a className="nav-link transition-colors hover:text-signal" href={contact.website}>
                                {contact.website.replace(/^https?:\/\//, '')}
                            </a>
                        </li>
                    </ul>
                </div>
            </Reveal>
            <div className="border-t border-white/10">
                <p className={`${shell} py-6 text-xs text-white/45`}>
                    © {new Date().getFullYear()} {brand.name} {brand.tagline}. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}

export default function App() {
    return (
        <>
            <Curtain />
            <Header />
            <PageRail />
            <main>
                <Hero />
                <Partner />
                <Services />
                <Values />
                <Stats />
                <Experience />
                <Brands />
                <Closing />
            </main>
            <Footer />
        </>
    );
}
