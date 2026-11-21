<?php

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Setting;
use App\Support\SiteDefaults;
use Illuminate\Database\Seeder;

/**
 * Cambia la ventana emergente de la landing por el chat de WhatsApp: activa el botón flotante con su globo y oculta
 * (sin borrar) la ventana emergente. Solo se hace una vez; si luego se vuelve a mostrar la ventana desde el panel, el
 * seeder ya no la oculta de nuevo.
 */
class WhatsappChatSeeder extends Seeder
{
    public function run(): void
    {
        // Se lee con el modelo (convierte el JSON guardado en arreglo); así se conserva todo el contacto ya editado.
        $stored = Setting::query()->where('key', 'contact')->first()?->value;
        if (is_array($stored) && array_key_exists('chat_enabled', $stored)) {
            return;
        }

        $chat = array_intersect_key(SiteDefaults::contact(), array_flip(['chat_enabled', 'chat_title', 'chat_message', 'chat_button', 'chat_delay', 'chat_position']));
        Setting::put('contact', [...(is_array($stored) ? $stored : []), ...$chat]);

        $campaign = Campaign::query()->where('status', 'active')->first()
            ?? Campaign::query()->where('slug', 'cada-hora-de-caida-cuesta')->first();
        $campaign?->sections()->where('type', 'popup')->update(['is_visible' => false]);
    }
}
