<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Lee el formulario web de Zoho CRM («Web to Lead») a partir de lo que da Zoho: el código HTML, el script, el iframe o
 * el enlace. De ahí salen la dirección de envío y los campos ocultos que Zoho exige en cada contacto.
 */
class ZohoWebForm
{
    /** Dominios de Zoho por región. */
    private const REGIONS = '(?:com\.au|com|eu|in|jp)';

    /** @return array{action: string, fields: array<string, string>}|null null si no es un formulario web de Zoho */
    public static function read(string $code): ?array
    {
        $html = $code;

        // Con el script, el iframe o el enlace, el formulario se pide a Zoho (solo a sus dominios).
        if (! str_contains($html, 'xnQsjsdp')) {
            if (! preg_match('~https://(?:crm\.zoho(?:public)?\.'.self::REGIONS.'|zcform\.com)/[^\s\'"<>]+~i', $code, $url)) {
                return null;
            }

            try {
                $html = Http::timeout(15)->get(html_entity_decode($url[0], ENT_QUOTES))->body();
            } catch (Throwable) {
                return null;
            }
        }

        // En el script las comillas pueden venir con barra invertida: por eso el «\\?» antes de cada una.
        $quote = '\\\\?[\'"]';

        if (! preg_match('~action='.$quote.'(https://crm\.zoho\.'.self::REGIONS.'/crm/WebToLeadForm)~i', $html, $action)) {
            return null;
        }

        $fields = [];
        foreach (['xnQsjsdp', 'xmIwtLD', 'actionType'] as $name) {
            if (! preg_match('~name='.$quote.$name.$quote.'\s+value='.$quote.'([A-Za-z0-9+/=_-]+)~', $html, $value)) {
                return null;
            }
            $fields[$name] = $value[1];
        }

        return ['action' => $action[1], 'fields' => $fields];
    }
}
