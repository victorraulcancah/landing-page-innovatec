<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Archivo adjunto de una hoja de reclamación (foto, factura o video). Se guarda en el disco privado. */
class ClaimAttachment extends Model
{
    public const DISK = 'local';

    public const TYPES = ['photo' => 'Fotografía', 'voucher' => 'Comprobante', 'video' => 'Video'];

    protected $guarded = [];

    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }
}
