<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/** Hoja del Libro de Reclamaciones virtual. */
class Claim extends Model
{
    public const TYPES = ['reclamo' => 'Reclamo', 'queja' => 'Queja'];

    public const DOC_TYPES = ['DNI' => 'DNI', 'CE' => 'Carné de extranjería', 'PASAPORTE' => 'Pasaporte', 'RUC' => 'RUC'];

    public const GOOD_TYPES = ['producto' => 'Producto', 'servicio' => 'Servicio'];

    public const VOUCHER_TYPES = [
        'boleta' => 'Boleta de venta',
        'factura' => 'Factura',
        'nota_venta' => 'Nota de venta',
        'contrato' => 'Contrato',
        'otro' => 'Otro',
    ];

    public const SOLUTIONS = [
        'devolucion' => 'Devolución del dinero',
        'cambio' => 'Cambio o reposición del producto',
        'reparacion' => 'Reparación o mantenimiento',
        'cumplimiento' => 'Cumplimiento del servicio contratado',
        'correccion_cobro' => 'Corrección de cobros o cuotas',
        'otra' => 'Otra solución',
    ];

    public const STATUSES = ['pending' => 'Pendiente', 'answered' => 'Atendido'];

    /** Plazo legal para responder (Ley N° 31435): 15 días hábiles. */
    public const RESPONSE_DAYS = 15;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_minor' => 'boolean',
            'accepted_truth' => 'boolean',
            'accepted_privacy' => 'boolean',
            'accepted_conforme' => 'boolean',
            'amount' => 'decimal:2',
            'purchase_date' => 'date:Y-m-d',
            'provider' => 'array',
            'answered_at' => 'datetime',
        ];
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ClaimAttachment::class);
    }

    /** Fecha máxima de respuesta: 15 días hábiles (lunes a viernes) desde el registro. */
    public function dueDate(): ?string
    {
        return $this->created_at ? Carbon::parse($this->created_at)->addWeekdays(self::RESPONSE_DAYS)->toDateString() : null;
    }

    public function isOverdue(): bool
    {
        $due = $this->dueDate();

        return $this->status === 'pending' && $due !== null && now()->startOfDay()->gt(Carbon::parse($due));
    }

    /** La solución que espera el consumidor, en texto (la «otra» que escribió, si eligió esa opción). */
    public function solutionText(): ?string
    {
        return $this->expected_solution === 'otra' ? $this->solution_other : (self::SOLUTIONS[$this->expected_solution] ?? null);
    }

    /** Resumen en texto de la hoja: es el cuerpo del correo que recibe el consumidor. */
    public function summaryText(): string
    {
        $provider = $this->provider ?? [];
        $product = collect([$this->product_name, $this->product_brand, $this->product_model])->filter()->implode(' · ');
        $voucher = collect([self::VOUCHER_TYPES[$this->voucher_type] ?? null, $this->voucher_number, $this->purchase_date?->format('d/m/Y')])->filter()->implode(' · ');

        return collect([
            "HOJA DE RECLAMACIÓN N° {$this->code}",
            'Fecha: '.$this->created_at->format('d/m/Y H:i'),
            'Fecha límite de respuesta: '.Carbon::parse($this->dueDate())->format('d/m/Y').' ('.self::RESPONSE_DAYS.' días hábiles)',
            '',
            'Proveedor: '.($provider['name'] ?: '—').' · RUC '.($provider['ruc'] ?: '—'),
            'Dirección: '.($provider['address'] ?: '—'),
            '',
            'Tipo de registro: '.self::TYPES[$this->type],
            "Consumidor: {$this->name} ({$this->doc_type} {$this->doc_number})",
            "Domicilio: {$this->address}",
            "Celular: {$this->phone} · Correo: {$this->email}",
            $this->is_minor ? "Apoderado: {$this->guardian_name} ({$this->guardian_doc_type} {$this->guardian_doc_number})" : null,
            '',
            'Bien contratado: '.self::GOOD_TYPES[$this->good_type].($this->amount !== null ? " · Monto reclamado: S/ {$this->amount}" : ''),
            "Descripción: {$this->good_description}",
            $product !== '' ? "Producto: {$product}".($this->product_code ? " (código {$this->product_code})" : '') : null,
            $voucher !== '' ? "Comprobante: {$voucher}" : null,
            $this->contract_number ? "N° de contrato: {$this->contract_number}" : null,
            '',
            "Detalle: {$this->detail}",
            $this->solutionText() ? 'Solución esperada: '.$this->solutionText() : null,
            "Pedido del consumidor: {$this->request}",
            '',
            'La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.',
        ])->filter(fn ($line) => $line !== null)->implode("\n");
    }
}
