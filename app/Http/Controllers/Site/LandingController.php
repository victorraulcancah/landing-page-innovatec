<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Support\LandingPayload;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /** La landing publica muestra la campaña activa. */
    public function show(): Response
    {
        $campaign = Campaign::query()->active()->latest('activated_at')->first();

        return Inertia::render('landing', LandingPayload::build($campaign));
    }

    /** Vista previa de cualquier campaña (borrador incluido) para quien administra. */
    public function preview(Campaign $campaign): Response
    {
        return Inertia::render('landing', LandingPayload::build($campaign, preview: true));
    }
}
