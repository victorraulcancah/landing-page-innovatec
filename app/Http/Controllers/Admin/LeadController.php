<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $leads = Lead::query()->with('campaign:id,name')
            ->when(array_key_exists((string) $status, Lead::STATUSES), fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Lead $l) => [
                ...$l->only(['id', 'name', 'company', 'email', 'phone', 'message', 'status']),
                'campaign' => $l->campaign?->name,
                'created_at' => $l->created_at->toIso8601String(),
            ]);

        return Inertia::render('leads/index', [
            'leads' => $leads,
            'statuses' => Lead::STATUSES,
            'filter' => $status,
            'counts' => Lead::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    public function update(Request $request, Lead $lead): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(array_keys(Lead::STATUSES))]]);
        $lead->update($data);

        return back();
    }

    public function destroy(Lead $lead): RedirectResponse
    {
        $lead->delete();

        return back()->with('success', 'Contacto eliminado.');
    }
}
