<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Libro de Reclamaciones virtual (Código de Protección y Defensa del Consumidor, Ley N° 29571).
 * Cada fila es una hoja de reclamación: datos del consumidor, bien contratado, detalle y pedido,
 * los datos del proveedor al momento del registro y la respuesta que se le da al consumidor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->nullable()->unique(); // correlativo: 2026-000001
            $table->string('type', 10); // reclamo | queja

            // 1. Consumidor
            $table->string('name', 150);
            $table->string('doc_type', 20);
            $table->string('doc_number', 20);
            $table->string('address');
            $table->string('phone', 20);
            $table->string('email', 150);
            $table->boolean('is_minor')->default(false);
            $table->string('guardian_name', 150)->nullable();
            $table->string('guardian_doc_type', 20)->nullable();
            $table->string('guardian_doc_number', 20)->nullable();

            // 2. Bien contratado
            $table->string('good_type', 10); // producto | servicio
            $table->decimal('amount', 10, 2)->nullable();
            $table->text('good_description');

            // 3. Detalle de la reclamación
            $table->text('detail');
            $table->text('request');

            // Confirmaciones del consumidor al enviar
            $table->boolean('accepted_truth')->default(false);
            $table->boolean('accepted_privacy')->default(false);
            $table->boolean('accepted_conforme')->default(false);

            // Datos del proveedor al momento del registro (razón social, RUC, dirección)
            $table->json('provider')->nullable();

            // 4. Respuesta del proveedor
            $table->string('status', 12)->default('pending')->index(); // pending | answered
            $table->text('response')->nullable();
            $table->timestamp('answered_at')->nullable();

            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
