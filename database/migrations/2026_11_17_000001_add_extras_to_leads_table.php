<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Respuestas a las preguntas extra del formulario (cada una con su pregunta y su respuesta). */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->json('extras')->nullable()->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn('extras');
        });
    }
};
