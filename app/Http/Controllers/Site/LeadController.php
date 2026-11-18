<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Lead;
use App\Support\FormDefaults;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // Campo trampa para bots: una persona nunca lo llena.
        if ($request->filled('website_url')) {
            return back()->with('lead_sent', true);
        }

        $campaignId = $request->filled('campaign_id') && Campaign::query()->whereKey((int) $request->input('campaign_id'))->exists()
            ? (int) $request->input('campaign_id')
            : null;

        // El formulario de la página se valida con los campos que se configuraron en el panel; el cotizador y las
        // demás entradas usan la regla simple de siempre (nombre y al menos un correo o un teléfono).
        $configured = $request->input('source') === 'form';
        $fields = $configured ? $this->fieldsFor($campaignId) : [];

        [$rules, $messages, $extraFields] = $configured ? $this->configuredRules($fields) : [$this->legacyRules(), $this->legacyMessages(), []];

        $data = $request->validate($rules, $messages);

        $extras = [];
        foreach ($extraFields as $i => $f) {
            $value = trim((string) ($data['extras'][$i] ?? ''));
            if ($value !== '') {
                $extras[] = ['label' => $f['label'], 'value' => $value];
            }
        }

        Lead::create([
            'campaign_id' => $campaignId,
            'name' => $data['name'],
            'company' => $data['company'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'message' => $data['message'] ?? null,
            'extras' => $extras ?: null,
        ]);

        return back()->with('lead_sent', true);
    }

    /** Teléfono: 7 a 15 dígitos; solo se permiten «+» al inicio, espacios, guiones y paréntesis. */
    private const PHONE = '/^\+?(?:[\s\-()]*\d){7,15}[\s\-()]*$/';

    private const PHONE_MESSAGE = 'Escribe un número válido: solo números (puedes usar +, espacios y guiones).';

    /** Regla de teléfono propia (la de «regex» de Laravel parte el patrón en la coma de {7,15}). */
    private function phoneRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if (! preg_match(self::PHONE, (string) $value)) {
                $fail(self::PHONE_MESSAGE);
            }
        };
    }

    /** @return array<string, mixed> */
    private function legacyRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email:rfc', 'max:150', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:40', $this->phoneRule(), 'required_without:email'],
            'message' => ['nullable', 'string', 'max:2000'],
            'campaign_id' => ['nullable', 'integer'],
        ];
    }

    /** @return array<string, string> */
    private function legacyMessages(): array
    {
        return [
            'name.required' => 'Escribe tu nombre.',
            'email.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'phone.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'email.email' => 'Revisa el correo: no parece válido.',
            'phone.regex' => self::PHONE_MESSAGE,
        ];
    }

    /** Los campos configurados en el «Llamado final» de la campaña; si no hay, los de fábrica. */
    private function fieldsFor(?int $campaignId): array
    {
        $section = $campaignId
            ? Campaign::query()->find($campaignId)?->sections()->where('type', 'cta')->orderBy('position')->get()
                ->first(fn ($s) => is_array($s->content['form_fields'] ?? null) && $s->content['form_fields'] !== [])
            : null;

        return $section?->content['form_fields'] ?? FormDefaults::fields();
    }

    /**
     * @param  list<array<string, mixed>>  $fields
     * @return array{0: array<string, mixed>, 1: array<string, string>, 2: list<array<string, mixed>>}
     */
    private function configuredRules(array $fields): array
    {
        $byKind = collect($fields)->groupBy('kind')->map(fn ($g) => $g->first());
        $required = fn (string $kind) => (bool) ($byKind[$kind]['required'] ?? false);
        $label = fn (string $kind, string $fallback) => (string) ($byKind[$kind]['label'] ?? $fallback);

        $rules = [
            'name' => ['required', 'string', 'max:120'],
            'company' => [$required('company') ? 'required' : 'nullable', 'string', 'max:150'],
            'email' => [$required('email') ? 'required' : 'nullable', 'email:rfc', 'max:150'],
            'phone' => [$required('phone') ? 'required' : 'nullable', 'string', 'max:40', $this->phoneRule()],
            'message' => [$required('message') ? 'required' : 'nullable', 'string', 'max:2000'],
            'campaign_id' => ['nullable', 'integer'],
        ];

        // Si el correo y el teléfono son opcionales, se pide al menos uno de los dos.
        if (isset($byKind['email'], $byKind['phone']) && ! $required('email') && ! $required('phone')) {
            $rules['email'][] = 'required_without:phone';
            $rules['phone'][] = 'required_without:email';
        }

        $messages = [
            'name.required' => 'Escribe tu nombre.',
            'company.required' => 'Completa: '.$label('company', 'empresa').'.',
            'email.required' => 'Escribe tu correo.',
            'phone.required' => 'Escribe tu teléfono.',
            'message.required' => 'Completa: '.$label('message', 'mensaje').'.',
            'email.email' => 'Revisa el correo: no parece válido.',
            'email.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'phone.required_without' => 'Déjanos un correo o un teléfono para contactarte.',
            'phone.regex' => self::PHONE_MESSAGE,
        ];

        // Preguntas extra (con opciones o de texto corto): se validan contra lo configurado, en el mismo orden.
        $extraFields = collect($fields)->filter(fn ($f) => in_array($f['kind'] ?? '', ['choice', 'text'], true))->values()->all();
        foreach ($extraFields as $i => $f) {
            $rule = [($f['required'] ?? false) ? 'required' : 'nullable', 'string', 'max:300'];
            if (($f['kind'] ?? '') === 'choice') {
                $options = array_values(array_filter(array_map('trim', preg_split('/\R/', (string) ($f['options'] ?? '')) ?: [])));
                $rule[] = Rule::in($options);
            }
            $rules["extras.$i"] = $rule;
            $messages["extras.$i.required"] = 'Completa: '.($f['label'] ?? 'este campo').'.';
            $messages["extras.$i.in"] = 'Elige una de las opciones de: '.($f['label'] ?? 'este campo').'.';
        }

        return [$rules, $messages, $extraFields];
    }
}
