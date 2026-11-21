<?php

namespace App\Support;

/**
 * Textos y campos iniciales del formulario final («Solicita tu diagnóstico inicial»). Solo se usan para llenar la base
 * de datos la primera vez (seeders) y como respaldo si una campaña antigua no tiene los campos guardados. Después todo
 * se edita en el panel (sección «Llamado final») y se lee de la base de datos.
 */
class FormDefaults
{
    /** Tipos de campo que se pueden elegir en el panel. */
    public const KINDS = [
        'name' => 'Nombre (siempre obligatorio)',
        'company' => 'Empresa',
        'phone' => 'Teléfono o WhatsApp',
        'email' => 'Correo electrónico',
        'message' => 'Mensaje (texto largo)',
        'choice' => 'Pregunta con opciones (lista desplegable)',
        'text' => 'Pregunta de texto corto',
    ];

    /** Qué pasa al enviar el formulario (en ambos casos los datos se guardan en Contactos). */
    public const MODES = [
        'whatsapp' => 'Guardar y abrir WhatsApp con el mensaje ya preparado',
        'save' => 'Solo guardar y dar las gracias',
    ];

    /** @return array<string, mixed> */
    public static function cta(): array
    {
        return [
            'form_title' => 'Solicita tu diagnóstico inicial',
            'form_note' => 'La consulta se prepara en WhatsApp. No se envía hasta que confirmes el mensaje.',
            'form_button' => 'Continuar por WhatsApp',
            'form_mode' => 'whatsapp',
            'form_consent' => 'Confirmo que deseo contactar voluntariamente a UCO360 por WhatsApp.',
            'form_consent_link_label' => 'Lee nuestra política de privacidad',
            'form_consent_url' => '',
            'form_footnote' => 'El botón prepara un mensaje que podrás revisar antes de enviarlo.',
            'thanks_title' => '¡Listo! Abre WhatsApp para enviar tu mensaje',
            'thanks_text' => 'Guardamos tus datos y preparamos el mensaje. Si no se abrió solo, usa el botón.',
            'form_fields' => self::fields(),
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function fields(): array
    {
        $f = fn (string $kind, string $label, string $placeholder = '', string $options = '', bool $required = false, bool $full = false) => compact('kind', 'label', 'placeholder', 'options', 'required', 'full');

        return [
            $f('name', 'Tu nombre', 'Nombre y apellido', '', true),
            $f('company', 'Empresa', 'Nombre de tu empresa', '', true),
            $f('phone', 'WhatsApp de contacto', 'Ej.: 987654321', '', true, true),
            $f('message', '¿Qué te preocupa de tu tecnología? (opcional)', 'Ej.: tenemos 20 computadoras, problemas con Wi-Fi y queremos ordenar los equipos', '', false, true),
        ];
    }

    /** Textos y campos de la versión anterior del formulario: el seeder los reconoce para actualizarlos solo si no se tocaron. */
    public static function previous(): array
    {
        $f = fn (string $kind, string $label, string $placeholder = '', string $options = '', bool $required = false) => compact('kind', 'label', 'placeholder', 'options', 'required');

        return [
            'texts' => [
                'form_title' => 'Agenda tu diagnóstico',
                'form_note' => 'Déjanos tus datos y nos comunicaremos contigo hoy mismo.',
                'form_button' => 'Solicitar diagnóstico',
                'thanks_title' => '¡Gracias! Recibimos tus datos.',
                'thanks_text' => 'Nuestro equipo te escribirá para coordinar tu reunión de diagnóstico.',
            ],
            'labels' => ['Nombre completo', 'Nombre de tu empresa', 'Celular o WhatsApp', 'Correo electrónico', '¿Cómo ven sus equipos hoy?', 'Tamaño aproximado', '¿Qué necesitas resolver? (opcional)'],
            'fields' => [
                $f('name', 'Nombre completo', 'Tu nombre y apellido', '', true),
                $f('company', 'Nombre de tu empresa', 'Nombre comercial', '', true),
                $f('phone', 'Celular o WhatsApp', '987654321', '', true),
                $f('email', 'Correo electrónico', 'correo@tuempresa.com', '', true),
            ],
        ];
    }
}
