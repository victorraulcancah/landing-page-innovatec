<?php

namespace Tests\Feature;

use App\Models\Claim;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClaimBookTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, mixed> */
    private function sheet(array $over = []): array
    {
        return [
            'type' => 'reclamo',
            'name' => 'Ana Pérez',
            'doc_type' => 'DNI', 'doc_number' => '12345678',
            'address' => 'Av. Javier Prado 1166, San Isidro',
            'phone' => '987654321', 'email' => 'ana@acme.pe',
            'good_type' => 'servicio', 'amount' => '1500',
            'good_description' => 'Servicio mensual de soporte de TI',
            'detail' => 'El técnico no llegó a la visita semanal acordada.',
            'request' => 'Quiero que se reprograme la visita.',
            'accepted_truth' => true, 'accepted_privacy' => true, 'accepted_conforme' => true,
            ...$over,
        ];
    }

    public function test_el_libro_valida_los_datos_del_consumidor(): void
    {
        Mail::fake();

        // 4 envíos como máximo por minuto: se agrupan los casos.
        $this->post(route('claims.store'), $this->sheet(['name' => 'Ana 123', 'doc_number' => '1234', 'phone' => '326596556', 'email' => 'no-es-correo']))
            ->assertSessionHasErrors(['name', 'doc_number', 'phone', 'email']);

        $this->post(route('claims.store'), $this->sheet(['accepted_truth' => false, 'accepted_privacy' => false, 'accepted_conforme' => false, 'detail' => 'corto', 'request' => 'x']))
            ->assertSessionHasErrors(['accepted_truth', 'accepted_privacy', 'accepted_conforme', 'detail', 'request']);

        // El menor de edad necesita a su apoderado.
        $this->post(route('claims.store'), $this->sheet(['is_minor' => true]))
            ->assertSessionHasErrors(['guardian_name', 'guardian_doc_type', 'guardian_doc_number']);

        $this->assertSame(0, Claim::count());
    }

    public function test_una_hoja_correcta_se_guarda_con_su_numero_y_los_datos_del_proveedor(): void
    {
        Mail::fake();
        Setting::put('footer', [...Setting::get('footer'), 'provider_name' => 'PROINNOVATEC S.A.C.', 'provider_ruc' => '20100070970', 'provider_address' => 'Av. Javier Prado Este 1166']);

        $this->post(route('claims.store'), $this->sheet(['doc_number' => ' 1234 5678 ', 'phone' => '987 654 321']))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('claim_code');

        $claim = Claim::first();
        $this->assertSame(now()->year.'-000001', $claim->code);
        $this->assertSame('12345678', $claim->doc_number);
        $this->assertSame('987654321', $claim->phone);
        $this->assertSame('pending', $claim->status);
        $this->assertSame('PROINNOVATEC S.A.C.', $claim->provider['name']);
        $this->assertSame('20100070970', $claim->provider['ruc']);
        $this->assertTrue($claim->accepted_truth && $claim->accepted_privacy && $claim->accepted_conforme);
    }

    public function test_un_bot_no_deja_hojas_y_el_libro_se_puede_apagar(): void
    {
        Mail::fake();

        $this->post(route('claims.store'), $this->sheet(['website_url' => 'http://spam.example']))->assertSessionHasNoErrors();
        $this->assertSame(0, Claim::count());

        Setting::put('footer', [...Setting::get('footer'), 'claims_enabled' => false]);
        $this->post(route('claims.store'), $this->sheet())->assertNotFound();
    }

    public function test_el_panel_de_reclamos_exige_sesion_y_permite_responder(): void
    {
        Mail::fake();
        $this->get(route('claims.index'))->assertRedirect(route('login'));

        $this->post(route('claims.store'), $this->sheet());
        $claim = Claim::first();

        $this->actingAs(User::factory()->create());
        $this->get(route('claims.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('claims/index')
            ->where('claims.data.0.code', $claim->code)
            ->where('counts.pending', 1));

        $this->put(route('claims.update', $claim), ['response' => 'corta'])->assertSessionHasErrors('response');
        $this->put(route('claims.update', $claim), ['response' => 'Reprogramamos tu visita para el martes a las 10 a. m.'])->assertSessionHasNoErrors();

        $claim->refresh();
        $this->assertSame('answered', $claim->status);
        $this->assertNotNull($claim->answered_at);
        $this->assertStringContainsString('martes', $claim->response);
    }

    public function test_el_pie_guarda_documentos_pdf_y_los_datos_del_proveedor(): void
    {
        $this->actingAs(User::factory()->create());
        $footer = Setting::get('footer');

        // De fábrica: el pie trae el Libro de Reclamaciones y un documento «Términos y Condiciones» sin archivo.
        $this->assertTrue($footer['claims_enabled']);
        $this->assertSame('Términos y Condiciones', $footer['docs'][0]['label']);
        $this->assertNull($footer['docs'][0]['file']);

        $this->put(route('site.update', 'footer'), [
            ...$footer,
            'provider_ruc' => '12',
        ])->assertSessionHasErrors('provider_ruc');

        $this->put(route('site.update', 'footer'), [
            ...$footer,
            'provider_name' => 'PROINNOVATEC S.A.C.', 'provider_ruc' => '20100070970', 'provider_address' => 'San Isidro, Lima',
            'docs' => [
                ['label' => 'Términos y Condiciones', 'file' => '/uploads/terminos.pdf'],
                ['label' => 'Peligroso', 'file' => '/uploads/virus.exe'],
                ['label' => 'Externo', 'file' => 'https://malo.com/a.pdf'],
                ['label' => '', 'file' => ''],
            ],
        ])->assertSessionHasNoErrors();

        $saved = Setting::get('footer');
        $this->assertSame('/uploads/terminos.pdf', $saved['docs'][0]['file']);
        $this->assertNull($saved['docs'][1]['file']);
        $this->assertNull($saved['docs'][2]['file']);
        $this->assertCount(3, $saved['docs']);
        $this->assertSame('20100070970', $saved['provider_ruc']);

        // Lo que ve el visitante
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('footer.docs.0.file', '/uploads/terminos.pdf')
            ->where('footer.claims_enabled', true)
            ->where('footer.provider_name', 'PROINNOVATEC S.A.C.'));
    }
}
