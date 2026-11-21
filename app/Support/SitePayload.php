<?php

namespace App\Support;

use App\Models\Campaign;
use App\Models\Setting;

/** Datos del sitio (tema, menú, contacto y pie) para las páginas que no son la landing, como el Libro de Reclamaciones. */
class SitePayload
{
    /** @return array<string, mixed> */
    public static function shell(): array
    {
        $campaign = Campaign::query()->active()->latest('activated_at')->first();

        return [
            'theme' => $campaign ? $campaign->resolvedTheme() : Setting::get('theme'),
            'navbar' => Setting::get('navbar'),
            'contact' => Setting::get('contact'),
            'footer' => Setting::get('footer'),
        ];
    }
}
