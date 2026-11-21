<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\ClaimAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;

/** Hojas del Libro de Reclamaciones: se ven todas con sus adjuntos y se responde cada una. */
class ClaimController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = trim((string) $request->query('q', ''));

        $claims = Claim::query()
            ->with('attachments')
            ->when(array_key_exists((string) $status, Claim::STATUSES), fn ($q) => $q->where('status', $status))
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w->where('code', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%")->orWhere('doc_number', 'like', "%{$search}%")))
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Claim $c) => [
                ...$c->only(['id', 'code', 'type', 'name', 'doc_type', 'doc_number', 'address', 'phone', 'email', 'is_minor', 'guardian_name', 'guardian_doc_type', 'guardian_doc_number',
                    'good_type', 'voucher_type', 'voucher_number', 'contract_number', 'product_code', 'product_name', 'product_brand', 'product_model',
                    'good_description', 'detail', 'request', 'provider', 'status', 'response']),
                'amount' => $c->amount,
                'purchase_date' => $c->purchase_date?->format('Y-m-d'),
                'solution' => $c->solutionText(),
                'due_date' => $c->dueDate(),
                'overdue' => $c->isOverdue(),
                'created_at' => $c->created_at->toIso8601String(),
                'answered_at' => $c->answered_at?->toIso8601String(),
                'attachments' => $c->attachments->map(fn ($a) => ['id' => $a->id, 'type' => $a->type, 'name' => $a->original_name, 'mime' => $a->mime, 'size' => $a->size])->values(),
            ]);

        return Inertia::render('claims/index', [
            'claims' => $claims,
            'statuses' => Claim::STATUSES,
            'types' => Claim::TYPES,
            'goodTypes' => Claim::GOOD_TYPES,
            'voucherTypes' => Claim::VOUCHER_TYPES,
            'days' => Claim::RESPONSE_DAYS,
            'filter' => $status,
            'search' => $search,
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

    /** Muestra un adjunto guardado en el disco privado (solo quien administra). */
    public function attachment(ClaimAttachment $attachment): BinaryFileResponse
    {
        $disk = Storage::disk(ClaimAttachment::DISK);
        abort_unless($disk->exists($attachment->path), 404);

        // El encabezado no admite barras; la versión ASCII tampoco «%».
        $name = str_replace(['/', '\\'], '-', $attachment->original_name);
        $ascii = str_replace('%', '', Str::ascii($name)) ?: 'adjunto';

        return response()->file($disk->path($attachment->path), [
            'Content-Type' => $attachment->mime,
            'Content-Disposition' => HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_INLINE, $name, $ascii),
        ]);
    }
}
