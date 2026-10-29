<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status', 16)->default('draft')->index();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 300)->nullable();
            $table->json('theme')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('campaign_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->string('anchor', 64)->nullable();
            $table->string('nav_label', 40)->nullable();
            $table->json('content');
            $table->json('style');
            $table->timestamps();

            $table->index(['campaign_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_sections');
        Schema::dropIfExists('campaigns');
    }
};
