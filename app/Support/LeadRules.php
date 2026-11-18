<?php

namespace App\Support;

use Closure;

/**
 * Reglas de los datos de contacto (cotizador y formulario de la página):
 *  - Nombre: solo letras, espacios y . ' -
 *  - Empresa: un RUC válido (11 dígitos con su dígito verificador) o el nombre de la empresa (lleva al menos una letra).
 *  - Celular / WhatsApp: celular peruano de 9 dígitos que empieza con 9 (con o sin +51), o un número de otro país con «+».
 * El mismo criterio se aplica en el navegador (resources/js/lib/validate.ts).
 */
class LeadRules
{
    public const NAME_MESSAGE = 'Escribe tu nombre solo con letras.';

    public const COMPANY_MESSAGE = 'Escribe un RUC válido de 11 dígitos o el nombre de tu empresa.';

    public const PHONE_MESSAGE = 'Escribe un número de celular válido de 9 dígitos (ej. 987 654 321).';

    public static function isName(string $value): bool
    {
        $value = trim($value);

        return mb_strlen($value) >= 2 && preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M}\\s.'’-]*$/u", $value) === 1;
    }

    /** RUC peruano: 11 dígitos, empieza con 10, 15, 16, 17 o 20 y cumple el dígito verificador (módulo 11). */
    public static function isRuc(string $value): bool
    {
        $digits = preg_replace('/[\s-]+/', '', $value) ?? '';
        if (preg_match('/^(10|15|16|17|20)\d{9}$/', $digits) !== 1) {
            return false;
        }

        $weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        $sum = 0;
        foreach ($weights as $i => $w) {
            $sum += (int) $digits[$i] * $w;
        }
        $check = (11 - ($sum % 11)) % 10;

        return $check === (int) $digits[10];
    }

    public static function isCompany(string $value): bool
    {
        $value = trim($value);
        if ($value === '' || mb_strlen($value) > 150) {
            return false;
        }

        // Sin letras: tiene que ser un RUC. Con letras: es el nombre de la empresa.
        if (preg_match('/\p{L}/u', $value) !== 1) {
            return self::isRuc($value);
        }

        return preg_match("/^[\\p{L}\\p{M}\\p{N}\\s.,&'’\\-\\/()]+$/u", $value) === 1;
    }

    public static function isPhone(string $value): bool
    {
        $compact = preg_replace('/[\s\-()]+/', '', trim($value)) ?? '';

        return preg_match('/^(?:\+?51|0051)?9\d{8}$/', $compact) === 1
            || preg_match('/^\+(?!51)\d{8,15}$/', $compact) === 1;
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
