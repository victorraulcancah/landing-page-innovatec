<?php

namespace App\Support;

/**
 * Textos y campos iniciales del formulario «Agenda tu diagnóstico». Solo se usan para llenar la base de datos la
 * primera vez (seeders) y como respaldo si una campaña antigua no tiene los campos guardados. Después todo se
 * edita en el panel (sección «Llamado final») y se lee de la base de datos.
 */
class FormDefaults
{
    /** Tipos de campo que se pueden elegir en el panel. */
    public const KINDS = [
        'name' => 'Nombre (siempre obligatorio)',
        'company' => 'Empresa o RUC',
        'phone' => 'Teléfono o WhatsApp',
        'email' => 'Correo electrónico',
        'message' => 'Mensaje (texto largo)',
        'choice' => 'Pregunta con opciones (lista desplegable)',
        'text' => 'Pregunta de texto corto',
    ];

    /** @return array<string, mixed> */
    public static function cta(): array
    {
        return [
            'form_title' => 'Agenda tu diagnóstico',
            'form_note' => 'Déjanos tus datos y nos comunicaremos contigo hoy mismo.',
            'form_button' => 'Solicitar diagnóstico',
            'thanks_title' => '¡Gracias! Recibimos tus datos.',
            'thanks_text' => 'Nuestro equipo te escribirá para coordinar tu reunión de diagnóstico.',
            'form_fields' => self::fields(),
        ];
    }

    /** @return list<array<string, mixed>> */
    public static function fields(): array
    {
        $f = fn (string $kind, string $label, string $placeholder = '', string $options = '', bool $required = false) => compact('kind', 'label', 'placeholder', 'options', 'required');

        return [
            $f('name', 'Nombre completo', 'Tu nombre y apellido', '', true),
            $f('company', 'RUC o nombre de tu empresa', 'RUC o nombre comercial', '', true),
            $f('phone', 'Celular o WhatsApp', '999 999 999', '', true),
            $f('email', 'Correo electrónico', 'correo@tuempresa.com', '', true),
            $f('choice', '¿Cómo ven sus equipos hoy?', '', "Llamamos a un técnico cuando algo falla\nTenemos soporte pero no se da abasto\nNo tenemos a nadie fijo viendo esto\nQueremos cambiar de proveedor actual"),
            $f('choice', 'Tamaño aproximado', '', "De 10 a 25 computadoras\nDe 26 a 60 computadoras\nDe 61 a 120 computadoras\nMás de 120 computadoras / Varios locales"),
            $f('message', '¿Qué necesitas resolver? (opcional)', 'Ej. Mejorar el Wi-Fi, evitar cortes en facturación, asegurar nuestras copias…'),
        ];
    }
}
