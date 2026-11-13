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
    /** @return array<string, mixed> */
    public static function quote(): array
    {
        return [
            'title' => '¿Cuánto cuesta UCO360 para tu empresa?',
            'subtitle' => 'Elige tus equipos y mira tu tarifa mensual:',
            'in_hero' => true,
            'uco_price' => 50,
            'min_price' => 1500,
            'currency' => 'S/',
            'badge_label' => 'Servicio integral',
            'from_label' => 'Desde',
            'unit_label' => '/ mes',
            'presets' => "15 PC · 1 local
30 PC · 2 locales
60 PC · 3 locales",
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
            'uco_label' => 'UCO',
            'clear_label' => 'Poner en 0',
            'all_label' => 'Todos ({n})',
            'units_label' => 'Unidades elegidas: {n}',
            'empty_label' => 'Todavía no elegiste equipos.',
            'name_label' => 'Nombre completo *',
            'company_label' => 'RUC o nombre de tu empresa *',
            'phone_label' => 'Número de WhatsApp *',
            'error_name' => 'Escribe tu nombre.',
            'error_company' => 'Escribe el RUC o el nombre de tu empresa.',
            'error_phone' => 'Escribe tu número de WhatsApp.',
            'sending_label' => 'Enviando…',
            'summary_prefix' => 'Cotizador (referencial):',
        ];
    }

    /** @return list<array<string, mixed>> Peso UCO según la tabla oficial del PDF. */
    public static function devices(): array
    {
        $d = fn (string $name, string $hint, string $group, float $weight, int $qty, string $plans) => [
            'name' => $name, 'hint' => $hint, 'group' => $group, 'weight' => $weight, 'qty' => $qty, 'preset_qty' => $plans,
        ];

        return [
            $d('PC / Laptop', 'Recepción, oficinas, cajas', 'Principales', 1.00, 15, '15, 30, 60'),
            $d('Licencia Office 365', 'Cuentas de correo del personal', 'Principales', 0.05, 15, '15, 30, 60'),
            $d('Sede / Site', 'Oficinas, hoteles, sucursales o almacenes', 'Principales', 2.00, 1, '1, 2, 3'),
            $d('Servidor físico / VM', 'Donde corre tu sistema o tus archivos', 'Principales', 2.00, 1, '1, 1, 2'),
            $d('Impresora', 'Impresoras de red o de facturación', 'Principales', 0.50, 2, '2, 3, 5'),
            $d('Teléfono IP / Softphone', 'Anexos de oficina o recepción', 'Principales', 0.50, 4, '4, 8, 15'),
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
