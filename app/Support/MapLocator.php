<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

/**
 * Saca las coordenadas exactas de un enlace de Google Maps para centrar el mapa de la página en ese punto.
 *
 * Los enlaces cortos (maps.app.goo.gl) no traen la ubicación a la vista: hay que seguirlos hasta la dirección
 * larga. Solo se visitan dominios de Google (lista cerrada, también en cada redirección), así que un enlace
 * ajeno nunca provoca una petición del servidor.
 */
class MapLocator
{
    private const HOSTS = ['maps.app.goo.gl', 'goo.gl', 'www.google.com', 'google.com', 'maps.google.com', 'www.google.com.pe', 'google.com.pe'];

    private const MAX_HOPS = 5;

    /** @return string|null «lat,lng» o nulo si no se pudo ubicar */
    public static function coordinates(string $url): ?string
    {
        $url = trim($url);

        for ($hop = 0; $hop < self::MAX_HOPS; $hop++) {
            if (! self::allowed($url)) {
                return null;
            }
            if ($found = self::fromUrl($url)) {
                return $found;
            }

            try {
                $response = Http::withoutRedirecting()
                    ->withOptions(['verify' => config('services.http.ca_bundle') ?: true])
                    ->timeout(6)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; UCO360-landing)', 'Accept-Language' => 'es'])
                    ->get($url);
            } catch (\Throwable) {
                return null;
            }

            $next = $response->header('Location');
            if (! $next) {
                return null;
            }

            $url = self::absolute($url, $next);
        }

        return null;
    }

    public static function fromUrl(string $url): ?string
    {
        $decoded = rawurldecode($url);
        $patterns = [
            // El punto del lugar en sí (el más exacto).
            '/!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/',
            // El centro de la vista del mapa.
            '/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/',
            '/[?&](?:q|query|ll|destination)=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $decoded, $m) && abs((float) $m[1]) <= 90 && abs((float) $m[2]) <= 180) {
                return sprintf('%.6F,%.6F', (float) $m[1], (float) $m[2]);
            }
        }

        return null;
    }

    private static function allowed(string $url): bool
    {
        $parts = parse_url($url);

        return ($parts['scheme'] ?? '') === 'https' && in_array(strtolower($parts['host'] ?? ''), self::HOSTS, true);
    }

    private static function absolute(string $from, string $location): string
    {
        if (preg_match('#^https?://#i', $location)) {
            return $location;
        }

        $parts = parse_url($from);

        return ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? '').'/'.ltrim($location, '/');
    }
}
