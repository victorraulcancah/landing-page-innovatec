<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\ClaimAttachment;
use App\Models\Setting;
use App\Support\LeadRules;
use App\Support\SitePayload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/** Libro de Reclamaciones virtual: la hoja, su constancia y la consulta de seguimiento. */
class ClaimController extends Controller
{
    /** La página del libro (formulario completo). */
    public function create(): Response
    {
        $this->ensureEnabled();

        return Inertia::render('libro/create', [
            ...SitePayload::shell(),
            'options' => [
                'docTypes' => Claim::DOC_TYPES,
                'voucherTypes' => Claim::VOUCHER_TYPES,
                'solutions' => Claim::SOLUTIONS,
            ],
            'days' => Claim::RESPONSE_DAYS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Campo trampa para bots: una persona nunca lo llena.
        if ($request->filled('website_url')) {
            return redirect()->route('claims.create');
        }

        $this->ensureEnabled();
        $footer = Setting::get('footer');
        $isMinor = $request->boolean('is_minor');

        // Documentos y celular sin espacios (quien pega «987 654 321» o «1234 5678» no debería tener un error por eso).
        foreach (['doc_number', 'guardian_doc_number', 'phone'] as $field) {
            if (is_string($request->input($field))) {
                $request->merge([$field => preg_replace('/\s+/', '', $request->input($field))]);
            }
        }

        $data = $request->validate([
            // 1. Consumidor
            'name' => ['required', 'string', 'max:150', LeadRules::name()],
            'doc_type' => ['required', Rule::in(array_keys(Claim::DOC_TYPES))],
            'doc_number' => ['required', 'string', ...$this->docRules($request->input('doc_type'))],
            'phone' => ['required', 'string', LeadRules::phone()],
            'email' => ['required', 'email:rfc', 'max:150'],
            'address' => ['required', 'string', 'max:255'],
            'is_minor' => ['boolean'],
            'guardian_name' => [Rule::requiredIf($isMinor), 'nullable', 'string', 'max:150', LeadRules::name()],
            'guardian_doc_type' => [Rule::requiredIf($isMinor), 'nullable', Rule::in(array_keys(Claim::DOC_TYPES))],
            'guardian_doc_number' => [Rule::requiredIf($isMinor), 'nullable', 'string', ...$this->docRules($request->input('guardian_doc_type'))],

            // 2. Información de la compra (opcional salvo tipo de bien, monto y descripción)
            'voucher_type' => ['nullable', Rule::in(array_keys(Claim::VOUCHER_TYPES))],
            'voucher_number' => ['nullable', 'string', 'max:30'],
            'purchase_date' => ['nullable', 'date', 'before_or_equal:today'],
            'contract_number' => ['nullable', 'string', 'max:30'],
            'product_code' => ['nullable', 'string', 'max:50'],
            'product_name' => ['nullable', 'string', 'max:150'],
            'product_brand' => ['nullable', 'string', 'max:80'],
            'product_model' => ['nullable', 'string', 'max:80'],
            'good_type' => ['required', Rule::in(array_keys(Claim::GOOD_TYPES))],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999'],
            'good_description' => ['required', 'string', 'min:5', 'max:1000'],

            // 3 y 4. Tipo y detalle
            'type' => ['required', Rule::in(array_keys(Claim::TYPES))],
            'detail' => ['required', 'string', 'min:20', 'max:3000'],
            'expected_solution' => ['nullable', Rule::in(array_keys(Claim::SOLUTIONS))],
            'solution_other' => ['nullable', 'string', 'max:255', 'required_if:expected_solution,otra'],
            'request' => ['required', 'string', 'min:10', 'max:2000'],

            // 5. Adjuntos (opcionales)
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'voucher_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4', 'max:20480'],

            // 6. Confirmaciones
            'accepted_truth' => ['accepted'],
            'accepted_privacy' => ['accepted'],
            'accepted_conforme' => ['accepted'],
        ], $this->messages());

        $claim = $this->register($request, $data, $isMinor, $footer);
        $this->sendCopy($claim);

        // La constancia es una dirección firmada: solo la tiene quien registró la hoja.
        return redirect()->to(URL::temporarySignedRoute('claims.receipt', now()->addHours(2), $claim));
    }

    /** Constancia de la hoja registrada (se puede imprimir o guardar como PDF). */
    public function receipt(Claim $claim): Response
    {
        return Inertia::render('libro/receipt', [
            ...SitePayload::shell(),
            'claim' => [
                ...$claim->only(['code', 'type', 'name', 'doc_type', 'doc_number', 'address', 'phone', 'email', 'is_minor', 'guardian_name', 'guardian_doc_type', 'guardian_doc_number',
                    'good_type', 'voucher_type', 'voucher_number', 'contract_number', 'product_code', 'product_name', 'product_brand', 'product_model',
                    'good_description', 'detail', 'request', 'provider', 'status']),
                'amount' => $claim->amount,
                'purchase_date' => $claim->purchase_date?->format('Y-m-d'),
                'solution' => $claim->solutionText(),
                'created_at' => $claim->created_at->toIso8601String(),
                'due_date' => $claim->dueDate(),
                'attachments' => $claim->attachments->map(fn ($a) => ['type' => $a->type, 'name' => $a->original_name, 'size' => $a->size])->values(),
            ],
            'options' => ['docTypes' => Claim::DOC_TYPES, 'voucherTypes' => Claim::VOUCHER_TYPES, 'types' => Claim::TYPES, 'goodTypes' => Claim::GOOD_TYPES],
            'days' => Claim::RESPONSE_DAYS,
        ]);
    }

    /** Página para consultar el estado de una hoja con su número y el documento del consumidor. */
    public function lookup(): Response
    {
        $this->ensureEnabled();

        return Inertia::render('libro/lookup', [...SitePayload::shell(), 'days' => Claim::RESPONSE_DAYS, 'result' => null]);
    }

    public function search(Request $request): Response
    {
        $this->ensureEnabled();

        $data = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'doc_number' => ['required', 'string', 'max:20'],
        ], ['code.required' => 'Escribe el número de hoja.', 'doc_number.required' => 'Escribe el número de documento.']);

        // Con número de hoja y documento: así nadie consulta hojas ajenas.
        $claim = Claim::query()
            ->where('code', trim($data['code']))
            ->where('doc_number', strtoupper((string) preg_replace('/\s+/', '', $data['doc_number'])))
            ->first();

        if (! $claim) {
            throw ValidationException::withMessages(['code' => 'No encontramos una hoja con esos datos. Revisa el número y el documento.']);
        }

        return Inertia::render('libro/lookup', [
            ...SitePayload::shell(),
            'days' => Claim::RESPONSE_DAYS,
            'result' => [
                'code' => $claim->code,
                'type' => $claim->type,
                'status' => $claim->status,
                'overdue' => $claim->isOverdue(),
                'created_at' => $claim->created_at->toIso8601String(),
                'due_date' => $claim->dueDate(),
                'answered_at' => $claim->answered_at?->toIso8601String(),
                'response' => $claim->response,
            ],
        ]);
    }

    /** Guarda la hoja con su número correlativo y sus adjuntos (en el disco privado). */
    private function register(Request $request, array $data, bool $isMinor, array $footer): Claim
    {
        $stored = [];

        try {
            return DB::transaction(function () use ($request, $data, $isMinor, $footer, &$stored) {
                $claim = Claim::create([
                    'type' => $data['type'],
                    'name' => $data['name'],
                    'doc_type' => $data['doc_type'],
                    'doc_number' => strtoupper($data['doc_number']),
                    'address' => $data['address'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'is_minor' => $isMinor,
                    'guardian_name' => $isMinor ? $data['guardian_name'] : null,
                    'guardian_doc_type' => $isMinor ? $data['guardian_doc_type'] : null,
                    'guardian_doc_number' => $isMinor ? strtoupper((string) $data['guardian_doc_number']) : null,
                    'good_type' => $data['good_type'],
                    'voucher_type' => $data['voucher_type'] ?? null,
                    'voucher_number' => $data['voucher_number'] ?? null,
                    'purchase_date' => $data['purchase_date'] ?? null,
                    'contract_number' => $data['contract_number'] ?? null,
                    'product_code' => $data['product_code'] ?? null,
                    'product_name' => $data['product_name'] ?? null,
                    'product_brand' => $data['product_brand'] ?? null,
                    'product_model' => $data['product_model'] ?? null,
                    'amount' => $data['amount'],
                    'good_description' => $data['good_description'],
                    'detail' => $data['detail'],
                    'expected_solution' => $data['expected_solution'] ?? null,
                    'solution_other' => ($data['expected_solution'] ?? null) === 'otra' ? ($data['solution_other'] ?? null) : null,
                    'request' => $data['request'],
                    'accepted_truth' => true,
                    'accepted_privacy' => true,
                    'accepted_conforme' => true,
                    // Datos del proveedor tal como estaban al registrar la hoja.
                    'provider' => ['name' => $footer['provider_name'] ?? '', 'ruc' => $footer['provider_ruc'] ?? '', 'address' => $footer['provider_address'] ?? ''],
                    'ip' => $request->ip(),
                ]);

                // El id es único y correlativo: el número no se repite ni salta. Ej.: 2026-000001
                $claim->update(['code' => now()->year.'-'.str_pad((string) $claim->id, 6, '0', STR_PAD_LEFT)]);

                $files = [
                    'photo' => $request->file('photos', []),
                    'voucher' => array_filter([$request->file('voucher_file')]),
                    'video' => array_filter([$request->file('video')]),
                ];
                foreach ($files as $type => $list) {
                    foreach ($list as $file) {
                        $path = $file->store("claims/{$claim->id}", ClaimAttachment::DISK);
                        $stored[] = $path;
                        $claim->attachments()->create([
                            'type' => $type,
                            'path' => $path,
                            'original_name' => $file->getClientOriginalName(),
                            'mime' => $file->getMimeType() ?: 'application/octet-stream',
                            'size' => $file->getSize(),
                        ]);
                    }
                }

                return $claim;
            });
        } catch (Throwable $e) {
            // Si algo falla, no quedan archivos sueltos sin hoja.
            Storage::disk(ClaimAttachment::DISK)->delete($stored);

            throw $e;
        }
    }

    /** Copia de la hoja para el consumidor y aviso para la empresa. Si el correo falla, la hoja ya quedó guardada. */
    private function sendCopy(Claim $claim): void
    {
        $contact = Setting::get('contact');
        $body = $claim->summaryText();
        $attached = $claim->attachments()->count();
        if ($attached > 0) {
            $body .= "\n\nArchivos adjuntos registrados: {$attached}.";
        }

        foreach ([[$claim->email, "Copia de tu hoja de reclamación N° {$claim->code}"], [$contact['email'] ?? '', "Nueva hoja de reclamación N° {$claim->code}"]] as [$to, $subject]) {
            if ($to === '') {
                continue;
            }
            try {
                Mail::raw($body, fn ($message) => $message->to($to)->subject($subject));
            } catch (Throwable $e) {
                report($e);
            }
        }
    }

    private function ensureEnabled(): void
    {
        abort_unless(Setting::get('footer')['claims_enabled'] ?? true, 404);
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

    /** @return array<string, string> */
    private function messages(): array
    {
        return [
            // Avisos generales en español (los específicos de cada campo van más abajo).
            'required' => 'Completa este campo.',
            'required_if' => 'Completa este campo.',
            'email' => 'Revisa el correo: no parece válido.',
            'max' => 'Es demasiado largo.',
            'min' => 'Es demasiado corto.',
            'in' => 'Elige una opción de la lista.',
            'numeric' => 'Escribe solo números.',
            'alpha_num' => 'Usa solo letras y números.',
            'date' => 'Escribe una fecha válida.',
            'before_or_equal' => 'La fecha no puede ser futura.',
            'accepted' => 'Debes marcar esta casilla.',
            'doc_number.digits' => 'El documento debe tener :digits números.',
            'guardian_doc_number.digits' => 'El documento del apoderado debe tener :digits números.',
            'guardian_name.required' => 'Escribe el nombre del padre, madre o apoderado.',
            'guardian_doc_type.required' => 'Elige el tipo de documento del apoderado.',
            'guardian_doc_number.required' => 'Escribe el documento del apoderado.',
            'solution_other.required_if' => 'Especifica la solución que esperas.',
            'detail.min' => 'Cuéntanos con un poco más de detalle (mínimo :min letras).',
            'request.min' => 'Escribe qué solicitas (mínimo :min letras).',
            'good_description.min' => 'Describe el producto o servicio.',
            'photos.max' => 'Puedes adjuntar hasta :max fotografías.',
            'photos.*.image' => 'Las fotografías deben ser JPG o PNG.',
            'photos.*.mimes' => 'Las fotografías deben ser JPG o PNG.',
            'photos.*.max' => 'Cada fotografía debe pesar como máximo 5 MB.',
            'photos.*.uploaded' => 'No se pudo subir una fotografía: pesa demasiado para el servidor.',
            'voucher_file.mimes' => 'La factura debe ser PDF, JPG o PNG.',
            'voucher_file.max' => 'La factura debe pesar como máximo 5 MB.',
            'video.mimetypes' => 'El video debe estar en formato MP4.',
            'video.max' => 'El video debe pesar como máximo 20 MB.',
            'video.uploaded' => 'No se pudo subir el video: pesa demasiado para el servidor.',
            'accepted_truth.accepted' => 'Debes declarar que la información es verdadera.',
            'accepted_privacy.accepted' => 'Debes aceptar el tratamiento de tus datos personales.',
            'accepted_conforme.accepted' => 'Debes confirmar que estás conforme con el contenido de la hoja.',
        ];
    }
}
