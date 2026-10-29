<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    public const STATUSES = [
        'new' => 'Nuevo',
        'contacted' => 'Contactado',
        'meeting' => 'Reunión agendada',
        'won' => 'Cerrado',
        'lost' => 'Descartado',
    ];

    protected $fillable = ['campaign_id', 'name', 'company', 'email', 'phone', 'message', 'status'];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}
