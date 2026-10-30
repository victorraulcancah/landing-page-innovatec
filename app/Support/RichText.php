<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Limpia el texto con formato que escribe el editor del panel.
 *
 * Solo sobrevive una lista corta de etiquetas; todo lo demás (scripts, estilos, eventos, enlaces
 * «javascript:») se elimina antes de guardar. Los colores no se guardan como valor sino como clase
 * (`t-accent`, `m-primary`…) para que sigan la paleta del tema cuando se cambie.
 */
class RichText
{
    /** Colores de texto del tema que el editor ofrece. */
    public const TONES = ['primary', 'accent', 'dark', 'muted', 'light'];

    /** Colores de resaltado (fondo) del tema que el editor ofrece. */
    public const MARKS = ['primary', 'accent', 'surface', 'dark'];

    /** @var array<string, HTMLPurifier> */
    private static array $purifiers = [];

    /** @param bool $inline true = una sola línea (titulares): sin párrafos, listas ni enlaces. */
    public static function clean(mixed $value, bool $inline = false): string
    {
        if (! is_scalar($value)) {
            return '';
        }

        $html = mb_substr(trim((string) $value), 0, $inline ? 1200 : 10000);
        if ($html === '') {
            return '';
        }

        return trim(self::purifier($inline)->purify($html));
    }

    private static function purifier(bool $inline): HTMLPurifier
    {
        $key = $inline ? 'inline' : 'block';

        return self::$purifiers[$key] ??= new HTMLPurifier(self::config($inline));
    }

    private static function config(bool $inline): HTMLPurifier_Config
    {
        $config = HTMLPurifier_Config::createDefault();

        $config->set('Cache.DefinitionImpl', null);
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('HTML.Allowed', $inline
            ? 'strong,em,u,s,br,span[class]'
            : 'p[style],br,strong,em,u,s,ul,ol,li,span[class],a[href|target|rel]');
        $config->set('CSS.AllowedProperties', ['text-align']);
        $config->set('Attr.AllowedClasses', [
            ...array_map(fn ($t) => "t-$t", self::TONES),
            ...array_map(fn ($m) => "m-$m", self::MARKS),
        ]);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('Attr.AllowedRel', ['noopener', 'noreferrer', 'nofollow']);

        return $config;
    }
}
