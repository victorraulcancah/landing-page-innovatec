<?php

namespace App\Jobs;

use App\Models\Lead;
use App\Models\Setting;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Avisa por correo de cada lead nuevo, al correo de «Contáctanos» (Ajustes del sitio → Contacto).
 * Se ejecuta con dispatchAfterResponse(): el visitante ya vio su «gracias». Si el correo falla, el lead ya está
 * guardado en el panel: solo se deja un aviso en el log.
 */
class SendLeadByEmail
{
    use Dispatchable;

    public function __construct(public Lead $lead) {}

    public function handle(): void
    {
        $to = trim((string) (Setting::get('contact')['email'] ?? ''));
        if ($to === '' || ! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return; // sin correo de contacto configurado, no hay a dónde avisar
        }

        $lead = $this->lead->loadMissing('campaign:id,name');

        $lines = [
            'Nuevo contacto desde la web de UCO360',
            '',
            'Nombre: '.$lead->name,
        ];
        foreach ([['Empresa', $lead->company], ['Teléfono / WhatsApp', $lead->phone], ['Correo', $lead->email]] as [$label, $value]) {
            if (filled($value)) {
                $lines[] = "$label: $value";
            }
        }
        foreach ($lead->extras ?? [] as $extra) {
            if (filled($extra['value'] ?? null)) {
                $lines[] = ($extra['label'] ?? 'Dato').': '.$extra['value'];
            }
        }
        if (filled($lead->message)) {
            $lines[] = '';
            $lines[] = 'Mensaje:';
            $lines[] = $lead->message;
        }
        $lines[] = '';
        $lines[] = 'Recibido: '.$lead->created_at?->timezone('America/Lima')->format('d/m/Y H:i');
        if ($lead->campaign?->name) {
            $lines[] = 'Campaña: '.$lead->campaign->name;
        }
        $lines[] = 'Todos los contactos están en el panel, sección Leads.';

        try {
            Mail::raw(implode("\n", $lines), function ($message) use ($to, $lead) {
                $message->to($to)->subject('Nuevo contacto web: '.$lead->name);
                if (filter_var($lead->email, FILTER_VALIDATE_EMAIL)) {
                    $message->replyTo($lead->email, $lead->name);
                }
            });
        } catch (Throwable $e) {
            Log::warning('Aviso de lead por correo: no se pudo enviar.', ['lead_id' => $lead->id, 'error' => $e->getMessage()]);
        }
    }
}
