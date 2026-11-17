<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\FormDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Agrega al formulario de contacto de una campaña ya creada los campos editables (título, texto, mensaje de
 * agradecimiento y la lista de campos con sus preguntas). No cambia el texto del botón ni nada que ya tengas
 * guardado, y se puede repetir: si la campaña ya tiene los campos, no la toca.
 */
class LeadFormSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        foreach ($campaign?->sections()->where('type', 'cta')->get() ?? [] as $section) {
            $content = $section->content ?? [];
            if (array_key_exists('form_fields', $content)) {
                continue;
            }

            $defaults = FormDefaults::cta();
            // Lo que ya estaba guardado (por ejemplo el texto del botón) se respeta.
            $merged = [...$defaults, ...array_intersect_key($content, ['form_button' => 1]), ...array_diff_key($content, $defaults)];
            $section->update(['content' => SectionTypes::sanitizeContent('cta', $merged)]);
        }
    }
}
