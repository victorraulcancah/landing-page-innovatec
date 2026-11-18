<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\PainsDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Agrega a una campaña ya creada la sección «Situaciones del día a día», justo después de la franja de servicios
 * (o de la portada, si no hay franja). Si la sección ya existe, no la duplica ni pisa lo editado: solo completa lo
 * que le falta, como el detalle que se ve al abrir cada tarjeta. Se puede repetir.
 */
class PainsSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign) {
            return;
        }

        $existing = $campaign->sections()->where('type', 'pains')->first();
        if ($existing) {
            $this->completar($existing);

            return;
        }

        $after = $campaign->sections()->where('type', 'marquee')->min('position')
            ?? $campaign->sections()->where('type', 'hero')->min('position');
        if ($after === null) {
            return;
        }

        $campaign->sections()->where('position', '>', $after)->increment('position');
        $campaign->sections()->create([
            'type' => 'pains',
            'position' => (int) $after + 1,
            'is_visible' => true,
            'anchor' => 'situaciones',
            'nav_label' => '¿Te pasa esto?',
            'content' => SectionTypes::sanitizeContent('pains', PainsDefaults::pains()),
            'style' => SectionTypes::sanitizeStyle('pains', ['align' => 'center']),
        ]);
    }

    /** Agrega el detalle de las tarjetas y los textos del botón que todavía no existen, sin tocar lo ya editado. */
    private function completar($section): void
    {
        $content = $section->content ?? [];
        $defaults = PainsDefaults::pains();
        $changed = false;

        foreach (['more_label', 'modal_cta'] as $key) {
            if (! array_key_exists($key, $content)) {
                $content[$key] = $defaults[$key];
                $changed = true;
            }
        }

        $items = $content['items'] ?? [];
        foreach ($items as $i => $item) {
            if (array_key_exists('detail_text', $item)) {
                continue;
            }
            // Solo se completa si la tarjeta sigue siendo la de fábrica en esa posición.
            $factory = $defaults['items'][$i] ?? null;
            if ($factory && ($item['title'] ?? null) === $factory['title']) {
                $items[$i] = [...$item, ...array_intersect_key($factory, array_flip(['detail_text', 'detail_points', 'gallery', 'video', 'docs']))];
                $changed = true;
            }
        }
        $content['items'] = $items;

        if ($changed) {
            $section->update(['content' => SectionTypes::sanitizeContent('pains', $content)]);
        }
    }
}
