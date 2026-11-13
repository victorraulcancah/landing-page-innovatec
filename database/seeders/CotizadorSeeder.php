<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\QuoteDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Lleva a una campaña ya creada el cotizador de tarifa en la portada, en lugar de la calculadora de caídas, y los
 * textos nuevos de la portada. Se puede repetir: no duplica el cotizador y no pisa titulares ni textos que ya se
 * editaron en el panel. La calculadora no se borra: queda oculta para poder volver a mostrarla.
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
        $this->portada($campaign);
        $this->calculadora($campaign);
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

    private function portada(Campaign $campaign): void
    {
        $hero = $campaign->sections()->where('type', 'hero')->first();
        if (! $hero) {
            return;
        }

        $content = $hero->content;
        $new = QuoteDefaults::hero();

        // El titular y el texto de apoyo se cambian solo si siguen siendo los de fábrica anteriores.
        if (trim(strip_tags((string) ($content['title'] ?? ''))) === QuoteDefaults::OLD_HERO_TITLE) {
            $content['title'] = $new['title'];
            $content['subtitle'] = $new['subtitle'];
        }

        // Lo que no existía antes se completa solo si está vacío.
        foreach (['highlights', 'audience_label', 'audience'] as $key) {
            if (trim((string) ($content[$key] ?? '')) === '') {
                $content[$key] = $new[$key];
            }
        }

        if ($content !== $hero->content) {
            $hero->update(['content' => SectionTypes::sanitizeContent('hero', $content)]);
        }
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
