<?php

namespace App\Jobs;

use App\Models\Lead;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Envía un lead nuevo a la hoja de Google Sheets (vía el Apps Script publicado como aplicación web).
 * Se ejecuta con dispatchAfterResponse(): el visitante ya recibió su «gracias» y no hace falta un worker de colas.
 * Si Google falla, el lead ya está guardado en la base de datos: solo se deja un aviso en el log.
 */
class SendLeadToGoogleSheet
{
    use Dispatchable;

    public function __construct(public Lead $lead) {}

    public function handle(): void
    {
        $url = config('services.google_sheets.webhook_url');
        $secret = config('services.google_sheets.secret');

        if (! $url || ! $secret) {
            return; // integración apagada
        }

        $lead = $this->lead->loadMissing('campaign:id,name');

        try {
            $response = Http::asJson()
                ->timeout(15)
                ->withOptions(['verify' => config('services.http.ca_bundle') ?: true])
                ->retry(2, 500, throw: false)
                ->post($url, [
                    'secreto' => $secret,
                    'fecha' => $lead->created_at?->toIso8601String(),
                    'campania' => $lead->campaign?->name ?? '',
                    'nombre' => $lead->name,
                    'empresa' => $lead->company,
                    'telefono' => $lead->phone,
                    'correo' => $lead->email,
                    'mensaje' => $lead->message,
                    'estado' => Lead::STATUSES[$lead->status ?? 'new'] ?? 'Nuevo',
                    'extras' => $lead->extras ?? [],
                ]);

            if (! $response->successful() || $response->json('ok') !== true) {
                Log::warning('Google Sheets: no se pudo guardar el lead.', [
                    'lead_id' => $lead->id,
                    'status' => $response->status(),
                    'body' => mb_substr($response->body(), 0, 300),
                ]);
            }
        } catch (Throwable $e) {
            Log::warning('Google Sheets: falló el envío del lead.', ['lead_id' => $lead->id, 'error' => $e->getMessage()]);
        }
    }
}
