<?php

namespace App\Support;

/**
 * Datos de fábrica de la sección «Situaciones del día a día» (los problemas cotidianos que UCO360 resuelve).
 * Solo se usan para llenar la base de datos la primera vez; después todo se edita y se amplía desde el panel.
 * El detalle que se ve al abrir cada tarjeta sale de los mismos textos de los pilares del servicio.
 */
class PainsDefaults
{
    /** @return array<string, mixed> */
    public static function pains(): array
    {
        $c = fn (string $icon, string $tag, string $tone, string $title, string $text, string $solution, string $detail, string $points) => [
            'icon' => $icon, 'image' => null, 'tag' => $tag, 'tone' => $tone, 'title' => $title, 'text' => $text, 'solution' => $solution,
            'detail_text' => $detail, 'detail_points' => $points, 'gallery' => [], 'video' => null, 'docs' => [],
        ];

        return [
            'eyebrow' => '¿Te suena familiar en tu día a día?',
            'title' => 'No necesitas saber de tecnología para notar cuando algo está frenando tu empresa',
            'subtitle' => 'Cuando dependes de un técnico por horas o de alguien que no puede saber de todo a la vez, tu negocio sufre estos problemas todos los meses:',
            'columns' => '3',
            'more_label' => 'Ver más detalle',
            'modal_cta' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
            'items' => [
                $c('hourglass', 'Operación detenida', 'rose', 'La recepción o facturación se paraliza y el técnico «llega en la tarde»',
                    'Tienes clientes o huéspedes esperando en recepción, cajas sin poder facturar o pedidos detenidos, y el técnico externo no contesta porque está ocupado con otro cliente.',
                    'UCO360 responde al instante por WhatsApp.',
                    '<p>Si a alguien de tu equipo le falla el correo, el sistema, la impresora o su PC, nos escribe directo por WhatsApp y nos conectamos al instante hasta dejarlo trabajando.</p><p>Además, un profesional va a tu empresa todas las semanas de forma programada para revisar tus equipos físicamente, con visitas extra si hay una emergencia.</p>',
                    "Ayuda al instante por WhatsApp, con seguimiento hasta que el usuario vuelva a trabajar\nVisita fija todas las semanas a tu local\nNunca dependes de una sola persona: hay un equipo de especialistas siempre disponible"),
                $c('wifi', 'Fallas de red y Wi-Fi', 'amber', 'El Wi-Fi se corta a cada rato y el sistema se pone lento',
                    'Un soporte básico puede arreglar una impresora, pero no tiene la especialidad para configurar bien toda la red, antenas Wi-Fi y servidores de tu hotel, oficina o almacén.',
                    'UCO360 optimiza toda tu red y servidores.',
                    '<p>Revisamos periódicamente que tus servidores y computadoras no tengan el disco lleno ni se pongan lentos, para evitar caídas sorpresivas.</p><p>Cuidamos tus antenas Wi-Fi, cables de red, routers, firewalls y correos en la nube para que todos trabajen fluido en cada piso, sede o almacén.</p>',
                    "Mantenimiento preventivo programado de servidores y PCs\nWi-Fi estable y red segura en todo tu local\nMonitoreo y optimización continua"),
                $c('phone', 'Desgaste con proveedores', 'rose', 'El de Internet culpa al sistema y el del sistema culpa al Internet',
                    'Cuando algo falla, tus proveedores se culpan entre sí y tú o tu administración pierden horas al teléfono haciendo de intermediarios sin que nadie resuelva.',
                    'UCO360 asume la gestión total de tus proveedores.',
                    '<p>Cuando falla tu Internet o tu sistema ERP, tú no pierdes tiempo reclamando: nosotros hacemos las pruebas, abrimos el reclamo y exigimos solución a tu proveedor.</p><p>Hablamos de tú a tú con tu proveedor de Internet, ERP o software hasta resolver el problema.</p>',
                    "Pruebas técnicas para ubicar dónde está la falla\nReclamo y seguimiento directo con tu proveedor\nTe olvidas del peloteo: nosotros lo resolvemos de principio a fin"),
                $c('data', 'Pérdida de datos y virus', 'rose', 'Se malogra una PC o entra un virus y se pierden tus archivos',
                    'Un equipo se llena de virus o se daña el disco duro y recién en ese momento descubren que las copias de seguridad no se estaban guardando bien.',
                    'UCO360 vigila y prueba tus backups cada día.',
                    '<p>Revisamos todos los días que las copias de seguridad de tus servidores, sistemas y carpetas importantes se hayan guardado bien. Si hay un error, lo corregimos en el día.</p><p>También hacemos pruebas periódicas de recuperación para comprobar que, si algún día se daña un equipo o entra un virus, tu información vuelve a estar lista.</p>',
                    "Copias de seguridad vigiladas cada día\nPruebas reales de recuperación de archivos\nDefensa activa contra virus y estafas"),
                $c('lock', 'Fuga de información', 'amber', 'Se retira un trabajador y sigue entrando a correos y carteras de clientes',
                    'Nadie bloquea sus cuentas el día que se retira y la gerencia ni siquiera tiene el control de las contraseñas de sus propios servidores o correos.',
                    'UCO360 bloquea accesos al instante y custodia tus claves.',
                    '<p>Guardamos las claves de tu empresa en un lugar seguro y bloqueamos al instante los accesos cuando un trabajador se retira.</p><p>Así ningún ex trabajador se lleva ni sigue viendo la información de tu negocio.</p>',
                    "Cierre inmediato de correo, claves y sistema en las salidas de personal\nClaves de tu empresa custodiadas en un lugar seguro\nControl de accesos para la gerencia"),
                $c('receipt', 'Gastos sin control', 'amber', 'Compras de equipos a última hora sin saber qué tienes realmente',
                    'Cada mes aparecen cobros sorpresa o compras urgentes de equipos y licencias sin que nadie valide técnicamente si era la mejor opción.',
                    'UCO360 mantiene tu inventario al día y planifica tus compras.',
                    '<p>Sabes exactamente cuántas computadoras, servidores, equipos y licencias tiene tu empresa, quién usa cada equipo y en qué local se encuentra.</p><p>Te avisamos antes de que venzan tus licencias, garantías o dominios y revisamos las cotizaciones de proveedores para que compres solo lo necesario.</p>',
                    "Inventario actualizado al detalle\nAviso a tiempo de vencimientos y renovaciones\nRevisión técnica de cotizaciones antes de comprar"),
            ],
        ];
    }
}
