<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignSection;
use App\Support\SectionTypes;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    public function store(Request $request, Campaign $campaign): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(SectionTypes::keys())]]);
        $def = SectionTypes::all()[$data['type']];

        $campaign->sections()->create([
            'type' => $data['type'],
            'position' => ((int) $campaign->sections()->max('position')) + 1,
            'anchor' => $this->freeAnchor($campaign, Str::slug($def['label'])),
            'content' => $def['defaults'],
            'style' => SectionTypes::defaultStyle(),
        ]);

        return back()->with('success', "Sección «{$def['label']}» agregada al final.");
    }

    public function update(Request $request, CampaignSection $section): RedirectResponse
    {
        $data = $request->validate([
            'is_visible' => ['required', 'boolean'],
            'anchor' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9-]+$/'],
            'nav_label' => ['nullable', 'string', 'max:40'],
            'content' => ['required', 'array'],
            'style' => ['required', 'array'],
        ], ['anchor.regex' => 'El ancla solo admite minúsculas, números y guiones.']);

        $section->update([
            'is_visible' => $data['is_visible'],
            'anchor' => ($data['anchor'] ?? null) ?: null,
            'nav_label' => ($data['nav_label'] ?? null) ?: null,
            'content' => SectionTypes::sanitizeContent($section->type, $data['content']),
            'style' => SectionTypes::sanitizeStyle($section->type, $data['style']),
        ]);

        return back()->with('success', 'Sección guardada.');
    }

    public function toggle(CampaignSection $section): RedirectResponse
    {
        $section->update(['is_visible' => ! $section->is_visible]);

        return back();
    }

    public function destroy(CampaignSection $section): RedirectResponse
    {
        $campaignId = $section->campaign_id;
        $section->delete();
        $this->normalize($campaignId);

        return back()->with('success', 'Sección eliminada.');
    }

    public function move(Request $request, CampaignSection $section): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        $ids = CampaignSection::query()->where('campaign_id', $section->campaign_id)
            ->orderBy('position')->orderBy('id')->pluck('id')->all();

        $index = array_search($section->id, $ids, true);
        $swap = $direction === 'up' ? $index - 1 : $index + 1;

        if ($index !== false && isset($ids[$swap])) {
            [$ids[$index], $ids[$swap]] = [$ids[$swap], $ids[$index]];
            foreach ($ids as $position => $id) {
                CampaignSection::query()->whereKey($id)->update(['position' => $position + 1]);
            }
        }

        return back();
    }

    private function normalize(int $campaignId): void
    {
        CampaignSection::query()->where('campaign_id', $campaignId)
            ->orderBy('position')->orderBy('id')->pluck('id')
            ->each(fn ($id, $i) => CampaignSection::query()->whereKey($id)->update(['position' => $i + 1]));
    }

    private function freeAnchor(Campaign $campaign, string $base): string
    {
        $base = $base ?: 'seccion';
        $anchor = $base;
        $i = 2;
        while ($campaign->sections()->where('anchor', $anchor)->exists()) {
            $anchor = $base.'-'.$i++;
        }

        return $anchor;
    }
}
