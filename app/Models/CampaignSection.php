<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignSection extends Model
{
    protected $fillable = ['campaign_id', 'type', 'position', 'is_visible', 'anchor', 'nav_label', 'content', 'style'];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean', 'content' => 'array', 'style' => 'array'];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
