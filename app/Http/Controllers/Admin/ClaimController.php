<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/** Hojas del Libro de Reclamaciones: se ven todas y se responde cada una. */
class ClaimController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $claims = Claim::query()
            ->when(array_key_exists((string) $status, Claim::STATUSES), fn ($q) => $q->where('status', $status))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Claim $c) => [
                ...$c->only(['id', 'code', 'type', 'name', 'doc_type', 'doc_number', 'address', 'phone', 'email', 'is_minor', 'guardian_name', 'guardian_doc_type', 'guardian_doc_number',
                    'good_type', 'good_description', 'detail', 'request', 'provider', 'status', 'response']),
                'amount' => $c->amount,
                'created_at' => $c->created_at->toIso8601String(),
                'answered_at' => $c->answered_at?->toIso8601String(),
            ]);

        return Inertia::render('claims/index', [
            'claims' => $claims,
            'statuses' => Claim::STATUSES,
            'types' => Claim::TYPES,
            'goodTypes' => Claim::GOOD_TYPES,
            'filter' => $status,
            'counts' => Claim::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
        ]);
    }

    /** Registra la respuesta al consumidor y marca la hoja como atendida. */
    public function update(Request $request, Claim $claim): RedirectResponse
    {
        $data = $request->validate(['response' => ['required', 'string', 'min:10', 'max:3000']], [
            'response.required' => 'Escribe la respuesta para el consumidor.',
            'response.min' => 'La respuesta es muy corta (mínimo :min letras).',
        ]);

        $claim->update(['response' => $data['response'], 'status' => 'answered', 'answered_at' => now()]);

        try {
            Mail::raw(
                "Hoja de reclamación N° {$claim->code}\n\nRespuesta del proveedor:\n{$claim->response}",
                fn ($m) => $m->to($claim->email)->subject("Respuesta a tu hoja de reclamación N° {$claim->code}"),
            );
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'La respuesta quedó guardada, pero no se pudo enviar el correo al consumidor. Avísale por teléfono.');
        }

        return back()->with('success', 'Respuesta guardada y enviada al correo del consumidor.');
    }
}
