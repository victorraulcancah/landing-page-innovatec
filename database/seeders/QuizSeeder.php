<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\QuizDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Lleva el autodiagnóstico de una campaña ya creada al diseño con tarjeta de recomendaciones: agrega la recomendación
 * de cada situación de fábrica y los textos de la tarjeta, sin pisar lo que ya se editó. Se puede repetir.
 */
class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        foreach ($campaign?->sections()->where('type', 'quiz')->get() ?? [] as $quiz) {
            $defaults = QuizDefaults::quiz();
            $content = $quiz->content ?? [];
            $changed = false;

            // La recomendación de cada situación de fábrica (se reconoce por su texto).
            $byText = collect($defaults['items'])->keyBy('text');
            foreach ($content['items'] ?? [] as $i => $item) {
                if (($item['recommendation'] ?? '') === '' && isset($byText[$item['text'] ?? ''])) {
                    $content['items'][$i]['recommendation'] = $byText[$item['text']]['recommendation'];
                    $changed = true;
                }
            }

            // Textos de la tarjeta que todavía no existen.
            foreach (['result_eyebrow', 'result_title', 'result_title_one', 'result_intro', 'result_note'] as $key) {
                if (! array_key_exists($key, $content)) {
                    $content[$key] = $defaults[$key];
                    $changed = true;
                }
            }

            // Textos de fábrica del diseño anterior que ya no encajan.
            $old = [
                'cta_label' => ['Revisar mis {n} puntos con un experto', $defaults['cta_label']],
                'msg_zero' => ['Marca lo que se parece a tu empresa y mira tu nivel de exposición.', $defaults['msg_zero']],
            ];
            foreach ($old as $key => [$before, $after]) {
                if (($content[$key] ?? null) === $before) {
                    $content[$key] = $after;
                    $changed = true;
                }
            }

            // Los mensajes por nivel y el título de «lo que marcaste» ya no se usan: al guardar se descartan.
            foreach (['msg_low', 'msg_high', 'msg_critical', 'selected_label'] as $obsolete) {
                $changed = $changed || array_key_exists($obsolete, $content);
            }

            if ($changed) {
                $quiz->update(['content' => SectionTypes::sanitizeContent('quiz', $content)]);
            }
        }
    }
}
