<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hoja de reclamación completa: información de la compra (comprobante, contrato, producto),
 * la solución que espera el consumidor y los archivos adjuntos (fotos, factura, video).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            // Información de la compra (opcional)
            $table->string('voucher_type', 20)->nullable()->after('good_type');
            $table->string('voucher_number', 30)->nullable()->after('voucher_type');
            $table->date('purchase_date')->nullable()->after('voucher_number');
            $table->string('contract_number', 30)->nullable()->after('purchase_date');
            $table->string('product_code', 50)->nullable()->after('contract_number');
            $table->string('product_name', 150)->nullable()->after('product_code');
            $table->string('product_brand', 80)->nullable()->after('product_name');
            $table->string('product_model', 80)->nullable()->after('product_brand');

            // Solución que espera el consumidor
            $table->string('expected_solution', 30)->nullable()->after('detail');
            $table->string('solution_other')->nullable()->after('expected_solution');
        });

        Schema::create('claim_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->cascadeOnDelete();
            $table->string('type', 10); // photo | voucher | video
            $table->string('path'); // disco privado (storage/app/private): solo se ve desde el panel
            $table->string('original_name');
            $table->string('mime', 100);
            $table->unsignedInteger('size'); // bytes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_attachments');

        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn([
                'voucher_type', 'voucher_number', 'purchase_date', 'contract_number',
                'product_code', 'product_name', 'product_brand', 'product_model',
                'expected_solution', 'solution_other',
            ]);
        });
    }
};
