<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\Setting;
use App\Support\LeadRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

/** Libro de Reclamaciones virtual: recibe la hoja, le da su número y manda una copia al consumidor. */
class ClaimController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // Campo trampa para bots: una persona nunca lo llena.
        if ($request->filled('website_url')) {
            return back()->with('claim_code', '—');
        }

        $footer = Setting::get('footer');
        abort_unless($footer['claims_enabled'] ?? true, 404);

        $isMinor = $request->boolean('is_minor');

        $data = $request->validate([
            'type' => ['required', Rule::in(array_keys(Claim::TYPES))],

            'name' => ['required', 'string', 'max:150', LeadRules::name()],
            'doc_type' => ['required', Rule::in(array_keys(Claim::DOC_TYPES))],
            'doc_number' => ['required', 'string', ...$this->docRules($request->input('doc_type'))],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', LeadRules::phone()],
            'email' => ['required', 'email:rfc', 'max:150'],
            'is_minor' => ['boolean'],
            'guardian_name' => [Rule::requiredIf($isMinor), 'nullable', 'string', 'max:150', LeadRules::name()],
            'guardian_doc_type' => [Rule::requiredIf($isMinor), 'nullable', Rule::in(array_keys(Claim::DOC_TYPES))],
            'guardian_doc_number' => [Rule::requiredIf($isMinor), 'nullable', 'string', ...$this->docRules($request->input('guardian_doc_type'))],

            'good_type' => ['required', Rule::in(array_keys(Claim::GOOD_TYPES))],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            'good_description' => ['required', 'string', 'min:5', 'max:1000'],

            'detail' => ['required', 'string', 'min:20', 'max:3000'],
            'request' => ['required', 'string', 'min:10', 'max:2000'],

            'accepted_truth' => ['accepted'],
            'accepted_privacy' => ['accepted'],
            'accepted_conforme' => ['accepted'],
        ], [
            'doc_number.digits' => 'El documento debe tener :digits números.',
            'guardian_doc_number.digits' => 'El documento del apoderado debe tener :digits números.',
            'guardian_name.required' => 'Escribe el nombre del padre, madre o tutor.',
            'guardian_doc_type.required' => 'Elige el tipo de documento del apoderado.',
            'guardian_doc_number.required' => 'Escribe el documento del apoderado.',
            'detail.min' => 'Cuéntanos con un poco más de detalle (mínimo :min letras).',
            'request.min' => 'Escribe qué solicitas (mínimo :min letras).',
            'good_description.min' => 'Describe el producto o servicio.',
            'accepted_truth.accepted' => 'Debes declarar que la información es verdadera.',
            'accepted_privacy.accepted' => 'Debes aceptar el tratamiento de tus datos personales.',
            'accepted_conforme.accepted' => 'Debes confirmar que estás conforme con el contenido de la hoja.',
        ]);

        $claim = Claim::create([
            'type' => $data['type'],
            'name' => $data['name'],
            'doc_type' => $data['doc_type'],
            'doc_number' => strtoupper(preg_replace('/\s+/', '', $data['doc_number']) ?? ''),
            'address' => $data['address'],
            'phone' => preg_replace('/[\s\-]+/', '', $data['phone']),
            'email' => $data['email'],
            'is_minor' => $isMinor,
            'guardian_name' => $isMinor ? $data['guardian_name'] : null,
            'guardian_doc_type' => $isMinor ? $data['guardian_doc_type'] : null,
            'guardian_doc_number' => $isMinor ? strtoupper(preg_replace('/\s+/', '', (string) $data['guardian_doc_number']) ?? '') : null,
            'good_type' => $data['good_type'],
            'amount' => $data['amount'] ?? null,
            'good_description' => $data['good_description'],
            'detail' => $data['detail'],
            'request' => $data['request'],
            'accepted_truth' => true,
            'accepted_privacy' => true,
            'accepted_conforme' => true,
            // Datos del proveedor tal como estaban al registrar la hoja.
            'provider' => [
                'name' => $footer['provider_name'] ?? '',
                'ruc' => $footer['provider_ruc'] ?? '',
                'address' => $footer['provider_address'] ?? '',
            ],
            'ip' => $request->ip(),
        ]);

        // Correlativo del año: 2026-000001
        $claim->update(['code' => now()->year.'-'.str_pad((string) $claim->id, 6, '0', STR_PAD_LEFT)]);

        $this->sendCopy($claim);

        return back()->with('claim_code', $claim->code);
    }

    /** Copia de la hoja para el consumidor y aviso para la empresa. Si el correo falla, la hoja ya quedó guardada. */
    private function sendCopy(Claim $claim): void
    {
        $contact = Setting::get('contact');
        $body = implode("\n", [
            "HOJA DE RECLAMACIÓN N° {$claim->code}",
            'Fecha: '.$claim->created_at->format('d/m/Y H:i'),
            '',
            'Proveedor: '.($claim->provider['name'] ?: '—').' · RUC '.($claim->provider['ruc'] ?: '—'),
            'Dirección: '.($claim->provider['address'] ?: '—'),
            '',
            'Tipo: '.Claim::TYPES[$claim->type],
            "Consumidor: {$claim->name} ({$claim->doc_type} {$claim->doc_number})",
            "Domicilio: {$claim->address}",
            "Teléfono: {$claim->phone} · Correo: {$claim->email}",
            '',
            'Bien contratado: '.Claim::GOOD_TYPES[$claim->good_type].($claim->amount !== null ? " · Monto: S/ {$claim->amount}" : ''),
            "Descripción: {$claim->good_description}",
            '',
            "Detalle: {$claim->detail}",
            "Pedido del consumidor: {$claim->request}",
            '',
            'La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.',
        ]);

        foreach (array_filter([[$claim->email, "Copia de tu hoja de reclamación N° {$claim->code}"], [$contact['email'] ?? '', "Nueva hoja de reclamación N° {$claim->code}"]]) as [$to, $subject]) {
            if ($to === '') {
                continue;
            }
            try {
                Mail::raw($body, fn ($message) => $message->to($to)->subject($subject));
            } catch (\Throwable $e) {
                report($e);
            }
        }
    }

    /** Reglas del número de documento según su tipo. */
    private function docRules(?string $type): array
    {
        return match ($type) {
            'DNI' => ['digits:8'],
            'RUC' => ['digits:11'],
            default => ['alpha_num', 'max:12'],
        };
    }
}
