<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\FormDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Lleva el formulario de contacto de una campaña ya creada al diseño «Solicita tu diagnóstico inicial» (nombre, empresa,
 * WhatsApp, consulta, casilla de consentimiento y botón «Continuar por WhatsApp»).
 *  - Sin campos guardados: se agregan todos.
 *  - Con los campos de la versión anterior sin tocar: se reemplazan por los nuevos (y sus textos, si tampoco se tocaron).
 *  - Con campos que ya se personalizaron: no se cambian; solo se agregan los ajustes nuevos en modo «solo guardar».
 * Se puede repetir: no pisa lo editado.
 */
class LeadFormSeeder extends Seeder
{
    private const NEW_KEYS = ['form_mode', 'form_consent', 'form_consent_link_label', 'form_consent_url', 'form_footnote'];

    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        foreach ($campaign?->sections()->where('type', 'cta')->get() ?? [] as $section) {
            $content = $section->content ?? [];
            $defaults = FormDefaults::cta();

            if (! array_key_exists('form_fields', $content)) {
                // Lo que ya estaba guardado (por ejemplo el texto del botón) se respeta.
                $merged = [...$defaults, ...array_intersect_key($content, ['form_button' => 1]), ...array_diff_key($content, $defaults)];
                $section->update(['content' => SectionTypes::sanitizeContent('cta', $merged)]);

                continue;
            }

            $changed = false;

            if ($this->isPreviousFactory($content['form_fields'] ?? [])) {
                $content['form_fields'] = $defaults['form_fields'];
                foreach (FormDefaults::previous()['texts'] as $key => $old) {
                    if (($content[$key] ?? null) === $old) {
                        $content[$key] = $defaults[$key];
                    }
                }
                foreach (self::NEW_KEYS as $key) {
                    $content[$key] ??= $defaults[$key];
                }
                $changed = true;
            } else {
                // Formulario personalizado: se conserva tal cual, sin pasar a WhatsApp ni pedir casilla.
                $neutral = ['form_mode' => 'save', 'form_consent' => '', 'form_consent_link_label' => '', 'form_consent_url' => '', 'form_footnote' => ''];
                foreach ($neutral as $key => $value) {
                    if (! array_key_exists($key, $content)) {
                        $content[$key] = $value;
                        $changed = true;
                    }
                }
            }

            if ($changed) {
                $section->update(['content' => SectionTypes::sanitizeContent('cta', $content)]);
            }
        }
    }

    /** ¿Son los campos de fábrica de la versión anterior (nombre, empresa, celular, correo, dos preguntas y mensaje)? */
    private function isPreviousFactory(array $fields): bool
    {
        $kinds = array_column($fields, 'kind');

        return $kinds === ['name', 'company', 'phone', 'email', 'choice', 'choice', 'message']
            && ($fields[0]['label'] ?? '') === 'Nombre completo'
            && ($fields[4]['label'] ?? '') === '¿Cómo ven sus equipos hoy?';
    }
}
