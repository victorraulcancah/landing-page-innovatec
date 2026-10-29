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

class CampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = Campaign::query()
            ->withCount(['sections', 'leads'])
            ->orderByRaw("case status when 'active' then 0 when 'draft' then 1 else 2 end")
            ->latest('updated_at')
            ->get(['id', 'name', 'slug', 'status', 'activated_at', 'updated_at']);

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns,
            'statuses' => Campaign::STATUSES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120']], [
            'name.required' => 'Ponle un nombre a la campaña.',
        ]);

        $campaign = Campaign::create([
            'name' => $data['name'],
            'slug' => Campaign::uniqueSlug($data['name']),
            'status' => 'draft',
        ]);

        // Una campaña nueva arranca con portada y llamado final; el resto se agrega a gusto.
        foreach (['hero', 'cta'] as $i => $type) {
            $campaign->sections()->create([
                'type' => $type,
                'position' => $i + 1,
                'anchor' => $type === 'cta' ? 'contacto' : null,
                'content' => SectionTypes::all()[$type]['defaults'],
                'style' => SectionTypes::defaultStyle(),
            ]);
        }

        return to_route('campaigns.edit', $campaign)->with('success', 'Campaña creada. Edita sus secciones.');
    }

    public function edit(Campaign $campaign): Response
    {
        return Inertia::render('campaigns/edit', [
            'campaign' => $campaign->only(['id', 'name', 'slug', 'status', 'meta_title', 'meta_description', 'theme']),
            'sections' => $campaign->sections->map->only([
                'id', 'type', 'position', 'is_visible', 'anchor', 'nav_label', 'content', 'style',
            ])->values(),
            'schema' => SectionTypes::schemaForClient(),
            'themeColors' => SiteDefaults::THEME_COLORS,
            'globalTheme' => Setting::get('theme'),
            'fonts' => SiteDefaults::FONTS,
            'radii' => SiteDefaults::RADII,
            'statuses' => Campaign::STATUSES,
        ]);
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9-]+$/', Rule::unique('campaigns', 'slug')->ignore($campaign->id)],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'theme' => ['nullable', 'array'],
        ], [
            'slug.regex' => 'El identificador solo admite minúsculas, números y guiones.',
            'slug.unique' => 'Ya existe otra campaña con ese identificador.',
        ]);

        $theme = [];
        foreach (Campaign::themeKeys() as $key) {
            $theme[$key] = SectionTypes::color_value($data['theme'][$key] ?? null);
        }
        foreach (['heading_font', 'body_font'] as $key) {
            $font = $data['theme'][$key] ?? null;
            $theme[$key] = is_string($font) && array_key_exists($font, SiteDefaults::FONTS) ? $font : null;
        }
        $radius = $data['theme']['radius'] ?? null;
        $theme['radius'] = is_string($radius) && array_key_exists($radius, SiteDefaults::RADII) ? $radius : null;

        $campaign->update([...collect($data)->except('theme')->all(), 'theme' => $theme]);

        return back()->with('success', 'Campaña guardada.');
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        if ($campaign->status === 'active') {
            return back()->with('error', 'Activa otra campaña antes de eliminar la que está en línea.');
        }

        $campaign->delete();

        return to_route('campaigns.index')->with('success', 'Campaña eliminada.');
    }

    public function activate(Campaign $campaign): RedirectResponse
    {
        $campaign->activate();

        return back()->with('success', "«{$campaign->name}» ahora está en línea. La anterior quedó archivada.");
    }

    public function archive(Campaign $campaign): RedirectResponse
    {
        $campaign->update(['status' => 'archived']);

        return back()->with('success', 'Campaña archivada.');
    }

    public function duplicate(Campaign $campaign): RedirectResponse
    {
        $copy = $campaign->duplicate();

        return to_route('campaigns.edit', $copy)->with('success', 'Copia creada como borrador.');
    }
}
