<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Primera campaña, armada solo con lo que dice el brochure comercial de UCO360.
 * No incluye precios, clientes ni cifras: el brochure no los trae.
 */
class CampaignSeeder extends Seeder
{
    public function run(): void
    {
        if (Campaign::query()->where('slug', 'deja-de-apagar-incendios')->exists()) {
            return;
        }

        $campaign = Campaign::create([
            'name' => 'Deja de apagar incendios',
            'slug' => 'deja-de-apagar-incendios',
            'status' => 'draft',
            'meta_title' => 'UCO360 · Tu propia Área de TI externa para empresas en crecimiento',
            'meta_description' => 'Soporte, infraestructura, ciberseguridad y gestión de TI con una tarifa fija mensual. Agenda tu diagnóstico.',
        ]);

        $sections = [
            ['hero', 'inicio', null, true, [
                'title' => 'Tu propia Área de TI externa para empresas en crecimiento',
                'subtitle' => 'Deja atrás la incertidumbre de «apagar incendios» con soporte ocasional. Incorpora un equipo multidisciplinario de especialistas que previene fallas, protege tu información y acompaña la expansión de tu negocio.',
                'primary_cta' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
                'secondary_cta' => ['label' => 'Escríbenos por WhatsApp', 'action' => 'whatsapp', 'value' => ''],
                'image' => null, 'image_alt' => '',
                'note' => 'Soporte · Infraestructura · Ciberseguridad · Gestión TI',
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
            ['features', 'servicios', 'Servicios', true, [
                'title' => 'Los 4 pilares de UCO360',
                'subtitle' => 'Transformando tu tecnología en continuidad, seguridad y crecimiento para tu empresa.',
                'columns' => '2',
                'items' => [
                    ['badge' => 'Pilar 1', 'title' => 'Soporte y continuidad operativa', 'text' => 'Atención inmediata por WhatsApp, control por tickets y visita presencial todas las semanas.'],
                    ['badge' => 'Pilar 2', 'title' => 'Administración de infraestructura', 'text' => 'Mantenimiento preventivo de servidores, redes Wi-Fi, firewalls y nube para evitar caídas.'],
                    ['badge' => 'Pilar 3', 'title' => 'Seguridad y continuidad', 'text' => 'Backups monitoreados a diario, pruebas reales de restauración y bloqueo inmediato en bajas de personal.'],
                    ['badge' => 'Pilar 4', 'title' => 'Gestión y evolución tecnológica', 'text' => 'Inventario vivo de equipos y licencias, alerta de vencimientos, mejoras y proyectos de expansión.'],
                ],
            ]],
            ['features', 'para-la-gerencia', null, true, [
                'title' => 'Pensado para la gerencia',
                'subtitle' => '',
                'columns' => '2',
                'items' => [
                    ['badge' => '', 'title' => 'Coordinación centralizada con tus proveedores', 'text' => 'Hablamos de tú a tú con tu proveedor de Internet, ERP o software hasta resolver el problema.'],
                    ['badge' => '', 'title' => 'Visibilidad ejecutiva y costo mensual predecible', 'text' => 'Tarifa fija mensual, informes claros en lenguaje de negocio y acompañamiento para crecer.'],
                ],
            ]],
            ['steps', 'como-funciona', 'Cómo funciona', true, [
                'title' => 'Cómo implementamos UCO360 en tu empresa',
                'subtitle' => '',
                'items' => [
                    ['title' => 'Diagnóstico y propuesta a medida', 'text' => 'Evaluamos tu operación actual, sedes, equipos y necesidades reales. Nuestro equipo de TI diseña el alcance exacto que tu empresa necesita para que cuentes con una tarifa mensual fija, justa y sin sorpresas.'],
                    ['title' => 'Puesta en orden inicial', 'text' => 'Atendemos a tus usuarios desde el primer día mientras ordenamos tu entorno tecnológico: levantamos el inventario completo, protegemos los accesos, verificamos tus copias de respaldo y corregimos riesgos urgentes.'],
                    ['title' => 'Prevención y mejora continua', 'text' => 'Con tu tecnología estabilizada, ejecutamos el plan anual de mantenimiento preventivo, las visitas presenciales semanales y el acompañamiento continuo para sostener la expansión de tu negocio.'],
                ],
            ]],
            ['features', 'que-recibes', 'Qué recibes', true, [
                'title' => '¿Qué recibe tu gerencia mes a mes?',
                'subtitle' => 'Tú conservas las decisiones de negocio, nosotros nos encargamos de la TI.',
                'columns' => '2',
                'items' => [
                    ['badge' => '', 'title' => 'Inventario actualizado de TI', 'text' => 'Registro al día de todas tus computadoras, servidores, licencias, vencimientos y proveedores. Control de tus activos y cero compras a ciegas.'],
                    ['badge' => '', 'title' => 'Reporte de soporte y visitas', 'text' => 'Resumen de todas las atenciones resueltas a tu personal y de cada visita presencial semanal. Visibilidad del trabajo real entregado a tu empresa.'],
                    ['badge' => '', 'title' => 'Control de copias de seguridad', 'text' => 'Constancia del monitoreo diario de tus respaldos y de las pruebas periódicas de recuperación. Tranquilidad total sobre tu información crítica.'],
                    ['badge' => '', 'title' => 'Informe ejecutivo mensual', 'text' => 'Estado de salud de tus sistemas, mejoras realizadas y recomendaciones para seguir creciendo. Decisiones simples sin perder tiempo operativo.'],
                ],
            ]],
            // Oculta: el brochure no define paquetes ni precios. Los nombres son una propuesta para completar.
            ['packages', 'paquetes', 'Paquetes', false, [
                'title' => 'Elige el alcance que tu empresa necesita',
                'subtitle' => 'Todos incluyen tarifa fija mensual. El alcance exacto se define en el diagnóstico.',
                'note' => 'Completa nombres, contenido y precios antes de mostrar esta sección.',
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
                'form_button' => 'Solicitar diagnóstico',
                'button' => ['label' => 'Escríbenos por WhatsApp', 'action' => 'whatsapp', 'value' => ''],
            ]],
        ];

        foreach ($sections as $i => [$type, $anchor, $navLabel, $visible, $content]) {
            $campaign->sections()->create([
                'type' => $type,
                'position' => $i + 1,
                'is_visible' => $visible,
                'anchor' => $anchor,
                'nav_label' => $navLabel,
                'content' => SectionTypes::sanitizeContent($type, $content),
                'style' => SectionTypes::defaultStyle(),
            ]);
        }

        // Es la unica campaña, asi que sale en linea de inmediato.
        $campaign->activate();
    }
}
