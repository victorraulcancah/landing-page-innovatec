<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\PainsDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Agrega a una campaña ya creada la sección «Situaciones del día a día», justo después de la franja de servicios
 * (o de la portada, si no hay franja). Se puede repetir: si ya existe, no la duplica ni la toca.
 */
class PainsSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign || $campaign->sections()->where('type', 'pains')->exists()) {
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
}
