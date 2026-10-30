<?php

namespace App\Support;

/**
 * Valores por defecto de los ajustes globales del sitio. Lo que el panel guarda
 * se mezcla encima de estos valores, asi que siempre hay un resultado completo.
 */
class SiteDefaults
{
    public const THEME_COLORS = [
        'primary' => 'Color principal (botones y acentos)',
        'on_primary' => 'Texto sobre el color principal',
        'accent' => 'Color de apoyo',
        'background' => 'Fondo de la página',
        'surface' => 'Fondo de tarjetas',
        'text' => 'Color del texto',
        'muted' => 'Texto secundario',
        'dark' => 'Fondo oscuro (secciones destacadas)',
        'on_dark' => 'Texto sobre fondo oscuro',
    ];

    public const FONTS = [
        'system' => 'Sistema (sin descarga)',
        'Manrope' => 'Manrope',
        'Sora' => 'Sora',
        'Figtree' => 'Figtree',
        'Onest' => 'Onest',
        'Bricolage Grotesque' => 'Bricolage Grotesque',
        'Lexend' => 'Lexend',
        'Public Sans' => 'Public Sans',
        'Work Sans' => 'Work Sans',
        'Archivo' => 'Archivo',
        'Source Serif 4' => 'Source Serif 4',
    ];

    public const MOTIONS = ['full' => 'Completas', 'subtle' => 'Suaves (solo aparecer)', 'none' => 'Ninguna'];

    public const RADII = ['none' => 'Rectos', 'sm' => 'Suaves', 'md' => 'Medios', 'lg' => 'Redondeados', 'full' => 'Píldora'];

    public const CTA_ACTIONS = [
        'lead_form' => 'Ir al formulario de contacto',
        'whatsapp' => 'Abrir WhatsApp',
        'phone' => 'Llamar por teléfono',
        'email' => 'Escribir un correo',
        'anchor' => 'Ir a una sección',
        'url' => 'Abrir un enlace',
    ];

    /** @return array<string, mixed> */
    public static function for(string $key): array
    {
        return match ($key) {
            'theme' => self::theme(),
            'navbar' => self::navbar(),
            'contact' => self::contact(),
            'footer' => self::footer(),
            default => [],
        };
    }

    public static function keys(): array
    {
        return ['theme', 'navbar', 'contact', 'footer'];
    }

    public static function theme(): array
    {
        // Paleta del brochure de UCO360 (azul, naranja y azul noche); editable desde el panel.
        return [
            'primary' => '#1c53ee',
            'on_primary' => '#ffffff',
            'accent' => '#ff9c34',
            'background' => '#ffffff',
            'surface' => '#e8f9ff',
            'text' => '#161443',
            'muted' => '#334155',
            'dark' => '#161443',
            'on_dark' => '#ffffff',
            'heading_font' => 'Sora',
            'body_font' => 'Public Sans',
            'radius' => 'md',
            'motion' => 'full',
        ];
    }

    public static function navbar(): array
    {
        return [
            'brand_text' => 'UCO360',
            'brand_sub' => 'by PROINNOVATEC',
            'logo' => '/brand/uco360-logo.png',
            'logo_position' => 'left',
            'links_mode' => 'auto',
            'links_align' => 'right',
            'links' => [],
            'show_cta' => true,
            'cta' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
            'bg_color' => null,
            'text_color' => null,
            'sticky' => true,
            'border' => true,
        ];
    }

    public static function contact(): array
    {
        return [
            'whatsapp' => '970 855 741',
            'whatsapp_message' => 'Hola, quiero agendar un diagnóstico de TI para mi empresa.',
            'phone' => '+511 748-3615',
            'email' => 'ventas@proinnovatec.com',
            'address' => 'Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro, Lima',
            'website' => 'www.proinnovatec.com',
            // Vacíos = el mapa y el enlace se arman con la dirección. Se llenan para una ubicación exacta.
            'map_url' => '',
            'map_embed' => '',
            // Se calcula sola al guardar el enlace de Google Maps («lat,lng»): centra el mapa en el punto exacto.
            'map_coords' => '',
        ];
    }

    public static function footer(): array
    {
        return [
            'text' => 'UCO360 · Tu área de TI externa',
            'legal' => 'PROINNOVATEC by Grupo CAME',
            'show_contact' => false,
            'bg_color' => null,
            'text_color' => null,
        ];
    }

    /**
     * Mezcla recursiva en la que las listas se reemplazan completas
     * (array_replace_recursive mezclaria indice por indice).
     *
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public static function merge(array $defaults, array $overrides): array
    {
        foreach ($overrides as $key => $value) {
            if (is_array($value) && isset($defaults[$key]) && is_array($defaults[$key])
                && ! array_is_list($defaults[$key]) && ! array_is_list($value)) {
                $defaults[$key] = self::merge($defaults[$key], $value);
            } else {
                $defaults[$key] = $value;
            }
        }

        return $defaults;
    }
}
