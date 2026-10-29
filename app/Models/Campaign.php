<?php

namespace App\Models;

use App\Support\SiteDefaults;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Campaign extends Model
{
    public const STATUSES = ['draft' => 'Borrador', 'active' => 'Activa', 'archived' => 'Archivada'];

    protected $fillable = ['name', 'slug', 'status', 'meta_title', 'meta_description', 'theme', 'activated_at'];

    protected function casts(): array
    {
        return ['theme' => 'array', 'activated_at' => 'datetime'];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(CampaignSection::class)->orderBy('position')->orderBy('id');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /** Tema global con los colores propios de la campaña encima (los vacios se heredan). */
    public function resolvedTheme(): array
    {
        $overrides = array_filter($this->theme ?? [], fn ($v) => $v !== null && $v !== '');

        return array_replace(Setting::get('theme'), $overrides);
    }

    /** Deja esta campaña como la unica activa; la anterior queda archivada. */
    public function activate(): void
    {
        DB::transaction(function () {
            static::query()->where('status', 'active')->whereKeyNot($this->getKey())
                ->update(['status' => 'archived']);
            $this->update(['status' => 'active', 'activated_at' => now()]);
        });
    }

    public function duplicate(): static
    {
        return DB::transaction(function () {
            $copy = static::create([
                'name' => $this->name.' (copia)',
                'slug' => static::uniqueSlug($this->name.' copia'),
                'status' => 'draft',
                'meta_title' => $this->meta_title,
                'meta_description' => $this->meta_description,
                'theme' => $this->theme,
            ]);

            foreach ($this->sections as $section) {
                $copy->sections()->create($section->only([
                    'type', 'position', 'is_visible', 'anchor', 'nav_label', 'content', 'style',
                ]));
            }

            return $copy;
        });
    }

    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'campana';
        $slug = $base;
        $i = 2;
        while (static::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    public static function themeKeys(): array
    {
        return array_keys(SiteDefaults::THEME_COLORS);
    }
}
