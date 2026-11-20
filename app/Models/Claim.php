<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Hoja del Libro de Reclamaciones virtual. */
class Claim extends Model
{
    public const TYPES = ['reclamo' => 'Reclamo', 'queja' => 'Queja'];

    public const DOC_TYPES = ['DNI' => 'DNI', 'CE' => 'Carné de extranjería', 'PASAPORTE' => 'Pasaporte', 'RUC' => 'RUC'];

    public const GOOD_TYPES = ['producto' => 'Producto', 'servicio' => 'Servicio'];

    public const STATUSES = ['pending' => 'Pendiente', 'answered' => 'Atendido'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_minor' => 'boolean',
            'accepted_truth' => 'boolean',
            'accepted_privacy' => 'boolean',
            'accepted_conforme' => 'boolean',
            'amount' => 'decimal:2',
            'provider' => 'array',
            'answered_at' => 'datetime',
        ];
    }
}
