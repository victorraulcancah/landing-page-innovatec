<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Deja visible la sección de paquetes con montos de EJEMPLO y adelanta el pop-up de la campaña inicial.
 *
 * Es para una base que ya existe (el CampaignSeeder no vuelve a correr). No pisa lo editado en el panel:
 * solo toca los paquetes si siguen con el precio de la semilla, y el pop-up si sigue en 35 segundos.
 * Los montos no son reales: hay que reemplazarlos en el panel antes de compartir la página.
 */
class PreciosEjemploSeeder extends Seeder
{
    public const SEED_PRICE = 'Cotiza con un diagnóstico';

    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign) {
            return;
        }

        $this->paquetes($campaign);
        $this->popup($campaign);
    }

    private function paquetes(Campaign $campaign): void
    {
        $section = $campaign->sections()->where('type', 'packages')->first();
        if (! $section) {
            return;
        }

        $content = $section->content;
        $items = $content['items'] ?? [];
        $untouched = $items !== [] && collect($items)->every(fn ($i) => ($i['price_label'] ?? '') === self::SEED_PRICE);
        if (! $untouched) {
            return;
        }

        $prices = ['Desde S/ 000 al mes', 'Desde S/ 000 al mes', 'Desde S/ 000 al mes'];
        foreach ($items as $n => $item) {
            $items[$n]['price_label'] = $prices[$n] ?? 'Desde S/ 000 al mes';
        }

        $content['items'] = $items;
        $content['note'] = 'Montos de ejemplo: reemplázalos en Campañas → Paquetes antes de compartir la página. La tarifa final se define en el diagnóstico.';

        $section->update([
            'content' => SectionTypes::sanitizeContent('packages', $content),
            'is_visible' => true,
        ]);
    }

    private function popup(Campaign $campaign): void
    {
        $section = $campaign->sections()->where('type', 'popup')->first();
        if (! $section || ($section->content['seconds'] ?? null) !== 35) {
            return;
        }

        $section->update([
            'content' => SectionTypes::sanitizeContent('popup', [...$section->content, 'seconds' => 12]),
        ]);
    }
}
