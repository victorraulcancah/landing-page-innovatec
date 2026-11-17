<?php

namespace App\Providers;

use App\Jobs\SendLeadToGoogleSheet;
use App\Models\Lead;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cada lead nuevo (del formulario o del cotizador) también se copia a Google Sheets.
        Lead::created(fn (Lead $lead) => SendLeadToGoogleSheet::dispatchAfterResponse($lead));
    }
}
