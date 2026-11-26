<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\Setting;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Copia cada lead nuevo a Zoho CRM por su formulario web (Ajustes del sitio → Zoho CRM). Se ejecuta con
 * dispatchAfterResponse(): el visitante ya vio su «gracias». Si Zoho falla, el lead ya está guardado en el panel.
 * No se reintenta, para no crear contactos repetidos en el CRM.
 */
class SendLeadToZoho
{
    use Dispatchable;

    public function __construct(public Lead $lead) {}

    public function handle(): void
    {
        $zoho = Setting::get('zoho');
        if (empty($zoho['action']) || empty($zoho['fields'])) {
            return; // integración apagada
        }

        $lead = $this->lead;

        // El formulario de Zoho no tiene casillas para el correo ni las preguntas extra: van en la descripción.
        $description = collect([$lead->message, filled($lead->email) ? 'Correo: '.$lead->email : null])
            ->merge(collect($lead->extras ?? [])
                ->filter(fn ($e) => filled($e['value'] ?? null))
                ->map(fn ($e) => ($e['label'] ?? 'Dato').': '.$e['value']))
            ->filter()
            ->implode("\n");

        try {
            Http::asForm()->timeout(10)->post($zoho['action'], [
                ...$zoho['fields'],
                'zc_gad' => '',
                'returnURL' => 'null',
                'aG9uZXlwb3Q' => '', // campo trampa de Zoho: va vacío
                'First Name' => mb_substr($lead->name, 0, 40),
                // En el formulario de Zoho «Last Name» es la empresa, y es obligatorio.
                'Last Name' => mb_substr($lead->company ?: $lead->name, 0, 80),
                'Phone' => mb_substr((string) $lead->phone, 0, 30),
                'Description' => $description !== '' ? $description : 'Contacto desde la web',
            ])->throw();
        } catch (Throwable $e) {
            Log::error('Zoho CRM: no se pudo enviar el lead.', ['lead_id' => $lead->id, 'error' => $e->getMessage()]);
        }
    }
}
