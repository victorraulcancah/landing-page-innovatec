<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// La landing publica aun no se construye: por ahora la raiz lleva al panel.
Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
