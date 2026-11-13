<?php

namespace App\Support;

/**
 * Datos de fábrica de la sección «Situaciones del día a día» (los problemas cotidianos que UCO360 resuelve).
 * Todo se edita y se amplía luego desde el panel.
 */
class PainsDefaults
{
    /** @return array<string, mixed> */
    public static function pains(): array
    {
        $c = fn (string $icon, string $tag, string $tone, string $title, string $text, string $solution) => ['icon' => $icon, 'image' => null, 'tag' => $tag, 'tone' => $tone, 'title' => $title, 'text' => $text, 'solution' => $solution];

        return [
            'eyebrow' => '¿Te suena familiar en tu día a día?',
            'title' => 'No necesitas saber de tecnología para notar cuando algo está frenando tu empresa',
            'subtitle' => 'Cuando dependes de un técnico por horas o de alguien que no puede saber de todo a la vez, tu negocio sufre estos problemas todos los meses:',
            'columns' => '3',
            'items' => [
                $c('hourglass', 'Operación detenida', 'rose', 'La recepción o facturación se paraliza y el técnico «llega en la tarde»', 'Tienes clientes o huéspedes esperando en recepción, cajas sin poder facturar o pedidos detenidos, y el técnico externo no contesta porque está ocupado con otro cliente.', 'UCO360 responde al instante por WhatsApp.'),
                $c('wifi', 'Fallas de red y Wi-Fi', 'amber', 'El Wi-Fi se corta a cada rato y el sistema se pone lento', 'Un soporte básico puede arreglar una impresora, pero no tiene la especialidad para configurar bien toda la red, antenas Wi-Fi y servidores de tu hotel, oficina o almacén.', 'UCO360 optimiza toda tu red y servidores.'),
                $c('phone', 'Desgaste con proveedores', 'rose', 'El de Internet culpa al sistema y el del sistema culpa al Internet', 'Cuando algo falla, tus proveedores se culpan entre sí y tú o tu administración pierden horas al teléfono haciendo de intermediarios sin que nadie resuelva.', 'UCO360 asume la gestión total de tus proveedores.'),
                $c('data', 'Pérdida de datos y virus', 'rose', 'Se malogra una PC o entra un virus y se pierden tus archivos', 'Un equipo se llena de virus o se daña el disco duro y recién en ese momento descubren que las copias de seguridad no se estaban guardando bien.', 'UCO360 vigila y prueba tus backups cada día.'),
                $c('lock', 'Fuga de información', 'amber', 'Se retira un trabajador y sigue entrando a correos y carteras de clientes', 'Nadie bloquea sus cuentas el día que se retira y la gerencia ni siquiera tiene el control de las contraseñas de sus propios servidores o correos.', 'UCO360 bloquea accesos al instante y custodia tus claves.'),
                $c('receipt', 'Gastos sin control', 'amber', 'Compras de equipos a última hora sin saber qué tienes realmente', 'Cada mes aparecen cobros sorpresa o compras urgentes de equipos y licencias sin que nadie valide técnicamente si era la mejor opción.', 'UCO360 mantiene tu inventario al día y planifica tus compras.'),
            ],
        ];
    }
}
