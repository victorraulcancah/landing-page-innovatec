<?php

namespace Tests\Feature;

use App\Models\Claim;
use App\Models\ClaimAttachment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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

    public function test_el_libro_es_una_pagina_con_el_formulario_completo(): void
    {
        $this->get(route('claims.create'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('libro/create')
            ->where('days', 15)
            ->has('options.docTypes')
            ->has('options.voucherTypes')
            ->has('options.solutions')
            ->has('theme')->has('footer')->has('contact')->has('navbar'));

        $this->get(route('claims.lookup'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('libro/lookup')->where('result', null));

        // Apagado desde el panel: la página y el envío desaparecen.
        Setting::put('footer', [...Setting::get('footer'), 'claims_enabled' => false]);
        $this->get(route('claims.create'))->assertNotFound();
        $this->get(route('claims.lookup'))->assertNotFound();
    }

    public function test_el_libro_valida_los_datos(): void
    {
        Mail::fake();

        // 4 envíos como máximo por minuto: se agrupan los casos.
        $this->post(route('claims.store'), $this->sheet(['name' => 'Ana 123', 'doc_number' => '1234', 'phone' => '326596556', 'email' => 'no-es-correo', 'amount' => '']))
            ->assertSessionHasErrors(['name', 'doc_number', 'phone', 'email', 'amount']);

        $this->post(route('claims.store'), $this->sheet(['accepted_truth' => false, 'accepted_privacy' => false, 'accepted_conforme' => false, 'detail' => 'corto', 'request' => 'x']))
            ->assertSessionHasErrors(['accepted_truth', 'accepted_privacy', 'accepted_conforme', 'detail', 'request']);

        // Apoderado del menor, «otra solución» y fecha de compra futura.
        $this->post(route('claims.store'), $this->sheet(['is_minor' => true, 'expected_solution' => 'otra', 'purchase_date' => now()->addDay()->toDateString()]))
            ->assertSessionHasErrors(['guardian_name', 'guardian_doc_type', 'guardian_doc_number', 'solution_other', 'purchase_date']);

        // Adjuntos que no corresponden.
        $this->post(route('claims.store'), $this->sheet([
            'photos' => [UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')],
            'video' => UploadedFile::fake()->create('v.mov', 10, 'video/quicktime'),
        ]))->assertSessionHasErrors(['photos.0', 'video']);

        $this->assertSame(0, Claim::count());
    }

    public function test_una_hoja_completa_se_guarda_con_numero_adjuntos_y_constancia(): void
    {
        Mail::fake();
        Storage::fake(ClaimAttachment::DISK);
        Setting::put('footer', [...Setting::get('footer'), 'provider_name' => 'PROINNOVATEC S.A.C.', 'provider_ruc' => '20100070970', 'provider_address' => 'Av. Javier Prado Este 1166']);

        $response = $this->post(route('claims.store'), $this->sheet([
            'doc_number' => ' 1234 5678 ', 'phone' => '987 654 321',
            'voucher_type' => 'factura', 'voucher_number' => 'F001-00012345', 'purchase_date' => '2026-03-10', 'contract_number' => 'UCO-000123',
            'product_code' => 'SN-998877', 'product_name' => 'Firewall', 'product_brand' => 'Fortinet', 'product_model' => '60F',
            'expected_solution' => 'cumplimiento',
            'photos' => [UploadedFile::fake()->image('foto1.jpg'), UploadedFile::fake()->image('foto2.png')],
            'voucher_file' => UploadedFile::fake()->create('factura.pdf', 120, 'application/pdf'),
            'video' => UploadedFile::fake()->create('evidencia.mp4', 800, 'video/mp4'),
        ]));

        $claim = Claim::with('attachments')->first();
        $this->assertSame(now()->year.'-000001', $claim->code);
        $this->assertSame('12345678', $claim->doc_number);
        $this->assertSame('987654321', $claim->phone);
        $this->assertSame('pending', $claim->status);
        $this->assertSame('PROINNOVATEC S.A.C.', $claim->provider['name']);
        $this->assertSame('factura', $claim->voucher_type);
        $this->assertSame('Fortinet', $claim->product_brand);
        $this->assertSame('Cumplimiento del servicio contratado', $claim->solutionText());

        // Adjuntos: 2 fotos, la factura y el video, en el disco privado.
        $this->assertCount(4, $claim->attachments);
        $this->assertSame(2, $claim->attachments->where('type', 'photo')->count());
        foreach ($claim->attachments as $a) {
            Storage::disk(ClaimAttachment::DISK)->assertExists($a->path);
        }

        // La hoja termina en su constancia: una dirección firmada que solo tiene quien la registró.
        $receiptUrl = $response->assertRedirect()->headers->get('Location');
        $this->assertStringContainsString('signature=', $receiptUrl);
        $this->get($receiptUrl)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('libro/receipt')
            ->where('claim.code', $claim->code)
            ->where('claim.solution', 'Cumplimiento del servicio contratado')
            ->has('claim.attachments', 4));
        $this->get(route('claims.receipt', $claim))->assertForbidden();

        // El plazo es de 15 días hábiles.
        $this->assertSame(now()->addWeekdays(15)->toDateString(), $claim->dueDate());
    }

    public function test_la_consulta_exige_numero_de_hoja_y_documento(): void
    {
        Mail::fake();
        $this->post(route('claims.store'), $this->sheet());
        $claim = Claim::first();

        // Con otro documento no se ve la hoja (nadie consulta hojas ajenas).
        $this->post(route('claims.search'), ['code' => $claim->code, 'doc_number' => '99999999'])->assertSessionHasErrors('code');

        $this->post(route('claims.search'), ['code' => $claim->code, 'doc_number' => '1234 5678'])->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('libro/lookup')
            ->where('result.code', $claim->code)
            ->where('result.status', 'pending')
            ->where('result.response', null));

        $claim->update(['status' => 'answered', 'response' => 'Reprogramamos tu visita para el martes.', 'answered_at' => now()]);
        $this->post(route('claims.search'), ['code' => $claim->code, 'doc_number' => '12345678'])->assertInertia(fn (Assert $page) => $page
            ->where('result.status', 'answered')
            ->where('result.response', 'Reprogramamos tu visita para el martes.'));
    }

    public function test_un_bot_no_deja_hojas(): void
    {
        Mail::fake();

        $this->post(route('claims.store'), $this->sheet(['website_url' => 'http://spam.example']))->assertSessionHasNoErrors();
        $this->assertSame(0, Claim::count());
    }

    public function test_el_panel_exige_sesion_muestra_adjuntos_y_permite_responder(): void
    {
        Mail::fake();
        Storage::fake(ClaimAttachment::DISK);

        $this->get(route('claims.index'))->assertRedirect(route('login'));

        $this->post(route('claims.store'), $this->sheet(['voucher_file' => UploadedFile::fake()->create('factura.pdf', 50, 'application/pdf')]));
        $claim = Claim::with('attachments')->first();
        $attachment = $claim->attachments->first();

        // Los adjuntos son privados: solo los abre quien administra.
        $this->get(route('claims.attachment', $attachment))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create());
        $this->get(route('claims.attachment', $attachment))->assertOk();
        $this->get(route('claims.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('claims/index')
            ->where('claims.data.0.code', $claim->code)
            ->where('claims.data.0.overdue', false)
            ->has('claims.data.0.attachments', 1)
            ->where('counts.pending', 1));
        $this->get(route('claims.index', ['q' => '12345678']))->assertInertia(fn (Assert $page) => $page->has('claims.data', 1));
        $this->get(route('claims.index', ['q' => 'no-existe']))->assertInertia(fn (Assert $page) => $page->has('claims.data', 0));

        $this->put(route('claims.update', $claim), ['response' => 'corta'])->assertSessionHasErrors('response');
        $this->put(route('claims.update', $claim), ['response' => 'Reprogramamos tu visita para el martes a las 10 a. m.'])->assertSessionHasNoErrors();

        $claim->refresh();
        $this->assertSame('answered', $claim->status);
        $this->assertNotNull($claim->answered_at);
    }

    public function test_el_pie_se_arma_en_columnas_de_enlaces_editables(): void
    {
        $this->actingAs(User::factory()->create());
        $footer = Setting::get('footer');

        // De fábrica: 3 columnas, y el Libro y los Términos están en «Servicio al cliente».
        $this->assertSame(['Conócenos', 'Soluciones', 'Servicio al cliente'], array_column($footer['columns'], 'title'));
        $kinds = array_column($footer['columns'][2]['links'], 'kind');
        $this->assertContains('claims', $kinds);
        $this->assertContains('doc', $kinds);

        $this->put(route('site.update', 'footer'), [
            ...$footer,
            'columns' => [
                ['title' => 'Empresa', 'links' => [
                    ['label' => 'Inicio', 'kind' => 'anchor', 'value' => '#inicio'],
                    ['label' => 'Blog', 'kind' => 'url', 'value' => 'https://proinnovatec.com/blog'],
                    ['label' => 'Malo', 'kind' => 'url', 'value' => 'javascript:alert(1)'],
                    ['label' => '', 'kind' => 'anchor', 'value' => 'sin-texto'],
                ]],
                ['title' => '', 'links' => []],
            ],
        ])->assertSessionHasNoErrors();

        $saved = Setting::get('footer')['columns'];
        $this->assertCount(1, $saved);
        $links = $saved[0]['links'];
        $this->assertCount(3, $links);
        $this->assertSame('inicio', $links[0]['value']);
        $this->assertSame('https://proinnovatec.com/blog', $links[1]['value']);
        $this->assertSame('', $links[2]['value']);

        $this->put(route('site.update', 'footer'), [...$footer, 'columns' => [['title' => 'X', 'links' => [['label' => 'Y', 'kind' => 'inventado', 'value' => '']]]]])
            ->assertSessionHasErrors('columns.0.links.0.kind');

        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('footer.columns.0.title', 'Empresa'));
    }

    public function test_el_pie_guarda_documentos_pdf_y_los_datos_del_proveedor(): void
    {
        $this->actingAs(User::factory()->create());
        $footer = Setting::get('footer');

        // De fábrica: el pie trae el Libro de Reclamaciones y un documento «Términos y Condiciones» sin archivo.
        $this->assertTrue($footer['claims_enabled']);
        $this->assertSame('Términos y Condiciones', $footer['docs'][0]['label']);
        $this->assertSame('', $footer['docs'][0]['text']);
        $this->assertNull($footer['docs'][0]['file']);

        $this->put(route('site.update', 'footer'), [...$footer, 'provider_ruc' => '12'])->assertSessionHasErrors('provider_ruc');

        $this->put(route('site.update', 'footer'), [
            ...$footer,
            'provider_name' => 'PROINNOVATEC S.A.C.', 'provider_ruc' => '20100070970', 'provider_address' => 'San Isidro, Lima',
            'docs' => [
                ['label' => 'Términos y Condiciones', 'text' => '<p>Texto de los <strong>términos</strong>.</p><script>alert(1)</script>', 'file' => '/uploads/terminos.pdf'],
                ['label' => 'Peligroso', 'text' => '', 'file' => '/uploads/virus.exe'],
                ['label' => 'Externo', 'text' => '', 'file' => 'https://malo.com/a.pdf'],
                ['label' => '', 'text' => '<p>Solo texto</p>', 'file' => ''],
                ['label' => '', 'text' => '', 'file' => ''],
            ],
        ])->assertSessionHasNoErrors();

        $saved = Setting::get('footer');
        $this->assertSame('/uploads/terminos.pdf', $saved['docs'][0]['file']);
        $this->assertStringContainsString('<strong>términos</strong>', $saved['docs'][0]['text']);
        $this->assertStringNotContainsString('<script', $saved['docs'][0]['text']);
        $this->assertNull($saved['docs'][1]['file']);
        $this->assertNull($saved['docs'][2]['file']);
        // Se conservan los que tienen nombre, texto o archivo; el totalmente vacío se descarta.
        $this->assertCount(4, $saved['docs']);
        $this->assertSame('20100070970', $saved['provider_ruc']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('footer.docs.0.file', '/uploads/terminos.pdf')
            ->where('footer.claims_enabled', true)
            ->where('footer.provider_name', 'PROINNOVATEC S.A.C.'));
    }
}
