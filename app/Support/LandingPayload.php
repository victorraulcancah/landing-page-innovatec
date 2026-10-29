<?php

namespace App\Support;

use App\Models\Campaign;
use App\Models\Setting;

class LandingPayload
{
    /** Datos que necesita la pagina publica para pintar una campaña. */
    public static function build(?Campaign $campaign, bool $preview = false): array
    {
        $sections = $campaign
            ? $campaign->sections()->where('is_visible', true)->get()->map(fn ($s) => [
                'id' => $s->id,
                'type' => $s->type,
                'anchor' => $s->anchor ?: 'seccion-'.$s->id,
                'nav_label' => $s->nav_label,
                'content' => $s->content,
                'style' => array_replace(SectionTypes::defaultStyle(), $s->style ?? []),
            ])->values()->all()
            : [];

        return [
            'campaign' => $campaign ? $campaign->only(['id', 'name', 'meta_title', 'meta_description']) : null,
            'sections' => $sections,
            'theme' => $campaign ? $campaign->resolvedTheme() : Setting::get('theme'),
            'navbar' => Setting::get('navbar'),
            'contact' => Setting::get('contact'),
            'footer' => Setting::get('footer'),
            'preview' => $preview,
        ];
    }
}
