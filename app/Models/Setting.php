<?php

namespace App\Models;

use App\Support\SiteDefaults;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'site_settings';

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    /** Ajuste completo: valores por defecto con lo guardado encima. */
    public static function get(string $key): array
    {
        $stored = static::query()->where('key', $key)->value('value');

        return SiteDefaults::merge(SiteDefaults::for($key), is_array($stored) ? $stored : []);
    }

    public static function put(string $key, array $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
