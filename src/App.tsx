import { useEffect, useState, type ReactNode } from 'react';
import { content } from './content';
import { LeadForm } from './components/LeadForm';
import { NetworkMesh } from './components/NetworkMesh';
import { Reveal, shell } from './components/Reveal';

const pill =
    'inline-flex min-h-12 items-center rounded-full border px-8 text-sm font-medium transition-colors duration-200';

function Heading({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <h2
            className={`font-display text-[clamp(1.35rem,2.9vw,2.4rem)] leading-[1.15] uppercase text-balance text-white ${className}`}
        >
            {children}
        </h2>
    );
}

function Check() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-1 shrink-0 text-signal">
            <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter] duration-300 ${
                scrolled ? 'bg-night/80 backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            <div className={`${shell} flex h-[76px] items-center justify-between gap-6`}>
                <a href="#inicio" aria-label={content.brand.name}>
                    <img src={content.brand.logo} alt={content.brand.name} className="h-8 w-auto sm:h-9" />
                </a>
                <nav aria-label="Principal" className="flex items-center gap-6 text-sm">
                    <a href="#servicios" className="hidden text-white/75 transition-colors hover:text-white sm:inline">
                        Servicios
                    </a>
                    <a href="#experiencia" className="hidden text-white/75 transition-colors hover:text-white sm:inline">
                        Experiencia
                    </a>
                    <a
                        href="#contacto"
                        className="inline-flex min-h-10 items-center rounded-full border border-white/80 px-5 font-medium text-white transition-colors hover:bg-white hover:text-night"
                    >
                        Contáctanos
                    </a>
                </nav>
            </div>
        </header>
    );
}

function Hero() {
    const reduced = useReducedMotion();

    return (
        <section id="inicio" className="relative isolate overflow-hidden bg-night pb-20 pt-32 lg:pb-28 lg:pt-40">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_90%_at_75%_30%,#0b2f78_0%,#071a45_40%,#050b1a_80%)]" />
            <div className="animate-fade absolute inset-0 -z-10 opacity-70">
                <NetworkMesh animate={!reduced} />
            </div>
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(5,11,26,0.5)_0%,rgba(5,11,26,0.15)_40%,#050b1a_100%)]"
                aria-hidden="true"
            />

            <div className={`${shell} grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16`}>
                <div>
                    <h1 className="animate-rise font-display max-w-[18ch] text-[clamp(1.7rem,4.2vw,3.4rem)] leading-[1.14] uppercase text-balance text-white">
                        {content.hero.title}
                    </h1>
                    <p
                        className="animate-rise mt-6 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg"
                        style={{ ['--delay' as string]: '150ms' }}
                    >
                        {content.hero.text}
                    </p>
                    <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ ['--delay' as string]: '300ms' }}>
                        <a href="#contacto" className={`${pill} border-signal bg-signal text-night hover:border-white hover:bg-white`}>
                            {content.hero.primaryCta}
                        </a>
                        <a href="#servicios" className={`${pill} border-white/70 text-white hover:border-white hover:bg-white hover:text-night`}>
                            {content.hero.secondaryCta}
                        </a>
                    </div>
                </div>

                <div
                    id="contacto"
                    className="animate-rise border border-white/15 bg-night/70 p-6 backdrop-blur-sm sm:p-8"
                    style={{ ['--delay' as string]: '400ms' }}
                >
                    <h2 className="font-display text-lg uppercase leading-snug text-white">{content.form.title}</h2>
                    <p className="mb-6 mt-3 text-sm leading-relaxed text-white/70">{content.form.text}</p>
                    <LeadForm />
                </div>
            </div>
        </section>
    );
}

function Partner() {
    return (
        <section className="bg-night py-20 lg:py-28">
            <div className={`${shell} grid items-center gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-20`}>
                <Reveal>
                    <img
                        src={content.partner.image}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                    />
                </Reveal>
                <Reveal delay={120}>
                    <Heading>{content.partner.title}</Heading>
                    <p className="mt-7 max-w-[60ch] text-base leading-[1.8] text-white/75 sm:text-lg">
                        {content.partner.text}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}

function Services() {
    return (
        <section id="servicios" className="bg-night-2 py-20 lg:py-28">
            <div className={shell}>
                <Reveal>
                    <Heading>{content.services.title}</Heading>
                </Reveal>
                <ul className="mt-12 grid gap-4 lg:grid-cols-3">
                    {content.services.items.map((service, i) => (
                        <li key={service.title}>
                            <Reveal delay={i * 90} className="h-full">
                                <article className="flex h-full flex-col overflow-hidden border border-white/15 bg-night">
                                    <img
                                        src={service.image}
                                        alt=""
                                        loading="lazy"
                                        className="aspect-[16/10] w-full object-cover"
                                    />
                                    <div className="flex flex-1 flex-col p-7">
                                        <h3 className="font-display text-base uppercase leading-snug text-white sm:text-lg">
                                            {service.title}
                                        </h3>
                                        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-white/80">
                                            {service.points.map((point) => (
                                                <li key={point} className="flex gap-3">
                                                    <Check />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </article>
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
        <section className="bg-night py-20 lg:py-28">
            <div className={shell}>
                <Reveal className="mx-auto max-w-[56ch] text-center">
                    <Heading>{content.values.title}</Heading>
                    <p className="mt-5 text-base leading-relaxed text-white/70">{content.values.text}</p>
                </Reveal>
                <ul className="mt-14 grid gap-px overflow-hidden bg-white/15 md:grid-cols-3">
                    {content.values.items.map((item, i) => (
                        <li key={item.title} className="bg-night p-8">
                            <Reveal delay={i * 90}>
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

function Experience() {
    const { experience } = content;

    return (
        <section id="experiencia" className="relative isolate overflow-hidden bg-night-2 py-20 lg:py-28">
            <div className={`${shell} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-20`}>
                <Reveal>
                    <Heading>{experience.title}</Heading>
                    <h3 className="mt-8 font-display text-base uppercase text-signal">{experience.client}</h3>
                    <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-white/75">{experience.text}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {experience.technologies.map((tech) => (
                            <li key={tech} className="rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80">
                                {tech}
                            </li>
                        ))}
                    </ul>
                </Reveal>

                <Reveal delay={120}>
                    <p className="mb-4 text-sm text-white/60">{experience.certificationsTitle}</p>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {experience.certifications.map((cert) => (
                            <li key={cert.name}>
                                <figure className="flex aspect-square items-center justify-center rounded-md bg-white p-3">
                                    <img
                                        src={cert.image}
                                        alt={cert.name}
                                        loading="lazy"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </figure>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}

function Closing() {
    return (
        <section className="bg-night py-20 sm:py-24">
            <div className={`${shell} flex flex-col items-start justify-between gap-8 border-t border-white/15 pt-14 lg:flex-row lg:items-center`}>
                <Reveal>
                    <Heading className="max-w-[24ch] !text-[clamp(1.25rem,2.6vw,2.1rem)]">{content.cta.title}</Heading>
                </Reveal>
                <Reveal delay={120}>
                    <a href="#contacto" className={`${pill} border-signal bg-signal text-night hover:border-white hover:bg-white`}>
                        {content.cta.button}
                    </a>
                </Reveal>
            </div>
        </section>
    );
}

function Footer() {
    const { contact, brand } = content;

    return (
        <footer className="border-t border-white/10 bg-[#030813]">
            <div className={`${shell} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]`}>
                <div>
                    <img src={brand.logo} alt={brand.name} className="h-9 w-auto" />
                    <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-white/60">
                        Integración de soluciones de Tecnologías de la Información y Comunicaciones.
                    </p>
                </div>
                <ul className="space-y-3 text-sm text-white/65">
                    <li>
                        <a className="transition-colors hover:text-signal" href={`mailto:${contact.email}`}>
                            {contact.email}
                        </a>
                    </li>
                    <li>
                        <a className="transition-colors hover:text-signal" href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>
                            {contact.phone}
                        </a>
                    </li>
                </ul>
                <ul className="space-y-3 text-sm text-white/65">
                    <li className="max-w-[30ch] leading-relaxed">{contact.address}</li>
                    <li>
                        <a className="transition-colors hover:text-signal" href={contact.website}>
                            {contact.website.replace(/^https?:\/\//, '')}
                        </a>
                    </li>
                </ul>
            </div>
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
            <Header />
            <main>
                <Hero />
                <Partner />
                <Services />
                <Values />
                <Experience />
                <Closing />
            </main>
            <Footer />
        </>
    );
}
