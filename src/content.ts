/**
 * Todo el texto de la landing vive aquí. Para cambiar un título, un punto o un
 * dato de contacto, edita este archivo y ejecuta `npm run build`.
 */
export const content = {
    brand: {
        name: 'PROINNOVATEC',
        logo: '/brand/logo-light.png',
        tagline: 'by Grupo CAME',
    },

    contact: {
        email: 'ventas@proinnovatec.com',
        phone: '+511 748-3615',
        address: 'Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro',
        website: 'https://www.proinnovatec.com',
    },

    hero: {
        title: 'Aliado técnico de operadoras y proveedores de telecomunicaciones',
        text: 'Potenciamos a las operadoras con servicios especializados y soporte técnico, para soluciones TIC eficientes y confiables.',
        primaryCta: 'Solicitar contacto',
        secondaryCta: 'Ver servicios',
    },

    form: {
        title: 'Cuéntanos qué necesitas',
        text: 'Un especialista de PROINNOVATEC te responderá lo antes posible.',
        submit: 'Solicitar contacto',
        success: 'Gracias. Preparamos tu mensaje; envíalo desde tu correo para que llegue a nuestro equipo.',
    },

    partner: {
        title: 'Tu partner técnico para el éxito en TIC',
        text: 'En PROINNOVATEC by Grupo CAME no competimos con las operadoras: nos convertimos en su aliado técnico. Con la experiencia de nuestro equipo certificado y altamente capacitado, ayudamos a los proveedores a implementar soluciones TIC avanzadas y a optimizar sus redes y servicios.',
        image: '/images/data-center.jpg',
    },

    services: {
        title: 'Servicios para operadoras',
        items: [
            {
                title: 'Consultoría en análisis y diseño de soluciones TIC',
                image: '/images/data-center.jpg',
                points: [
                    'Diseño de arquitecturas para redes, voz, seguridad y más',
                    'Evaluación y dimensionamiento de infraestructuras TIC',
                    'Asesoramiento técnico en mejores prácticas y tecnologías emergentes',
                ],
            },
            {
                title: 'Implementación y optimización de soluciones',
                image: '/images/racks.jpg',
                points: [
                    'Despliegue e integración de soluciones y plataformas',
                    'Migración de sistemas y homologación de equipos',
                    'Optimización y actualización de infraestructuras',
                ],
            },
            {
                title: 'Soporte técnico especializado',
                image: '/images/server-room.jpg',
                points: [
                    'Soporte técnico avanzado con personal capacitado',
                    'Resolución de incidencias con asistencia remota o in situ',
                ],
            },
        ],
    },

    values: {
        title: 'Potenciamos tu red y servicios',
        text: 'Nos convertimos en una extensión de tu equipo, aportando experiencia y tecnología sin competir en tu mercado.',
        items: [
            { title: 'Expertise certificado', text: 'Especialistas certificados en las principales tecnologías TIC.' },
            {
                title: 'Flexibilidad y eficiencia',
                text: 'Nos adaptamos a tus necesidades y tiempos, asegurando resultados óptimos.',
            },
            {
                title: 'Confianza y compromiso',
                text: 'Trabajamos en paralelo con tu equipo para fortalecer tus operaciones.',
            },
        ],
    },

    experience: {
        title: 'Experiencia con operadoras',
        client: 'Innova ITC · Telefónica',
        text: 'Homologación de routers ONE ACCESS para Telefónica: validación de MPLS, OSPF, BGP, VRRP, IPSEC, QoS, Netflow e IP SLA en maquetas, y pruebas de alto tráfico.',
        technologies: ['ONE ACCESS', 'Telefónica'],
        certificationsTitle: 'Equipo certificado',
        certifications: [
            { name: 'Cisco CCNA', image: '/certs/ccna.png' },
            { name: 'Huawei HCIA', image: '/certs/hcia.png' },
            { name: 'VMware Certified Professional', image: '/certs/vmware.png' },
            { name: 'Fortinet Network Security Expert 4', image: '/certs/fortinet-nse4.png' },
            { name: 'Veeam Certified Engineer', image: '/certs/veeam.png' },
            { name: 'Microsoft Certified Fundamentals', image: '/certs/microsoft.png' },
            { name: 'AudioCodes Certified Associate', image: '/certs/audiocodes-aca.png' },
            { name: 'Sophos Certified Architect', image: '/certs/sophos.png' },
        ],
    },

    stats: {
        title: 'Lo que hemos hecho en campo',
        items: [
            { value: 10, prefix: '+', unit: 'años', text: 'de experiencia del equipo, con certificaciones técnicas de los principales fabricantes.' },
            { value: 120, prefix: '+', unit: 'sedes', text: 'conectadas en una plataforma de comunicaciones unificadas, con interconexión en malla (SENATI).' },
            { value: 200, prefix: '+', unit: 'equipos', text: 'con seguridad estandarizada mediante Sophos XDR y MDR para servidores (Minera Titán).' },
            { value: 30, prefix: '+', unit: 'puntos de acceso', text: 'Wi-Fi Ubiquiti para aulas híbridas, con switch core y firewall (Colegio María de los Ángeles).' },
        ],
    },

    brands: {
        title: 'Marcas con las que trabajamos',
        items: [
            { name: 'Cisco', image: '/brands/cisco.png' },
            { name: 'Fortinet', image: '/brands/fortinet.png' },
            { name: 'Sophos', image: '/brands/sophos.png' },
            { name: 'Yeastar', image: '/brands/yeastar.png' },
            { name: 'Yealink', image: '/brands/yealink.png' },
            { name: 'Audiocodes', image: '/brands/audiocodes.png' },
            { name: 'Ubiquiti', image: '/brands/ubiquiti.png' },
            { name: 'ONE ACCESS', image: '/brands/one-access.png' },
            { name: 'Telefónica', image: '/brands/telefonica.png' },
            { name: 'Huawei', image: '/brands/huawei.png' },
        ],
    },

    cta: {
        title: '¿Buscas potenciar tu red y maximizar tus resultados?',
        button: 'Hablemos',
    },
};

export type Content = typeof content;
