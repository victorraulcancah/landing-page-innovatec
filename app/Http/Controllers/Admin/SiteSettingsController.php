<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Setting;
use App\Support\SectionTypes;
use App\Support\SiteDefaults;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    public function edit(): Response
    {
        $active = Campaign::query()->active()->first();

        return Inertia::render('site/edit', [
            'theme' => Setting::get('theme'),
            'navbar' => Setting::get('navbar'),
            'contact' => Setting::get('contact'),
            'footer' => Setting::get('footer'),
            'themeColors' => SiteDefaults::THEME_COLORS,
            'fonts' => SiteDefaults::FONTS,
            'radii' => SiteDefaults::RADII,
            'ctaActions' => SiteDefaults::CTA_ACTIONS,
            'colorTokens' => SectionTypes::COLOR_TOKENS,
            'anchors' => $active
                ? $active->sections()->get(['anchor', 'nav_label', 'type', 'id'])->map(fn ($s) => [
                    'anchor' => $s->anchor ?: 'seccion-'.$s->id,
                    'label' => $s->nav_label ?: ($s->anchor ?: $s->type),
                ])->values()
                : [],
        ]);
    }

    public function update(Request $request, string $group): RedirectResponse
    {
        abort_unless(in_array($group, SiteDefaults::keys(), true), 404);

        Setting::put($group, $this->{'clean'.ucfirst($group)}($request));

        return back()->with('success', 'Cambios guardados. Ya se ven en la landing.');
    }

    private function cleanTheme(Request $request): array
    {
        $rules = [];
        foreach (array_keys(SiteDefaults::THEME_COLORS) as $key) {
            $rules[$key] = ['required', 'regex:/^#[0-9a-fA-F]{6}$/'];
        }
        $rules['heading_font'] = ['required', Rule::in(array_keys(SiteDefaults::FONTS))];
        $rules['body_font'] = ['required', Rule::in(array_keys(SiteDefaults::FONTS))];
        $rules['radius'] = ['required', Rule::in(array_keys(SiteDefaults::RADII))];

        $data = $request->validate($rules, ['*.regex' => 'Usa un color en formato #RRGGBB.']);

        return collect($data)->map(fn ($v, $k) => isset(SiteDefaults::THEME_COLORS[$k]) ? strtolower($v) : $v)->all();
    }

    private function cleanNavbar(Request $request): array
    {
        $data = $request->validate([
            'brand_text' => ['required', 'string', 'max:40'],
            'brand_sub' => ['nullable', 'string', 'max:60'],
            'logo' => ['nullable', 'string', 'max:500'],
            'logo_position' => ['required', Rule::in(['left', 'center'])],
            'links_mode' => ['required', Rule::in(['auto', 'manual'])],
            'links_align' => ['required', Rule::in(['left', 'center', 'right'])],
            'links' => ['nullable', 'array', 'max:8'],
            'links.*.label' => ['required', 'string', 'max:40'],
            'links.*.target' => ['required', 'string', 'max:300'],
            'show_cta' => ['required', 'boolean'],
            'cta' => ['required', 'array'],
            'bg_color' => ['nullable', 'string', 'max:20'],
            'text_color' => ['nullable', 'string', 'max:20'],
            'sticky' => ['required', 'boolean'],
            'border' => ['required', 'boolean'],
        ], [
            'brand_text.required' => 'La marca no puede quedar vacía.',
            'links.*.label.required' => 'Cada enlace necesita un texto.',
            'links.*.target.required' => 'Cada enlace necesita un destino.',
            '*.regex' => 'Usa un color en formato #RRGGBB.',
        ]);

        return [
            ...$data,
            'logo' => SectionTypes::imageUrl($data['logo'] ?? null),
            'brand_sub' => SectionTypes::str($data['brand_sub'] ?? '', 60),
            'links' => collect($data['links'] ?? [])->map(fn ($l) => [
                'label' => SectionTypes::str($l['label'], 40),
                'target' => SectionTypes::str($l['target'], 300),
            ])->values()->all(),
            'cta' => SectionTypes::sanitizeCta($data['cta']),
            'bg_color' => SectionTypes::color_value($data['bg_color'] ?? null, true),
            'text_color' => SectionTypes::color_value($data['text_color'] ?? null, true),
        ];
    }

    private function cleanContact(Request $request): array
    {
        $data = $request->validate([
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'whatsapp_message' => ['nullable', 'string', 'max:300'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string', 'max:250'],
            'website' => ['nullable', 'string', 'max:150'],
        ]) + array_fill_keys(['whatsapp', 'whatsapp_message', 'phone', 'email', 'address', 'website'], '');

        return array_map(fn ($v) => $v ?? '', $data);
    }

    private function cleanFooter(Request $request): array
    {
        $data = $request->validate([
            'text' => ['nullable', 'string', 'max:200'],
            'legal' => ['nullable', 'string', 'max:200'],
            'show_contact' => ['required', 'boolean'],
            'bg_color' => ['nullable', 'string', 'max:20'],
            'text_color' => ['nullable', 'string', 'max:20'],
        ], ['*.regex' => 'Usa un color en formato #RRGGBB.']);

        return [
            'text' => SectionTypes::str($data['text'] ?? '', 200),
            'legal' => SectionTypes::str($data['legal'] ?? '', 200),
            'show_contact' => $data['show_contact'],
            'bg_color' => SectionTypes::color_value($data['bg_color'] ?? null, true),
            'text_color' => SectionTypes::color_value($data['text_color'] ?? null, true),
        ];
    }
}
