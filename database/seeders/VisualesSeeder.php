<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Setting;
use App\Support\MapLocator;
use App\Support\SectionTypes;
use Illuminate\Database\Seeder;

/**
 * Lleva a una campaña ya creada lo que trae el diseño con imágenes: la franja de servicios bajo la portada y
 * la tarjeta del informe sobre la foto de «Pensado para la gerencia». Es para bases que ya existen (el
 * CampaignSeeder no vuelve a correr) y se puede repetir: no duplica nada ni pisa lo editado en el panel.
 */
class VisualesSeeder extends Seeder
{
    public const SERVICES = "Soporte por WhatsApp\nVisita presencial semanal\nBackups monitoreados\nPruebas de restauración\nInventario vivo\nInforme mensual para gerencia\nProveedores coordinados\nCiberseguridad";

    public function run(): void
    {
        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();

        if (! $campaign) {
            return;
        }

        $this->franja($campaign);
        $this->tarjetaSobreLaFoto($campaign);
        $this->popup($campaign);
        $this->mapa($campaign);
        $this->mapaExacto();
    }

    /** Si ya hay un enlace de Google Maps guardado, saca de él el punto exacto para centrar el mapa. */
    private function mapaExacto(): void
    {
        $contact = Setting::get('contact');
        if (($contact['map_url'] ?? '') === '' || ($contact['map_coords'] ?? '') !== '') {
            return;
        }

        $coords = MapLocator::coordinates($contact['map_url']);
        if ($coords) {
            Setting::put('contact', [...$contact, 'map_coords' => $coords]);
        }
    }

    /** El cierre ahora puede mostrar el mapa: se enciende solo en campañas que no tenían ese ajuste. */
    private function mapa(Campaign $campaign): void
    {
        $section = $campaign->sections()->where('type', 'cta')->first();
        if (! $section || array_key_exists('show_map', $section->content)) {
            return;
        }

        $section->update(['content' => SectionTypes::sanitizeContent('cta', [...$section->content, 'show_map' => true])]);
    }

    /** El pop-up ahora lleva imagen o ilustración y un «Ahora no»: se completan solo si faltan. */
    private function popup(Campaign $campaign): void
    {
        $section = $campaign->sections()->where('type', 'popup')->first();
        if (! $section) {
            return;
        }

        $content = $section->content;
        $defaults = ['visual' => 'report', 'dismiss_label' => 'Ahora no'];
        $missing = array_diff_key($defaults, $content);
        if ($missing === []) {
            return;
        }

        $section->update(['content' => SectionTypes::sanitizeContent('popup', [...$content, ...$missing])]);
    }

    private function franja(Campaign $campaign): void
    {
        if ($campaign->sections()->where('type', 'marquee')->exists()) {
            return;
        }

        // Va justo debajo de la portada (y de su calculadora, que forma parte de ella).
        $after = (int) $campaign->sections()->whereIn('type', ['hero', 'calculator'])->max('position');
        if ($after === 0) {
            return;
        }

        $campaign->sections()->where('position', '>', $after)->increment('position');
        $campaign->sections()->create([
            'type' => 'marquee',
            'position' => $after + 1,
            'is_visible' => true,
            'anchor' => 'franja',
            'nav_label' => null,
            'content' => SectionTypes::sanitizeContent('marquee', ['items' => self::SERVICES, 'speed' => 'normal']),
            'style' => SectionTypes::sanitizeStyle('marquee', ['bg_color' => 'accent']),
        ]);
    }

    private function tarjetaSobreLaFoto(Campaign $campaign): void
    {
        $section = $campaign->sections()->where('type', 'text')->first();
        if (! $section || array_key_exists('overlay', $section->content) || empty($section->content['image'])) {
            return;
        }

        $section->update([
            'content' => SectionTypes::sanitizeContent('text', [...$section->content, 'overlay' => 'report']),
        ]);
    }
}
