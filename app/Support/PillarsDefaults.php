<?php

namespace App\Support;

/**
 * Datos de fábrica de «Qué incluye cada mes»: los 4 pilares de UCO360 explicados en lenguaje sencillo.
 * Todo se edita y se amplía luego desde el panel.
 */
class PillarsDefaults
{
    /** @return array<string, mixed> */
    public static function pillars(): array
    {
        return [
            'eyebrow' => 'Todo incluido en tu tarifa mensual',
            'title' => '¿Qué incluye UCO360 cada mes?',
            'subtitle' => 'Nuestro servicio cubre toda tu empresa con 4 pilares muy simples. Elige uno para ver lo que hacemos por ti:',
            'cta' => ['label' => 'Quiero esto en mi empresa', 'action' => 'lead_form', 'value' => ''],
            'items' => [
                self::pillar('headset', 'Pilar 1 · Atención al personal', 'Soporte y visita semanal', 'Ayuda por WhatsApp y presencia fija cada semana.',
                    'Pilar 1 · Atención diaria a tu personal', 'Soporte inmediato por WhatsApp y visita presencial semanal', '¿Cómo ayuda este pilar a tu empresa en el día a día?',
                    [
                        ['1. Ayuda al instante por WhatsApp', 'Si a alguien de tu equipo le falla el correo, el sistema, la impresora o su PC, nos escribe directo por WhatsApp y nos conectamos al instante hasta dejarlo trabajando.'],
                        ['2. Visita fija todas las semanas a tu local', 'No solo atendemos a distancia: un profesional va a tu empresa todas las semanas de forma programada para revisar tus equipos físicamente, más visitas extra si hay una emergencia.'],
                        ['3. Nunca dependes de una sola persona', 'Tienes detrás a todo un equipo de especialistas siempre disponible. Si alguien necesita ayuda urgente en recepción, ventas o almacén, siempre hay quién le responda.'],
                    ],
                    ['Situación en tu empresa', 'Qué hace UCO360', 'Resultado directo para ti'],
                    [
                        ['Falla urgente en recepción, caja o facturación', 'Atención prioritaria al instante', 'Tu negocio no se detiene ni haces esperar a tus clientes.'],
                        ['Consultas y problemas de todos los días', 'Ayuda rápida por WhatsApp con control de atención', 'Tu personal resuelve todo en minutos sin perder horas.'],
                        ['Cuidado físico de tus equipos en tus locales', 'Visita presencial fija cada semana', 'Previenes fallas antes de que interrumpan el trabajo.'],
                    ]),
                self::pillar('wifi', 'Pilar 2 · Internet y equipos', 'Red, Wi-Fi y proveedores', 'Servidores estables, Wi-Fi rápido y gestión de reclamos.',
                    'Pilar 2 · Internet, Wi-Fi, servidores y proveedores', 'Equipos rápidos, buena red y gestión de tus proveedores', '¿Cómo evita este pilar que tu empresa se quede paralizada?',
                    [
                        ['1. Cuidado preventivo de servidores y PCs', 'Revisamos periódicamente que tus servidores y computadoras no tengan el disco lleno ni se pongan lentos, evitando caídas sorpresivas.'],
                        ['2. Wi-Fi estable y red segura en todo tu local', 'Cuidamos tus antenas Wi-Fi, cables de red, routers, firewalls y correos en la nube para que todos trabajen fluido en cada piso, sede o almacén.'],
                        ['3. Hablamos con tus proveedores por ti', 'Cuando falla tu Internet o tu sistema ERP, tú no pierdes tiempo reclamando: nosotros hacemos las pruebas, abrimos el reclamo y exigimos solución a tu proveedor.'],
                    ],
                    ['Qué cuidamos', 'Qué hace UCO360', 'Resultado directo para ti'],
                    [
                        ['Servidores y sistema central', 'Mantenimiento preventivo programado', 'Tu facturación y archivos funcionan rápidos y sin colgarse.'],
                        ['Wi-Fi, red e internet', 'Monitoreo y optimización continua', 'Conexión estable en recepción, oficinas, pisos y almacenes.'],
                        ['Proveedor de Internet y Sistema', 'Trato técnico directo de principio a fin', 'Te olvidas del peloteo entre proveedores; nosotros lo resolvemos.'],
                    ]),
                self::pillar('shield', 'Pilar 3 · Archivos seguros', 'Backups y seguridad', 'Copias revisadas a diario, antivirus y cierre de accesos.',
                    'Pilar 3 · Archivos seguros y protección contra virus', 'Copias de seguridad diarias y control de accesos', '¿Cómo protege este pilar la información valiosa de tu empresa?',
                    [
                        ['1. Vigilamos tus copias de seguridad cada día', 'Revisamos todos los días que las copias (backups) de tus servidores, sistemas y carpetas importantes se hayan guardado bien. Si hay un error, lo corregimos en el día.'],
                        ['2. Comprobamos que tus archivos sí se puedan recuperar', 'Hacemos pruebas periódicas de recuperación para garantizar que, si algún día se daña un equipo o entra un virus, tu información vuelve a estar lista.'],
                        ['3. Bloqueo inmediato en salidas de personal', 'Protegemos tus equipos contra virus, guardamos las claves de tu empresa en un lugar seguro y bloqueamos al instante los accesos cuando un trabajador se retira.'],
                    ],
                    ['Qué protegemos', 'Qué hace UCO360', 'Resultado directo para ti'],
                    [
                        ['Información contable y comercial', 'Copias diarias y pruebas reales de recuperación', 'Certeza de no perder nunca los datos de tu negocio.'],
                        ['Retiro de trabajadores', 'Cierre inmediato de correo, claves y sistema', 'Ningún ex trabajador se lleva ni sigue viendo tu información.'],
                        ['Computadoras y correos', 'Defensa activa contra virus y estafas', 'Tu empresa opera segura frente a virus y secuestro de archivos.'],
                    ]),
                self::pillar('clipboard', 'Pilar 4 · Orden para gerencia', 'Inventario y crecimiento', 'Control de equipos, licencias, compras e informe mensual.',
                    'Pilar 4 · Orden, inventario y crecimiento', 'Control de tus equipos, compras claras e informe mensual', '¿Cómo le da este pilar control y ahorro a la gerencia?',
                    [
                        ['1. Inventario exacto y siempre al día', 'Sabes exactamente cuántas computadoras, servidores, equipos y licencias tiene tu empresa, quién usa cada equipo y en qué local se encuentra.'],
                        ['2. Alertas de vencimientos y compras sin gastar de más', 'Te avisamos antes de que venzan tus licencias, garantías o dominios y revisamos las cotizaciones de proveedores para que compres solo lo necesario.'],
                        ['3. Acompañamos la expansión de tu empresa', 'Si abres una nueva sede, almacén o área, diseñamos e implementamos todo lo necesario para que tu negocio crezca en orden.'],
                    ],
                    ['Área de control', 'Qué hace UCO360', 'Resultado directo para ti'],
                    [
                        ['Computadoras y licencias', 'Inventario actualizado al detalle', 'Eliminas pérdidas de equipos y compras a ciegas.'],
                        ['Renovaciones y compras', 'Aviso a tiempo y revisión de cotizaciones', 'Cuidas tu presupuesto sin urgencias de última hora.'],
                        ['Nuevos locales o crecimiento', 'Planificación y puesta en marcha', 'Tu tecnología acompaña el crecimiento de tu empresa.'],
                    ]),
            ],
        ];
    }

    /**
     * @param  list<array{0: string, 1: string}>  $cards
     * @param  list<string>  $heads
     * @param  list<array{0: string, 1: string, 2: string}>  $rows
     * @return array<string, mixed>
     */
    private static function pillar(string $icon, string $tabTag, string $tabTitle, string $tabText, string $tag, string $title, string $question, array $cards, array $heads, array $rows): array
    {
        return [
            'icon' => $icon, 'image' => null,
            'tab_tag' => $tabTag, 'tab_title' => $tabTitle, 'tab_text' => $tabText,
            'tag' => $tag, 'title' => $title, 'question' => $question,
            'cards' => array_map(fn ($c) => ['title' => preg_replace('/^\d+\.\s*/', '', $c[0]), 'text' => $c[1]], $cards),
            'head_a' => $heads[0], 'head_b' => $heads[1], 'head_c' => $heads[2],
            'rows' => array_map(fn ($r) => ['a' => $r[0], 'b' => $r[1], 'c' => $r[2]], $rows),
        ];
    }
}
