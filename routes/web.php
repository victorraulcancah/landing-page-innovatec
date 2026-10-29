<?php

use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\Site\LandingController;
use App\Http\Controllers\Site\LeadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing publica: muestra la campaña activa.
Route::get('/', [LandingController::class, 'show'])->name('home');
Route::post('/contacto', [LeadController::class, 'store'])->middleware('throttle:6,1')->name('leads.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'stats' => [
                'active' => \App\Models\Campaign::query()->active()->first(['id', 'name']),
                'campaigns' => \App\Models\Campaign::query()->count(),
                'leads_new' => \App\Models\Lead::query()->where('status', 'new')->count(),
                'leads_total' => \App\Models\Lead::query()->count(),
            ],
        ]);
    })->name('dashboard');

    Route::get('campanas', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::post('campanas', [CampaignController::class, 'store'])->name('campaigns.store');
    Route::get('campanas/{campaign}', [CampaignController::class, 'edit'])->name('campaigns.edit');
    Route::put('campanas/{campaign}', [CampaignController::class, 'update'])->name('campaigns.update');
    Route::delete('campanas/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');
    Route::post('campanas/{campaign}/activar', [CampaignController::class, 'activate'])->name('campaigns.activate');
    Route::post('campanas/{campaign}/archivar', [CampaignController::class, 'archive'])->name('campaigns.archive');
    Route::post('campanas/{campaign}/duplicar', [CampaignController::class, 'duplicate'])->name('campaigns.duplicate');
    Route::get('campanas/{campaign}/vista-previa', [LandingController::class, 'preview'])->name('campaigns.preview');

    Route::post('campanas/{campaign}/secciones', [SectionController::class, 'store'])->name('sections.store');
    Route::put('secciones/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::delete('secciones/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::post('secciones/{section}/visibilidad', [SectionController::class, 'toggle'])->name('sections.toggle');
    Route::post('secciones/{section}/mover', [SectionController::class, 'move'])->name('sections.move');

    Route::get('sitio', [SiteSettingsController::class, 'edit'])->name('site.edit');
    Route::put('sitio/{group}', [SiteSettingsController::class, 'update'])->name('site.update');

    Route::get('contactos', [AdminLeadController::class, 'index'])->name('leads.index');
    Route::put('contactos/{lead}', [AdminLeadController::class, 'update'])->name('leads.update');
    Route::delete('contactos/{lead}', [AdminLeadController::class, 'destroy'])->name('leads.destroy');

    Route::post('medios', [MediaController::class, 'store'])->name('media.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
