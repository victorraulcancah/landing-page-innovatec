import { type CampaignSectionData, type NavbarData } from '@/types/cms';
import { Head } from '@inertiajs/react';

interface Props {
    campaign: { id: number; name: string; meta_title: string | null; meta_description: string | null } | null;
    sections: Pick<CampaignSectionData, 'id' | 'type' | 'anchor' | 'content'>[];
    navbar: NavbarData;
    preview: boolean;
}

/**
 * MARCADOR TEMPORAL: muestra la estructura que entrega el panel. El diseño real de la
 * landing se construye después de definir la dirección visual y la paleta de la marca.
 */
export default function Landing({ campaign, sections, navbar, preview }: Props) {
    return (
        <>
            <Head title={campaign?.meta_title || campaign?.name || navbar.brand_text} />
            <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
                <h1>{navbar.brand_text}</h1>
                {!campaign ? (
                    <p>Próximamente.</p>
                ) : (
                    <>
                        <p>
                            Campaña: {campaign.name}
                            {preview && ' (vista previa)'}
                        </p>
                        <ol>
                            {sections.map((s) => (
                                <li key={s.id} id={s.anchor}>
                                    {s.type}: {String(s.content.title ?? '')}
                                </li>
                            ))}
                        </ol>
                    </>
                )}
            </main>
        </>
    );
}
