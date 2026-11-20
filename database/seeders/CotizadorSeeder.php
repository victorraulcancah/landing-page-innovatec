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
        $this->cotizadorSimple($campaign);
        $this->call(PainsSeeder::class);
        $this->call(PillarsSeeder::class);
        $this->call(LeadFormSeeder::class);
    }

    /**
     * Quita del cotizador los planes rápidos y el número de la pestaña «Todos», pero solo si siguen siendo los de
     * fábrica: lo que ya se editó en el panel no se toca. Se puede repetir.
     */
    private function cotizadorSimple(Campaign $campaign): void
    {
        $factoryPresets = "15 PC · 1 local\n30 PC · 2 locales\n60 PC · 3 locales";

        foreach ($campaign->sections()->where('type', 'quote')->get() as $quote) {
            $content = $quote->content ?? [];
            $changed = false;

            if (str_replace("\r\n", "\n", trim((string) ($content['presets'] ?? ''))) === $factoryPresets) {
                $content['presets'] = '';
                $changed = true;
            }
            $factory = [
                'company_label' => ['RUC o nombre de tu empresa *', 'Nombre de tu empresa *'],
                'error_company' => ['Escribe el RUC o el nombre de tu empresa.', 'Escribe el nombre de tu empresa.'],
                'error_company_format' => ['Escribe un RUC válido de 11 dígitos o el nombre de tu empresa.', 'Escribe el nombre de tu empresa (con letras).'],
                'error_phone_format' => ['Escribe un celular válido de 9 dígitos (ej. 987 654 321).', 'Escribe un celular de 9 números que empiece con 9 (ej. 987654321).'],
            ];
            foreach ($factory as $key => [$before, $after]) {
                if (($content[$key] ?? null) === $before) {
                    $content[$key] = $after;
                    $changed = true;
                }
            }
            // Las cantidades iniciales de fábrica pasan a 0; si ya se cambiaron en el panel, no se tocan.
            $factoryQty = [15, 15, 1, 1, 2, 4, 2, 2, 1, 1, 2, 4, 1, 1];
            $devices = $content['devices'] ?? [];
            if (count($devices) === count($factoryQty) && array_map(fn ($d) => (int) ($d['qty'] ?? -1), $devices) === $factoryQty) {
                $content['devices'] = array_map(fn ($d) => [...$d, 'qty' => 0], $devices);
                $changed = true;
            }
            if (($content['all_label'] ?? null) === 'Todos ({n})') {
                $content['all_label'] = 'Todos';
                $changed = true;
            }

            if ($changed) {
                $quote->update(['content' => SectionTypes::sanitizeContent('quote', $content)]);
            }
        }
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
