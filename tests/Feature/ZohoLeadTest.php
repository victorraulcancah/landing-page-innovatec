<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ZohoLeadTest extends TestCase
{
    use RefreshDatabase;

    private const ACTION = 'https://crm.zoho.com/crm/WebToLeadForm';

    /** El script de Zoho trae el formulario dentro de una cadena de JavaScript. */
    private const FORM = "(function(){ var formContent = \"<form id='webform1' action='https://crm.zoho.com/crm/WebToLeadForm' method='POST'> <input type='text' style='display:none;' name='xnQsjsdp' value='abc123'></input> <input type='text' style='display:none;' name='xmIwtLD' value='def456'></input> <input type='text' style='display:none;' name='actionType' value='TGVhZHM='></input></form>\"; })();";

    private function save(string $code)
    {
        return $this->actingAs(User::factory()->create())->put(route('site.update', 'zoho'), ['code' => $code]);
    }

    public function test_se_conecta_pegando_el_script_el_enlace_o_el_codigo(): void
    {
        Http::fake(['*' => Http::response(self::FORM)]);

        foreach ([
            "<script id='formScript1' src='https://crm.zoho.com/crm/WebFormServeServlet?rid=xyz&script=\$sYG'>\n</script>",
            'https://zcform.com/abc',
            self::FORM,
        ] as $code) {
            $this->save($code)->assertSessionHasNoErrors();

            $this->assertSame(self::ACTION, Setting::get('zoho')['action']);
            // assertEquals: MySQL guarda el JSON con las claves en otro orden.
            $this->assertEquals(['xnQsjsdp' => 'abc123', 'xmIwtLD' => 'def456', 'actionType' => 'TGVhZHM='], Setting::get('zoho')['fields']);
        }

        Http::assertSentCount(2); // el código pegado completo no necesita pedir nada

        $this->save('')->assertSessionHasNoErrors();
        $this->assertSame('', Setting::get('zoho')['action']);
    }

    public function test_rechaza_lo_que_no_es_un_formulario_de_zoho_sin_pedir_otros_sitios(): void
    {
        Http::fake();

        $this->save('https://ejemplo.com/form')->assertSessionHasErrors('code');

        Http::assertNothingSent();
    }

    public function test_cada_lead_nuevo_se_envia_a_zoho(): void
    {
        $this->save(self::FORM);
        Http::fake(['crm.zoho.com/*' => Http::response('ok')]);

        $this->post(route('leads.store'), [
            'name' => 'Ana Torres', 'company' => 'ACME SAC', 'email' => 'ana@acme.pe', 'phone' => '999111222',
            'message' => 'Mejorar el Wi-Fi',
        ])->assertSessionHasNoErrors();

        Http::assertSent(fn ($request) => $request->url() === self::ACTION
            && $request['xnQsjsdp'] === 'abc123'
            && $request['First Name'] === 'Ana Torres'
            && $request['Last Name'] === 'ACME SAC'
            && $request['Phone'] === '999111222'
            && $request['Description'] === "Mejorar el Wi-Fi\nCorreo: ana@acme.pe");
    }

    public function test_sin_conectar_no_envia_y_si_zoho_falla_el_lead_se_guarda(): void
    {
        Http::fake(['crm.zoho.com/*' => Http::response('error', 500)]);

        $this->post(route('leads.store'), ['name' => 'Ana Torres', 'email' => 'ana@acme.pe'])->assertSessionHasNoErrors();
        Http::assertNothingSent();

        $this->save(self::FORM);
        $this->post(route('leads.store'), ['name' => 'Luis Paz', 'email' => 'luis@acme.pe'])->assertSessionHasNoErrors();

        // Sin reintentos: no se crean contactos repetidos. (Solo se cuenta este lead: en las pruebas las tareas de
        // peticiones anteriores se vuelven a ejecutar al terminar cada petición.)
        $this->assertCount(1, Http::recorded(fn ($request) => $request['First Name'] === 'Luis Paz'));
        $this->assertTrue(Lead::where('email', 'luis@acme.pe')->exists());
    }
}
