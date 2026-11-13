<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\QuoteDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Lleva a una campaña ya creada el cotizador de tarifa en el panel de la portada, en lugar de la calculadora de
 * caídas, y agrega a la portada los rubros (sin cambiar sus textos). Se puede repetir: no duplica nada ni pisa lo ya
 * editado. La calculadora no se borra: queda oculta para poder volver a mostrarla.
 */
class CotizadorSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign) {
            return;
        }

        $this->cotizador($campaign);
        $this->calculadora($campaign);
        $this->rubros($campaign);
    }

    /** Agrega los rubros bajo los botones de la portada solo si todavía no los tiene (no pisa lo que se editó). */
    private function rubros(Campaign $campaign): void
    {
        $hero = $campaign->sections()->where('type', 'hero')->orderBy('position')->first();
        if (! $hero || array_key_exists('audience', $hero->content ?? [])) {
            return;
        }

        $hero->update(['content' => SectionTypes::sanitizeContent('hero', [...$hero->content, ...QuoteDefaults::audience()])]);
    }

    private function cotizador(Campaign $campaign): void
    {
        if ($campaign->sections()->where('type', 'quote')->exists()) {
            return;
        }

        $after = (int) $campaign->sections()->where('type', 'hero')->min('position');
        if ($after === 0) {
            return;
        }

        $campaign->sections()->where('position', '>', $after)->increment('position');
        $campaign->sections()->create([
            'type' => 'quote',
            'position' => $after + 1,
            'is_visible' => true,
            'anchor' => 'cotizador',
            'nav_label' => 'Cotizador',
            'content' => SectionTypes::sanitizeContent('quote', QuoteDefaults::quote()),
            'style' => SectionTypes::sanitizeStyle('quote', []),
        ]);
    }

    /** La calculadora que estaba en la portada pasa a ser una sección oculta (no se pierde). */
    private function calculadora(Campaign $campaign): void
    {
        $quoteInHero = $campaign->sections()->where('type', 'quote')->get()->contains(fn ($s) => ($s->content['in_hero'] ?? false) === true);
        if (! $quoteInHero) {
            return;
        }

        foreach ($campaign->sections()->where('type', 'calculator')->get() as $calc) {
            if (($calc->content['in_hero'] ?? false) === true) {
                $calc->update([
                    'is_visible' => false,
                    'content' => SectionTypes::sanitizeContent('calculator', [...$calc->content, 'in_hero' => false]),
                ]);
            }
        }
    }
}
