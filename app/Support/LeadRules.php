<?php

namespace App\Support;

use Closure;

/**
 * Reglas de los datos de contacto (cotizador y formulario de la página):
 *  - Nombre: solo letras, espacios y . ' -
 *  - Empresa: el nombre de la empresa (lleva al menos una letra; no se acepta solo números).
 *  - Celular / WhatsApp: 9 números que empiezan con 9.
 * El mismo criterio se aplica en el navegador (resources/js/lib/validate.ts).
 */
class LeadRules
{
    public const NAME_MESSAGE = 'Escribe tu nombre solo con letras.';

    public const COMPANY_MESSAGE = 'Escribe el nombre de tu empresa (con letras).';

    public const PHONE_MESSAGE = 'Escribe un celular de 9 números que empiece con 9 (ej. 987654321).';

    public static function isName(string $value): bool
    {
        $value = trim($value);

        return mb_strlen($value) >= 2 && preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M}\\s.'’-]*$/u", $value) === 1;
    }

    public static function isCompany(string $value): bool
    {
        $value = trim($value);
        if (mb_strlen($value) < 2 || mb_strlen($value) > 150) {
            return false;
        }

        return preg_match('/\p{L}/u', $value) === 1
            && preg_match("/^[\\p{L}\\p{M}\\p{N}\\s.,&'’\\-\\/()]+$/u", $value) === 1;
    }

    public static function isPhone(string $value): bool
    {
        return preg_match('/^9\d{8}$/', preg_replace('/[\s\-]+/', '', trim($value)) ?? '') === 1;
    }

    public static function name(): Closure
    {
        return fn (string $attribute, mixed $value, Closure $fail) => self::isName((string) $value) ?: $fail(self::NAME_MESSAGE);
    }

    public static function company(): Closure
    {
        return fn (string $attribute, mixed $value, Closure $fail) => self::isCompany((string) $value) ?: $fail(self::COMPANY_MESSAGE);
    }

    public static function phone(): Closure
    {
        return fn (string $attribute, mixed $value, Closure $fail) => self::isPhone((string) $value) ?: $fail(self::PHONE_MESSAGE);
    }
}
