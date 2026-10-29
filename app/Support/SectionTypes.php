<?php

namespace App\Support;

/**
 * Catalogo de secciones de la landing. Cada tipo declara sus campos; ese mismo
 * esquema valida lo que llega del panel y genera el formulario de edicion.
 */
class SectionTypes
{
    public const ALIGN = ['left' => 'Izquierda', 'center' => 'Centro', 'right' => 'Derecha'];

    public const PADDING = ['sm' => 'Compacto', 'md' => 'Normal', 'lg' => 'Amplio'];

    public const WIDTH = ['narrow' => 'Angosto', 'normal' => 'Normal', 'wide' => 'Ancho'];

    /** Colores del tema que una seccion, el navbar o el pie pueden usar por nombre (siguen al tema si este cambia). */
    public const COLOR_TOKENS = [
        'background' => 'Fondo de la página',
        'surface' => 'Fondo de tarjetas',
        'primary' => 'Color principal',
        'accent' => 'Color de apoyo',
        'dark' => 'Fondo oscuro',
        'text' => 'Texto',
        'muted' => 'Texto secundario',
        'on_primary' => 'Texto sobre el principal',
        'on_dark' => 'Texto sobre fondo oscuro',
    ];

    public const IMAGE_POSITION = ['right' => 'A la derecha', 'left' => 'A la izquierda', 'top' => 'Arriba'];

    /** @return array<string, array{label: string, description: string, content: array, style: array, defaults: array}> */
    public static function all(): array
    {
        return [
            'hero' => [
                'label' => 'Portada',
                'description' => 'Titular principal, texto de apoyo, botones e imagen.',
                'content' => [
                    self::text('title', 'Titular', 200),
                    self::textarea('subtitle', 'Texto de apoyo'),
                    self::cta('primary_cta', 'Botón principal'),
                    self::cta('secondary_cta', 'Botón secundario'),
                    self::image('image', 'Imagen'),
                    self::text('image_alt', 'Descripción de la imagen'),
                    self::text('note', 'Estaciones de la línea (sepáralas con ·)'),
                ],
                'style' => [self::select('image_position', 'Posición de la imagen', SectionTypes::IMAGE_POSITION)],
                'defaults' => [
                    'title' => 'Titular de la campaña', 'subtitle' => '',
                    'primary_cta' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
                    'secondary_cta' => ['label' => '', 'action' => 'whatsapp', 'value' => ''],
                    'image' => null, 'image_alt' => '', 'note' => '',
                ],
            ],
            'comparison' => [
                'label' => 'Comparativa',
                'description' => 'Tabla de dos columnas: antes y después, o competencia contra tu servicio.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('subtitle', 'Texto de apoyo'),
                    self::text('left_label', 'Encabezado columna izquierda'),
                    self::text('right_label', 'Encabezado columna derecha'),
                    self::list('rows', 'Filas', [
                        self::text('topic', 'Tema'),
                        self::textarea('left', 'Columna izquierda'),
                        self::textarea('right', 'Columna derecha'),
                    ], 'topic'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Comparativa', 'subtitle' => '', 'left_label' => 'Antes', 'right_label' => 'Con nosotros',
                    'rows' => [['topic' => 'Tema', 'left' => '', 'right' => '']],
                ],
            ],
            'features' => [
                'label' => 'Tarjetas',
                'description' => 'Beneficios, pilares o entregables en tarjetas.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('subtitle', 'Texto de apoyo'),
                    self::select('columns', 'Columnas', ['2' => '2', '3' => '3', '4' => '4']),
                    self::list('items', 'Tarjetas', [
                        self::text('badge', 'Etiqueta (opcional)'),
                        self::text('title', 'Título'),
                        self::textarea('text', 'Texto'),
                    ], 'title'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Beneficios', 'subtitle' => '', 'columns' => '3',
                    'items' => [['badge' => '', 'title' => 'Beneficio', 'text' => '']],
                ],
            ],
            'steps' => [
                'label' => 'Pasos',
                'description' => 'Cómo funciona, en pasos numerados.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('subtitle', 'Texto de apoyo'),
                    self::list('items', 'Pasos', [
                        self::text('title', 'Título'),
                        self::textarea('text', 'Texto'),
                    ], 'title'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Cómo funciona', 'subtitle' => '',
                    'items' => [['title' => 'Paso 1', 'text' => '']],
                ],
            ],
            'packages' => [
                'label' => 'Paquetes',
                'description' => 'Planes o paquetes con lo que incluye cada uno.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('subtitle', 'Texto de apoyo'),
                    self::list('items', 'Paquetes', [
                        self::text('name', 'Nombre'),
                        self::text('tagline', 'Frase corta'),
                        self::text('price_label', 'Precio o llamado (ej. "Desde S/ 0" o "Cotiza")'),
                        self::textarea('features', 'Incluye (una línea por punto)'),
                        self::text('cta_label', 'Texto del botón'),
                        self::toggle('highlighted', 'Destacar este paquete'),
                    ], 'name'),
                    self::text('note', 'Nota al pie'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Paquetes', 'subtitle' => '', 'note' => '',
                    'items' => [[
                        'name' => 'Paquete', 'tagline' => '', 'price_label' => 'Cotiza con un diagnóstico',
                        'features' => '', 'cta_label' => 'Solicitar propuesta', 'highlighted' => false,
                    ]],
                ],
            ],
            'proof' => [
                'label' => 'Prueba social',
                'description' => 'Cifras reales y testimonios. Úsala solo con datos verificables.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::list('stats', 'Cifras', [
                        self::text('value', 'Valor (ej. 120+)'),
                        self::text('label', 'Descripción'),
                    ], 'value'),
                    self::list('quotes', 'Testimonios', [
                        self::textarea('text', 'Testimonio'),
                        self::text('author', 'Nombre'),
                        self::text('role', 'Cargo y empresa'),
                    ], 'author'),
                ],
                'style' => [],
                'defaults' => ['title' => 'Empresas que confían en nosotros', 'stats' => [], 'quotes' => []],
            ],
            'faq' => [
                'label' => 'Preguntas frecuentes',
                'description' => 'Preguntas y respuestas desplegables.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::list('items', 'Preguntas', [
                        self::text('q', 'Pregunta'),
                        self::textarea('a', 'Respuesta'),
                    ], 'q'),
                ],
                'style' => [],
                'defaults' => ['title' => 'Preguntas frecuentes', 'items' => [['q' => 'Pregunta', 'a' => '']]],
            ],
            'text' => [
                'label' => 'Texto libre',
                'description' => 'Un título y un bloque de texto, con imagen opcional.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('body', 'Texto'),
                    self::image('image', 'Imagen'),
                    self::text('image_alt', 'Descripción de la imagen'),
                ],
                'style' => [self::select('image_position', 'Posición de la imagen', SectionTypes::IMAGE_POSITION)],
                'defaults' => ['title' => 'Título', 'body' => '', 'image' => null, 'image_alt' => ''],
            ],
            'cta' => [
                'label' => 'Llamado final',
                'description' => 'Cierre con botón y formulario de contacto.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::textarea('text', 'Texto'),
                    self::toggle('show_form', 'Mostrar formulario de contacto'),
                    self::toggle('show_contact', 'Mostrar datos de contacto'),
                    self::text('form_button', 'Texto del botón del formulario'),
                    self::cta('button', 'Botón adicional'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Hablemos', 'text' => '', 'show_form' => true, 'show_contact' => true,
                    'form_button' => 'Solicitar diagnóstico',
                    'button' => ['label' => '', 'action' => 'whatsapp', 'value' => ''],
                ],
            ],
        ];
    }

    /** Campos de estilo comunes a todas las secciones. */
    public static function commonStyle(): array
    {
        return [
            self::color('bg_color', 'Color de fondo'),
            self::color('text_color', 'Color del texto'),
            self::color('accent_color', 'Color de acento'),
            self::select('align', 'Alineación', self::ALIGN),
            self::select('padding', 'Espacio vertical', self::PADDING),
            self::select('width', 'Ancho del contenido', self::WIDTH),
        ];
    }

    public static function defaultStyle(): array
    {
        return [
            'bg_color' => null, 'text_color' => null, 'accent_color' => null,
            'align' => 'left', 'padding' => 'md', 'width' => 'normal', 'image_position' => 'right',
        ];
    }

    public static function keys(): array
    {
        return array_keys(self::all());
    }

    /** Esquema listo para el frontend (tipos + campos de contenido y estilo). */
    public static function schemaForClient(): array
    {
        $out = [];
        foreach (self::all() as $type => $def) {
            $out[$type] = [
                'label' => $def['label'],
                'description' => $def['description'],
                'content' => $def['content'],
                'style' => array_merge(self::commonStyle(), $def['style']),
                'defaults' => $def['defaults'],
            ];
        }

        return $out;
    }

    // ---- Saneado -----------------------------------------------------------

    /** Conserva solo los campos del esquema y fuerza sus tipos. */
    public static function sanitizeContent(string $type, array $input): array
    {
        $def = self::all()[$type] ?? null;
        if (! $def) {
            return [];
        }

        return self::sanitizeFields($def['content'], $input);
    }

    public static function sanitizeStyle(string $type, array $input): array
    {
        $def = self::all()[$type] ?? ['style' => []];
        $fields = array_values(array_filter(
            array_merge(self::commonStyle(), $def['style']),
            fn ($f) => array_key_exists($f['key'], $input),
        ));
        $clean = self::sanitizeFields($fields, $input);

        return array_replace(self::defaultStyle(), array_filter($clean, fn ($v) => $v !== ''));
    }

    private static function sanitizeFields(array $fields, array $input): array
    {
        $out = [];
        foreach ($fields as $f) {
            $key = $f['key'];
            $value = $input[$key] ?? null;
            $out[$key] = match ($f['type']) {
                'text' => self::str($value, $f['max'] ?? 300),
                'textarea' => self::str($value, 4000),
                'toggle' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'select' => array_key_exists((string) $value, $f['options']) ? (string) $value : (string) array_key_first($f['options']),
                'color' => self::color_value($value, true),
                'image' => self::imageUrl($value),
                'cta' => self::sanitizeCta($value),
                'list' => self::sanitizeList($f, $value),
                default => null,
            };
        }

        return $out;
    }

    private static function sanitizeList(array $field, mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return collect($value)->take(30)
            ->filter(fn ($item) => is_array($item))
            ->map(fn ($item) => self::sanitizeFields($field['fields'], $item))
            ->values()->all();
    }

    public static function sanitizeCta(mixed $value): array
    {
        $value = is_array($value) ? $value : [];
        $action = (string) ($value['action'] ?? 'lead_form');

        return [
            'label' => self::str($value['label'] ?? '', 80),
            'action' => array_key_exists($action, SiteDefaults::CTA_ACTIONS) ? $action : 'lead_form',
            'value' => self::str($value['value'] ?? '', 500),
        ];
    }

    public static function str(mixed $value, int $max = 300): string
    {
        return is_scalar($value) ? mb_substr(trim((string) $value), 0, $max) : '';
    }

    /** Color en #RRGGBB o, si se permite, el nombre de un color del tema. */
    public static function color_value(mixed $value, bool $tokens = false): ?string
    {
        if (! is_string($value)) {
            return null;
        }
        if (preg_match('/^#[0-9a-fA-F]{6}$/', $value)) {
            return strtolower($value);
        }

        return $tokens && array_key_exists($value, self::COLOR_TOKENS) ? $value : null;
    }

    public static function imageUrl(mixed $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        return (preg_match('#^/(uploads|brand|images)/[A-Za-z0-9._/-]+$#', $value) && ! str_contains($value, '..')) || preg_match('#^https://#i', $value)
            ? mb_substr($value, 0, 500)
            : null;
    }

    // ---- Constructores de campos -------------------------------------------

    private static function text(string $key, string $label, int $max = 300): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'text', 'max' => $max];
    }

    private static function textarea(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'textarea'];
    }

    private static function toggle(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'toggle'];
    }

    private static function image(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'image'];
    }

    private static function color(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'color'];
    }

    private static function cta(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'cta', 'actions' => SiteDefaults::CTA_ACTIONS];
    }

    private static function select(string $key, string $label, array $options): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'select', 'options' => $options];
    }

    private static function list(string $key, string $label, array $fields, string $itemLabel): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'list', 'fields' => $fields, 'itemLabel' => $itemLabel];
    }
}
