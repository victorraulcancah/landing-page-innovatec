<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // Campo trampa para bots: una persona nunca lo llena.
        if ($request->filled('website_url')) {
            return back()->with('lead_sent', true);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email:rfc', 'max:150', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:40', 'required_without:email'],
            'message' => ['nullable', 'string', 'max:2000'],
            'campaign_id' => ['nullable', 'integer'],
        ], [
            'name.required' => 'Escribe tu nombre.',
            'email.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'phone.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'email.email' => 'Revisa el correo: no parece válido.',
        ]);

        $campaignId = isset($data['campaign_id']) && Campaign::query()->whereKey($data['campaign_id'])->exists()
            ? $data['campaign_id']
            : null;

        Lead::create([...$data, 'campaign_id' => $campaignId]);

        return back()->with('lead_sent', true);
    }
}
