<?php

namespace App\Support;

/**
 * Datos de fábrica del cotizador y de la portada que lo acompaña. Salen de la «Tabla de pesos UCO y guía de cálculo
 * comercial» (1 UCO = S/ 50 al mes; tarifa mensual = máx(Total UCO × 50, S/ 1,500)). Todo se edita luego en el panel.
 *
 * Las cantidades de los planes rápidos y los textos de venta son una propuesta: el PDF solo define pesos y fórmula.
 * Las reglas internas del PDF (contrato, facturación, tolerancia de crecimiento) no se publican.
 */
class QuoteDefaults
{
    public const OLD_HERO_TITLE = 'Cada hora que tu sistema se cae, pagas sueldos que no producen.';

    /** @return array<string, mixed> */
    public static function hero(): array
    {
        return [
            'title' => 'Tú dedícate a hacer crecer tu negocio. <span class="t-accent">Nosotros hacemos que tus sistemas, internet y equipos nunca fallen.</span>',
            'subtitle' => '<p><strong>UCO360 es tu propia Área de TI Externa.</strong> Ponemos a trabajar para tu empresa a un equipo completo de especialistas que atiende a tu personal por WhatsApp, visita tu local cada semana, cuida tus servidores, Wi-Fi y copias de seguridad, y trata directo con tus proveedores por una <strong>tarifa fija mensual desde S/ 1,500</strong>.</p>',
            'highlights' => "Soporte por WhatsApp\nVisita fija semanal\nBackups diarios seguros\nGestión de proveedores",
            'audience_label' => 'Para empresas de cualquier rubro que no pueden detenerse:',
            'audience' => "Hoteles\nComercios y distribuidoras\nIndustrias y almacenes\nClínicas y servicios",
        ];
    }

    /** @return array<string, mixed> */
    public static function quote(): array
    {
        return [
            'title' => '¿Cuánto cuesta UCO360 para tu empresa?',
            'subtitle' => 'Selecciona los equipos de tu negocio y descubre tu tarifa mensual a medida:',
            'in_hero' => true,
            'uco_price' => 50,
            'min_price' => 1500,
            'currency' => 'S/',
            'badge_label' => 'Servicio integral',
            'from_label' => 'Desde',
            'unit_label' => '/ mes',
            'presets' => "15 Computadoras · 1 Local\n30 Computadoras · 2 Locales\n60 Computadoras · 3 Locales",
            'devices' => self::devices(),
            'show_uco' => true,
            'reveal' => 'gate',
            'gate_title' => 'Ingresa tus datos para mostrar el costo mensual de tu empresa en pantalla:',
            'gate_button' => 'Ver el costo mensual para mi empresa',
            'result_label' => 'Tu tarifa mensual referencial',
            'result_unit' => '/ mes + IGV',
            'min_note' => 'Se aplica la tarifa mínima mensual.',
            'benefits' => "Visita presencial fija todas las semanas\nAyuda por WhatsApp para todo tu personal\nCopias de seguridad revisadas a diario\nGestión directa con tus proveedores de Internet y sistema",
            'whatsapp_cta' => ['label' => 'Recibir el detalle por WhatsApp', 'action' => 'whatsapp', 'value' => 'Hola, quiero esta cotización de UCO360.'],
            'diag_cta' => ['label' => 'Agendar mi diagnóstico', 'action' => 'lead_form', 'value' => ''],
            'disclaimer' => 'Tarifa referencial sin IGV. El inventario se valida en el diagnóstico antes de emitir la propuesta.',
        ];
    }

    /** @return list<array<string, mixed>> Peso UCO según la tabla oficial del PDF. */
    public static function devices(): array
    {
        $d = fn (string $name, string $hint, string $group, float $weight, int $qty, string $plans) => [
            'name' => $name, 'hint' => $hint, 'group' => $group, 'weight' => $weight, 'qty' => $qty, 'preset_qty' => $plans,
        ];

        return [
            $d('PC / Laptop', 'Recepción, oficinas, cajas', 'Equipos principales', 1.00, 15, '15, 30, 60'),
            $d('Licencia Office 365', 'Cuentas de correo del personal', 'Equipos principales', 0.05, 15, '15, 30, 60'),
            $d('Sede / Site', 'Oficinas, hoteles, sucursales o almacenes', 'Equipos principales', 2.00, 1, '1, 2, 3'),
            $d('Servidor físico / VM', 'Donde corre tu sistema o tus archivos', 'Equipos principales', 2.00, 1, '1, 1, 2'),
            $d('Impresora', 'Impresoras de red o de facturación', 'Equipos principales', 0.50, 2, '2, 3, 5'),
            $d('Teléfono IP / Softphone', 'Anexos de oficina o recepción', 'Equipos principales', 0.50, 4, '4, 8, 15'),
            $d('Access Point (AP)', 'Antenas Wi-Fi en pisos o áreas', 'Wi-Fi y red', 0.50, 2, '2, 4, 8'),
            $d('Switch', 'Equipos que conectan los cables de red', 'Wi-Fi y red', 0.50, 2, '2, 4, 8'),
            $d('Firewall', 'Protector de tu red de Internet', 'Wi-Fi y red', 1.50, 1, '1, 1, 2'),
            $d('NAS', 'Disco central de respaldo', 'Wi-Fi y red', 1.00, 1, '1, 1, 1'),
            $d('UPS', 'Baterías de respaldo ante cortes de luz', 'Wi-Fi y red', 0.25, 2, '2, 3, 5'),
            $d('Cámara CCTV', 'Cámaras IP o analógicas', 'Cámaras y asistencia', 0.20, 4, '4, 8, 16'),
            $d('DVR / NVR', 'Grabadores de las cámaras', 'Cámaras y asistencia', 0.50, 1, '1, 2, 3'),
            $d('Marcador biométrico', 'Control de asistencia', 'Cámaras y asistencia', 0.50, 1, '1, 2, 3'),
        ];
    }
}
