<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Sitios ya instalados: el formulario de contacto deja de abrir WhatsApp, pide aceptar los Términos y Condiciones y
     * la Política de Privacidad, y se crea ese segundo documento (vacío: su texto se carga en el panel).
     * Los textos solo se cambian si siguen siendo los de fábrica.
     */
    public function up(): void
    {
        $this->addPrivacyDocument();

        // texto de fábrica anterior => nuevo
        $texts = [
            'form_note' => ['La consulta se prepara en WhatsApp. No se envía hasta que confirmes el mensaje.', 'Déjanos tus datos y nos comunicaremos contigo.'],
            'form_button' => ['Continuar por WhatsApp', 'Solicitar diagnóstico'],
            'form_consent' => ['Confirmo que deseo contactar voluntariamente a UCO360 por WhatsApp.', 'He leído y acepto lo indicado en Términos y Condiciones y Política de Privacidad'],
            'form_footnote' => ['El botón prepara un mensaje que podrás revisar antes de enviarlo.', ''],
            'thanks_title' => ['¡Listo! Abre WhatsApp para enviar tu mensaje', '¡Gracias! Recibimos tus datos.'],
            'thanks_text' => ['Guardamos tus datos y preparamos el mensaje. Si no se abrió solo, usa el botón.', 'Nuestro equipo te escribirá para coordinar tu reunión de diagnóstico.'],
        ];

        foreach (DB::table('campaign_sections')->where('type', 'cta')->get(['id', 'content']) as $section) {
            $content = json_decode((string) $section->content, true);
            if (! is_array($content)) {
                continue;
            }

            $new = $content;
            if (($new['form_mode'] ?? null) === 'whatsapp') {
                $new['form_mode'] = 'save';
            }
            foreach ($texts as $key => [$old, $replacement]) {
                if (($new[$key] ?? null) === $old) {
                    $new[$key] = $replacement;
                }
            }

            if ($new !== $content) {
                DB::table('campaign_sections')->where('id', $section->id)->update(['content' => json_encode($new, JSON_UNESCAPED_UNICODE), 'updated_at' => now()]);
            }
        }
    }

    /** Si el pie ya se guardó desde el panel y no tiene una política de privacidad, se agrega. */
    private function addPrivacyDocument(): void
    {
        $stored = json_decode((string) DB::table('site_settings')->where('key', 'footer')->value('value'), true);
        if (! is_array($stored) || ! is_array($stored['docs'] ?? null)) {
            return; // sin guardar: ya salen los dos de fábrica
        }

        foreach ($stored['docs'] as $doc) {
            if (str_contains(mb_strtolower((string) ($doc['label'] ?? '')), 'privacidad')) {
                return;
            }
        }

        $stored['docs'][] = ['label' => 'Política de Privacidad', 'text' => '', 'file' => null];
        DB::table('site_settings')->where('key', 'footer')->update(['value' => json_encode($stored, JSON_UNESCAPED_UNICODE), 'updated_at' => now()]);
    }

    public function down(): void
    {
        // Son contenidos editables desde el panel: no se revierten.
    }
};
