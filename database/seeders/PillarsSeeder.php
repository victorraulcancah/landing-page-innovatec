<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Support\PillarsDefaults;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Agrega a una campaña ya creada «Qué incluye cada mes» (los 4 pilares con pestañas) justo después de la sección
 * de pilares corta, que queda oculta para no repetir contenido (no se borra: se puede volver a mostrar desde el panel).
 * Se puede repetir: si ya existe, no la duplica ni la toca.
 */
class PillarsSeeder extends Seeder
{
    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign || $campaign->sections()->where('type', 'pillars')->exists()) {
            return;
        }

        $features = $campaign->sections()->where('type', 'features')->where('anchor', 'servicios')->orderBy('position')->first();
        $after = $features?->position
            ?? $campaign->sections()->where('type', 'pains')->min('position')
            ?? $campaign->sections()->where('type', 'hero')->min('position');
        if ($after === null) {
            return;
        }

        $campaign->sections()->where('position', '>', $after)->increment('position');
        $campaign->sections()->create([
            'type' => 'pillars',
            'position' => (int) $after + 1,
            'is_visible' => true,
            'anchor' => 'pilares',
            'nav_label' => 'Servicios',
            'content' => SectionTypes::sanitizeContent('pillars', PillarsDefaults::pillars()),
            'style' => SectionTypes::sanitizeStyle('pillars', ['bg_color' => 'surface', 'align' => 'center']),
        ]);

        $features?->update(['is_visible' => false]);
    }
}
