<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Primera campaña: «Cada hora de caída cuesta». Se arma con lo que dice el brochure comercial de UCO360
 * y con las piezas interactivas pedidas (calculadora, autodiagnóstico, barra de anuncio, pop-up).
 * No incluye precios, clientes ni cifras reales: el brochure no los trae. Las cifras iniciales de la
 * calculadora son valores de ejemplo que el visitante ajusta.
 */
class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        if (Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->exists()) {
            return;
        }

        $campaign = Campaign::create([
            'name' => 'Cada hora de caída cuesta',
            'slug' => 'cada-hora-de-caida-cuesta',
            'status' => 'draft',
            'meta_title' => 'UCO360 · Tu propia Área de TI externa para empresas en crecimiento',
            'meta_description' => 'Calcula cuánto te cuesta una caída y conoce lo que incluye tu área de TI externa por una tarifa fija mensual. Agenda tu diagnóstico.',
        ]);

        $sections = [
            ['promo', 'anuncio', null, true, [
                'text' => 'Este mes: agenda tu diagnóstico de TI y revisa tus backups con nosotros.',
                'link' => ['label' => 'Reservar', 'action' => 'lead_form', 'value' => ''],
                'dismissible' => true,
            ]],
            ['hero', 'inicio', null, true, [
                'title' => 'Cada hora que tu sistema se cae, pagas sueldos que no producen.',
                'subtitle' => 'UCO360 es tu propia área de TI por una tarifa fija mensual: un equipo que previene fallas, protege tu información, visita tu empresa cada semana y da la cara ante tus proveedores.',
                'primary_cta' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
                'secondary_cta' => ['label' => 'Hablar por WhatsApp', 'action' => 'whatsapp', 'value' => ''],
                'image' => '/images/uco360-reunion.jpg', 'image_alt' => 'Reunión de trabajo en una oficina con vista a la ciudad',
                'note' => 'Soporte · Infraestructura · Ciberseguridad · Gestión TI',
            ]],
            ['calculator', 'calculadora', null, true, [
                'title' => '¿Cuánto te cuesta una caída?',
                'in_hero' => true,
                'people_label' => 'Personas que dejan de trabajar', 'people_min' => 1, 'people_max' => 100, 'people_default' => 26, 'people_unit' => 'personas',
                'hours_label' => 'Horas de caída al mes (sistema, internet, correo)', 'hours_min' => 1, 'hours_max' => 100, 'hours_default' => 8, 'hours_unit' => 'horas',
                'cost_label' => 'Costo por persona por hora', 'cost_min' => 5, 'cost_max' => 100, 'cost_default' => 15, 'currency' => 'S/',
                'simulate_label' => 'Simular caída',
                'result_label' => 'Pagas sueldos sin producir:',
                'year_note' => 'al año, sin contar ventas perdidas.',
                'disclaimer' => 'Estimación con los valores que tú ajustas; no es una promesa de ahorro.',
                'cta' => ['label' => 'Quiero evitar esa pérdida', 'action' => 'lead_form', 'value' => ''],
            ]],
            ['marquee', 'franja', null, true, [
                'items' => VisualesSeeder::SERVICES,
                'speed' => 'normal',
            ]],
            ['comparison', 'por-que-uco360', 'Por qué UCO360', true, [
                'title' => '¿Por qué elegir UCO360?',
                'subtitle' => 'A medida que tu empresa crece, necesita una gestión tecnológica que acompañe sus nuevos desafíos. UCO360 es tu área de TI externa: un equipo de especialistas que atiende a tus usuarios, previene fallas, administra tu infraestructura, protege tu información y coordina con tus proveedores, por una tarifa fija mensual.',
                'left_label' => 'Técnico freelance («apaga-incendios»)',
                'right_label' => 'UCO360 — Tu área de TI externa',
                'rows' => [
                    ['topic' => 'Enfoque de trabajo', 'left' => 'Reactivo: actúa recién cuando tu personal dejó de trabajar.', 'right' => 'Preventivo: mantenimiento programado y monitoreo continuo.'],
                    ['topic' => 'Equipo de TI', 'left' => 'Dependencia de una sola persona; si se ausenta, tu empresa espera.', 'right' => 'Equipo de TI multidisciplinario siempre disponible sin interrupciones.'],
                    ['topic' => 'Proveedores (Internet/ERP)', 'left' => 'Se culpan entre sí y tú pierdes horas haciendo de intermediario.', 'right' => 'Gestión integral: nos encargamos de tus proveedores hasta darte solución.'],
                    ['topic' => 'Copias de seguridad', 'left' => 'Copias sin verificar que fallan cuando ocurre una emergencia.', 'right' => 'Protección comprobada: supervisión continua y pruebas de recuperación.'],
                    ['topic' => 'Presencia y control', 'left' => 'Visitas eventuales sin inventario ni claridad para la Gerencia.', 'right' => 'Acompañamiento continuo: visita semanal e informe ejecutivo mensual.'],
                ],
            ]],
            ['quiz', 'autodiagnostico', 'Autodiagnóstico', true, [
                'title' => '¿Qué tan expuesta está tu empresa?',
                'subtitle' => 'Marca lo que se parece a tu empresa.',
                'items' => [
                    ['text' => 'Dependo de una sola persona para toda mi tecnología'],
                    ['text' => 'Nunca probé restaurar un backup'],
                    ['text' => 'No sé cuántas computadoras y licencias tengo'],
                    ['text' => 'Ex trabajadores podrían seguir entrando a mi correo o sistema'],
                    ['text' => 'Cuando falla el internet o el ERP, yo hago de intermediario'],
                    ['text' => 'No sé cuánto gastaré en TI este mes'],
                ],
                'msg_zero' => 'Marca lo que se parece a tu empresa y mira tu nivel de exposición.',
                'msg_low' => 'Exposición moderada: conviene ordenar estos puntos antes de que fallen.',
                'msg_high' => 'Exposición alta: una falla te tomaría por sorpresa.',
                'msg_critical' => 'Riesgo crítico: tu empresa depende de la suerte.',
                'cta_label' => 'Revisar mis {n} puntos con un experto',
                'cta_empty' => 'Agenda tu diagnóstico',
            ]],
            ['features', 'servicios', 'Servicios', true, [
                'title' => 'Los 4 pilares de UCO360',
                'subtitle' => 'Transformando tu tecnología en continuidad, seguridad y crecimiento para tu empresa.',
                'columns' => '2',
                'items' => [
                    ['badge' => 'Soporte', 'title' => 'Soporte y continuidad operativa', 'text' => 'Atención inmediata por WhatsApp, control por tickets y visita presencial todas las semanas.'],
                    ['badge' => 'Infraestructura', 'title' => 'Administración de infraestructura', 'text' => 'Mantenimiento preventivo de servidores, redes Wi-Fi, firewalls y nube para evitar caídas.'],
                    ['badge' => 'Ciberseguridad', 'title' => 'Seguridad y continuidad', 'text' => 'Backups monitoreados a diario, pruebas reales de restauración y bloqueo inmediato en bajas de personal.'],
                    ['badge' => 'Gestión TI', 'title' => 'Gestión y evolución tecnológica', 'text' => 'Inventario vivo de equipos y licencias, alerta de vencimientos, mejoras y proyectos de expansión.'],
                ],
            ]],
            ['text', 'para-la-gerencia', null, true, [
                'title' => 'Pensado para la gerencia',
                'body' => "Coordinación centralizada con tus proveedores: hablamos de tú a tú con tu proveedor de Internet, ERP o software hasta resolver el problema.\n\nVisibilidad ejecutiva y costo mensual predecible: tarifa fija mensual, informes claros en lenguaje de negocio y acompañamiento para crecer.",
                'image' => '/images/uco360-equipo.jpg',
                'image_alt' => 'Profesional de una empresa atendiendo una reunión de trabajo',
                'overlay' => 'report',
            ]],
            ['steps', 'como-funciona', null, true, [
                'title' => 'Cómo implementamos UCO360 en tu empresa',
                'subtitle' => '',
                'items' => [
                    ['title' => 'Diagnóstico y propuesta a medida', 'text' => 'Evaluamos tu operación actual, sedes, equipos y necesidades reales. Nuestro equipo de TI diseña el alcance exacto que tu empresa necesita para que cuentes con una tarifa mensual fija, justa y sin sorpresas.'],
                    ['title' => 'Puesta en orden inicial', 'text' => 'Atendemos a tus usuarios desde el primer día mientras ordenamos tu entorno tecnológico: levantamos el inventario completo, protegemos los accesos, verificamos tus copias de respaldo y corregimos riesgos urgentes.'],
                    ['title' => 'Prevención y mejora continua', 'text' => 'Con tu tecnología estabilizada, ejecutamos el plan anual de mantenimiento preventivo, las visitas presenciales semanales y el acompañamiento continuo para sostener la expansión de tu negocio.'],
                ],
            ]],
            ['included', 'que-incluye', 'Qué incluye', true, [
                'title' => 'Todo lo que tu empresa recibe por una sola tarifa',
                'subtitle' => '',
                'items' => [
                    ['title' => 'Soporte sin esperas', 'points' => "Atención por WhatsApp, con seguimiento hasta que el usuario vuelva a trabajar\nVisita presencial todas las semanas\nVisitas extra ante emergencias"],
                    ['title' => 'Infraestructura para evitar caídas', 'points' => "Mantenimiento preventivo de servidores, redes, Wi-Fi y firewalls\nVPN y nube (Microsoft 365, Google Workspace)\nNos encargamos de tus proveedores de internet y ERP"],
                    ['title' => 'Información a salvo', 'points' => "Backups monitoreados cada día\nPruebas reales de restauración\nBloqueo inmediato de accesos cuando alguien se retira"],
                    ['title' => 'Control para crecer', 'points' => "Inventario vivo de equipos y licencias\nAlertas antes de cada vencimiento\nProyectos para nuevas sedes, almacenes y migraciones"],
                ],
                'footer_title' => 'Y cada mes, un informe que tu gerencia entiende',
                'footer_text' => 'Inventario actualizado, reporte de soporte y visitas, control de backups y estado de salud de tus sistemas. En lenguaje de negocio, no de técnicos.',
            ]],
            // Oculta: el brochure no define paquetes ni precios. Los nombres son una propuesta para completar.
            ['packages', 'paquetes', 'Paquetes', false, [
                'title' => 'Elige el alcance que tu empresa necesita',
                'subtitle' => 'Todos incluyen tarifa fija mensual. El alcance exacto se define en el diagnóstico.',
                'note' => '',
                'items' => [
                    ['name' => 'Soporte', 'tagline' => 'Atención diaria a tus usuarios', 'price_label' => 'Cotiza con un diagnóstico', 'features' => "Atención por WhatsApp y control por tickets\nVisita presencial semanal\nEquipo de TI especializado", 'cta_label' => 'Solicitar propuesta', 'highlighted' => false],
                    ['name' => 'Protegido', 'tagline' => 'Soporte más infraestructura y seguridad', 'price_label' => 'Cotiza con un diagnóstico', 'features' => "Todo lo del paquete Soporte\nMantenimiento preventivo y gestión de proveedores\nBackups monitoreados y pruebas de restauración", 'cta_label' => 'Solicitar propuesta', 'highlighted' => true],
                    ['name' => 'Integral', 'tagline' => 'Los 4 pilares de UCO360', 'price_label' => 'Cotiza con un diagnóstico', 'features' => "Todo lo del paquete Protegido\nInventario vivo y control de vencimientos\nMejoras y proyectos de expansión", 'cta_label' => 'Solicitar propuesta', 'highlighted' => false],
                ],
            ]],
            ['faq', 'preguntas', 'Preguntas', true, [
                'title' => 'Preguntas frecuentes',
                'items' => [
                    ['q' => '¿Cómo pido ayuda cuando algo falla?', 'a' => 'Tus colaboradores reportan cualquier inconveniente de correo, impresora, red o sistema directamente por WhatsApp. Nuestro equipo de TI inicia la asistencia remota al instante y da seguimiento a cada solicitud hasta confirmar que el usuario volvió a trabajar.'],
                    ['q' => '¿Hay visitas presenciales?', 'a' => 'Sí. Incluimos una visita presencial programada todas las semanas en tu empresa para revisiones físicas, mantenimiento en sitio y acompañamiento directo a tu personal, más visitas adicionales ante emergencias.'],
                    ['q' => '¿Qué pasa si falla mi Internet o mi ERP?', 'a' => 'Nosotros asumimos la coordinación técnica: realizamos las pruebas de descarte, abrimos el reclamo ante tu proveedor externo con evidencia, exigimos plazos y verificamos que tu empresa vuelva a operar.'],
                    ['q' => '¿Cómo sé que mis copias de seguridad funcionan?', 'a' => 'Supervisamos todos los días la ejecución de las copias de respaldo y realizamos pruebas periódicas y controladas de restauración en ambientes aislados para certificar que tus archivos y sistemas son recuperables.'],
                    ['q' => '¿Cuánto cuesta?', 'a' => 'Una tarifa fija mensual, justa y sin sorpresas. El alcance exacto se diseña a medida después de un diagnóstico de tu operación, sedes, equipos y necesidades reales.'],
                ],
            ]],
            ['cta', 'contacto', 'Contacto', true, [
                'title' => '¡Concéntrate en tu negocio, nosotros nos encargamos de tu TI!',
                'text' => 'Agenda hoy una reunión de diagnóstico inicial y descubre cómo contar con tu propia Área de TI Externa.',
                'show_form' => true,
                'show_contact' => true,
                'show_map' => true,
                'form_button' => 'Solicitar diagnóstico',
                'button' => ['label' => 'Escríbenos por WhatsApp', 'action' => 'whatsapp', 'value' => ''],
            ]],
            ['popup', 'popup', null, true, [
                'title' => '¿Hablamos de tu TI?',
                'text' => 'Agenda tu diagnóstico y revisa con nosotros cómo está tu empresa.',
                'button' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
                'trigger' => 'delay', 'seconds' => 35, 'scroll_percent' => 50, 'position' => 'corner', 'once' => false,
                'visual' => 'report', 'dismiss_label' => 'Ahora no',
            ]],
        ];

        // Fondos y colores por nombre de color del tema: si el tema cambia, estas secciones lo siguen.
        $styles = [
            'anuncio' => ['bg_color' => 'accent'],
            'franja' => ['bg_color' => 'accent'],
            'inicio' => ['bg_color' => 'dark', 'text_color' => 'on_dark', 'accent_color' => 'accent'],
            'por-que-uco360' => ['bg_color' => 'surface'],
            'autodiagnostico' => ['bg_color' => 'dark', 'text_color' => 'on_dark', 'accent_color' => 'accent'],
            'para-la-gerencia' => ['bg_color' => 'dark', 'text_color' => 'on_dark', 'accent_color' => 'accent', 'image_position' => 'left', 'padding' => 'lg'],
            'que-incluye' => ['bg_color' => 'surface'],
            'contacto' => ['bg_color' => 'dark', 'text_color' => 'on_dark', 'accent_color' => 'accent'],
        ];

        foreach ($sections as $i => [$type, $anchor, $navLabel, $visible, $content]) {
            $campaign->sections()->create([
                'type' => $type,
                'position' => $i + 1,
                'is_visible' => $visible,
                'anchor' => $anchor,
                'nav_label' => $navLabel,
                'content' => SectionTypes::sanitizeContent($type, $content),
                'style' => SectionTypes::sanitizeStyle($type, $styles[$anchor] ?? []),
            ]);
        }

        // Es la unica campaña, asi que sale en linea de inmediato.
        $campaign->activate();
    }
}
