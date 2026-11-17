<?php

namespace Tests\Feature;

use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleSheetsLeadTest extends TestCase
{
    use RefreshDatabase;

    private function enable(): void
    {
        config([
            'services.google_sheets.webhook_url' => 'https://script.google.com/macros/s/TEST/exec',
            'services.google_sheets.secret' => 'clave',
        ]);
    }

    public function test_copia_cada_lead_nuevo_a_google_sheets(): void
    {
        $this->enable();
        Http::fake(['script.google.com/*' => Http::response(['ok' => true, 'fila' => 2])]);

        $this->post(route('leads.store'), [
            'name' => 'Ana Torres', 'company' => 'ACME SAC', 'email' => 'ana@acme.pe', 'phone' => '999111222',
            'message' => 'Mejorar el Wi-Fi',
        ])->assertSessionHasNoErrors();

        Http::assertSent(fn ($request) => $request->url() === 'https://script.google.com/macros/s/TEST/exec'
            && $request['secreto'] === 'clave'
            && $request['nombre'] === 'Ana Torres'
            && $request['empresa'] === 'ACME SAC'
            && $request['correo'] === 'ana@acme.pe'
            && $request['mensaje'] === 'Mejorar el Wi-Fi'
            && $request['estado'] === 'Nuevo'
            && $request['extras'] === []);
    }

    public function test_no_envia_nada_si_la_integracion_esta_apagada(): void
    {
        config(['services.google_sheets.webhook_url' => null, 'services.google_sheets.secret' => null]);
        Http::fake();

        $this->post(route('leads.store'), ['name' => 'Ana Torres', 'email' => 'ana@acme.pe'])->assertSessionHasNoErrors();

        $this->assertTrue(Lead::where('email', 'ana@acme.pe')->exists());
        Http::assertNothingSent();
    }

    public function test_guarda_el_lead_aunque_google_falle(): void
    {
        $this->enable();
        Http::fake(['script.google.com/*' => Http::response('error', 500)]);

        $this->post(route('leads.store'), ['name' => 'Ana Torres', 'email' => 'ana@acme.pe'])->assertSessionHasNoErrors();

        Http::assertSentCount(2); // 2 intentos en total, y aun así el lead queda guardado
        $this->assertTrue(Lead::where('email', 'ana@acme.pe')->exists());
    }
}
