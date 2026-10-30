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
                    self::richline('title', 'Titular', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
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
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
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
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
                    self::select('columns', 'Columnas', ['2' => '2', '3' => '3', '4' => '4']),
                    self::list('items', 'Tarjetas', [
                        self::text('badge', 'Etiqueta (opcional)'),
                        self::text('title', 'Título'),
                        self::richtext('text', 'Texto'),
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
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
                    self::list('items', 'Pasos', [
                        self::text('title', 'Título'),
                        self::richtext('text', 'Texto'),
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
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
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
                    self::richline('title', 'Título', 200),
                    self::list('stats', 'Cifras', [
                        self::text('value', 'Valor (ej. 120+)'),
                        self::text('label', 'Descripción'),
                    ], 'value'),
                    self::list('quotes', 'Testimonios', [
                        self::richtext('text', 'Testimonio'),
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
                    self::richline('title', 'Título', 200),
                    self::list('items', 'Preguntas', [
                        self::text('q', 'Pregunta'),
                        self::richtext('a', 'Respuesta'),
                    ], 'q'),
                ],
                'style' => [],
                'defaults' => ['title' => 'Preguntas frecuentes', 'items' => [['q' => 'Pregunta', 'a' => '']]],
            ],
            'text' => [
                'label' => 'Texto libre',
                'description' => 'Un título y un bloque de texto, con imagen opcional.',
                'content' => [
                    self::richline('title', 'Título', 200),
                    self::richtext('body', 'Texto'),
                    self::image('image', 'Imagen'),
                    self::text('image_alt', 'Descripción de la imagen'),
                ],
                'style' => [self::select('image_position', 'Posición de la imagen', SectionTypes::IMAGE_POSITION)],
                'defaults' => ['title' => 'Título', 'body' => '', 'image' => null, 'image_alt' => ''],
            ],
            'promo' => [
                'label' => 'Barra de anuncio',
                'description' => 'Franja superior para la oferta del mes. No ocupa lugar en el orden: siempre va arriba del menú.',
                'content' => [
                    self::text('text', 'Mensaje', 200),
                    self::cta('link', 'Enlace'),
                    self::toggle('dismissible', 'Permitir que el visitante la cierre'),
                ],
                'style' => [],
                'defaults' => [
                    'text' => 'Este mes: agenda tu diagnóstico de TI.',
                    'link' => ['label' => 'Reservar', 'action' => 'lead_form', 'value' => ''],
                    'dismissible' => true,
                ],
            ],
            'calculator' => [
                'label' => 'Calculadora de pérdida',
                'description' => 'Sliders que calculan cuánto cuesta una caída, con simulación en vivo. Puede ir en la portada (reemplaza la foto) o como sección.',
                'content' => [
                    self::text('title', 'Título', 200),
                    self::toggle('in_hero', 'Mostrar dentro de la portada (en lugar de la foto)'),
                    self::text('people_label', 'Primer control: texto'),
                    self::number('people_min', 'Mínimo', 1, 100000),
                    self::number('people_max', 'Máximo', 1, 100000),
                    self::number('people_default', 'Valor inicial', 1, 100000),
                    self::text('people_unit', 'Unidad (ej. personas)', 30),
                    self::text('hours_label', 'Segundo control: texto'),
                    self::number('hours_min', 'Mínimo', 1, 1000),
                    self::number('hours_max', 'Máximo', 1, 1000),
                    self::number('hours_default', 'Valor inicial', 1, 1000),
                    self::text('hours_unit', 'Unidad (ej. horas)', 30),
                    self::text('cost_label', 'Tercer control: texto'),
                    self::number('cost_min', 'Mínimo', 1, 100000),
                    self::number('cost_max', 'Máximo', 1, 100000),
                    self::number('cost_default', 'Valor inicial', 1, 100000),
                    self::text('currency', 'Moneda (ej. S/)', 6),
                    self::text('simulate_label', 'Texto del botón de simulación'),
                    self::text('result_label', 'Texto sobre el resultado'),
                    self::text('year_note', 'Texto bajo el resultado anual'),
                    self::textarea('disclaimer', 'Aviso (qué es este cálculo)'),
                    self::cta('cta', 'Botón final'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => '¿Cuánto te cuesta una caída?', 'in_hero' => false,
                    'people_label' => 'Personas que dejan de trabajar', 'people_min' => 1, 'people_max' => 100, 'people_default' => 20, 'people_unit' => 'personas',
                    'hours_label' => 'Horas de caída al mes (sistema, internet, correo)', 'hours_min' => 1, 'hours_max' => 100, 'hours_default' => 6, 'hours_unit' => 'horas',
                    'cost_label' => 'Costo por persona por hora', 'cost_min' => 5, 'cost_max' => 100, 'cost_default' => 15, 'currency' => 'S/',
                    'simulate_label' => 'Simular caída', 'result_label' => 'Pagas sueldos sin producir:', 'year_note' => 'al año, sin contar ventas perdidas.',
                    'disclaimer' => 'Estimación con los valores que tú ajustas; no es una promesa de ahorro.',
                    'cta' => ['label' => 'Quiero evitar esa pérdida', 'action' => 'lead_form', 'value' => ''],
                ],
            ],
            'quiz' => [
                'label' => 'Autodiagnóstico',
                'description' => 'Lista de situaciones que el visitante marca; muestra su nivel de exposición y lo lleva al formulario con sus respuestas.',
                'content' => [
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
                    self::list('items', 'Situaciones (el visitante marca las que le pasan)', [
                        self::text('text', 'Situación'),
                    ], 'text'),
                    self::textarea('msg_zero', 'Mensaje con 0 marcadas'),
                    self::textarea('msg_low', 'Mensaje con 1 o 2 marcadas'),
                    self::textarea('msg_high', 'Mensaje con 3 o 4 marcadas'),
                    self::textarea('msg_critical', 'Mensaje con 5 o más marcadas'),
                    self::text('cta_label', 'Botón con puntos marcados (usa {n} para la cantidad)'),
                    self::text('cta_empty', 'Botón sin puntos marcados'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => '¿Qué tan expuesta está tu empresa?', 'subtitle' => '',
                    'items' => [['text' => 'Situación']],
                    'msg_zero' => 'Marca lo que se parece a tu empresa y mira tu nivel de exposición.',
                    'msg_low' => 'Exposición moderada: conviene ordenar estos puntos antes de que fallen.',
                    'msg_high' => 'Exposición alta: una falla te tomaría por sorpresa.',
                    'msg_critical' => 'Riesgo crítico: tu empresa depende de la suerte.',
                    'cta_label' => 'Revisar mis {n} puntos con un experto', 'cta_empty' => 'Agenda tu diagnóstico',
                ],
            ],
            'included' => [
                'label' => 'Qué incluye',
                'description' => 'Paneles con lo que recibe el cliente, en listas con marcas, y una franja final.',
                'content' => [
                    self::richline('title', 'Título', 200),
                    self::richtext('subtitle', 'Texto de apoyo'),
                    self::list('items', 'Paneles', [
                        self::text('title', 'Título del panel'),
                        self::textarea('points', 'Puntos (una línea por punto)'),
                    ], 'title'),
                    self::text('footer_title', 'Franja final: título'),
                    self::richtext('footer_text', 'Franja final: texto'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => 'Todo lo que recibes', 'subtitle' => '',
                    'items' => [['title' => 'Panel', 'points' => '']],
                    'footer_title' => '', 'footer_text' => '',
                ],
            ],
            'popup' => [
                'label' => 'Pop-up',
                'description' => 'Aviso emergente que aparece por tiempo, al bajar o al intentar salir. No ocupa lugar en el orden.',
                'content' => [
                    self::text('title', 'Título', 120),
                    self::textarea('text', 'Texto'),
                    self::cta('button', 'Botón'),
                    self::select('trigger', 'Cuándo aparece', ['delay' => 'Después de unos segundos', 'scroll' => 'Al bajar cierto porcentaje', 'exit' => 'Al intentar salir (en celular, por tiempo)']),
                    self::number('seconds', 'Segundos de espera', 3, 600),
                    self::number('scroll_percent', 'Porcentaje de página', 10, 95),
                    self::select('position', 'Ubicación', ['corner' => 'Esquina inferior', 'center' => 'Centro con fondo oscuro']),
                    self::toggle('once', 'Mostrar una sola vez por visita'),
                ],
                'style' => [],
                'defaults' => [
                    'title' => '¿Hablamos?', 'text' => '',
                    'button' => ['label' => 'Agenda tu diagnóstico', 'action' => 'lead_form', 'value' => ''],
                    'trigger' => 'delay', 'seconds' => 30, 'scroll_percent' => 50, 'position' => 'corner', 'once' => true,
                ],
            ],
            'cta' => [
                'label' => 'Llamado final',
                'description' => 'Cierre con botón y formulario de contacto.',
                'content' => [
                    self::richline('title', 'Título', 200),
                    self::richtext('text', 'Texto'),
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
                'richtext' => RichText::clean($value),
                'richline' => RichText::clean($value, true),
                'toggle' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'number' => self::num($value, (float) ($f['min'] ?? 0), (float) ($f['max'] ?? 1000000)),
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

    public static function num(mixed $value, float $min, float $max): int|float
    {
        $n = is_numeric($value) ? (float) $value : $min;
        $n = max($min, min($max, $n));

        return floor($n) == $n ? (int) $n : round($n, 2);
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

    /** Texto con formato (negrita, listas, enlaces, colores, alineación); se limpia al guardar. */
    private static function richtext(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'richtext'];
    }

    /** Una sola línea con formato en línea (negrita, color, resaltado); para titulares. */
    private static function richline(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'richline'];
    }

    private static function number(string $key, string $label, float $min, float $max): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'number', 'min' => $min, 'max' => $max];
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
