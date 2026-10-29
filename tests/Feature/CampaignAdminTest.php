<?php

namespace Tests\Feature;

use App\Models\Campaign;
use App\Models\CampaignSection;
use App\Models\Lead;
use App\Models\Setting;
use App\Models\User;
use App\Support\SectionTypes;
use Database\Seeders\CampaignSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CampaignAdminTest extends TestCase
{
    use RefreshDatabase;

    private function makeCampaign(string $name = 'Campaña de prueba', string $status = 'draft'): Campaign
    {
        return Campaign::create(['name' => $name, 'slug' => Campaign::uniqueSlug($name), 'status' => $status]);
    }

    private function addSection(Campaign $campaign, string $type, int $position, array $content = [], bool $visible = true): CampaignSection
    {
        return $campaign->sections()->create([
            'type' => $type,
            'position' => $position,
            'is_visible' => $visible,
            'content' => $content ?: SectionTypes::all()[$type]['defaults'],
            'style' => SectionTypes::defaultStyle(),
        ]);
    }

    private function login(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        return $user;
    }

    public function test_el_panel_exige_iniciar_sesion(): void
    {
        $this->get('/campanas')->assertRedirect('/login');
        $this->get('/sitio')->assertRedirect('/login');
        $this->get('/contactos')->assertRedirect('/login');
        $this->post('/medios')->assertRedirect('/login');
    }

    public function test_la_landing_muestra_solo_la_campana_activa_y_sus_secciones_visibles(): void
    {
        $active = $this->makeCampaign('Activa', 'active');
        $this->addSection($active, 'hero', 1, ['title' => 'Titular visible']);
        $this->addSection($active, 'faq', 2, ['title' => 'Oculta'], visible: false);
        $this->addSection($this->makeCampaign('Borrador'), 'hero', 1, ['title' => 'No debe salir']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('landing')
            ->where('campaign.name', 'Activa')
            ->has('sections', 1)
            ->where('sections.0.content.title', 'Titular visible'));
    }

    public function test_sin_campana_activa_la_landing_no_falla(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->where('campaign', null)->has('sections', 0));
    }

    public function test_activar_una_campana_archiva_la_anterior_y_deja_una_sola_en_linea(): void
    {
        $this->login();
        $a = $this->makeCampaign('A', 'active');
        $b = $this->makeCampaign('B');

        $this->post(route('campaigns.activate', $b))->assertRedirect();

        $this->assertSame('archived', $a->fresh()->status);
        $this->assertSame('active', $b->fresh()->status);
        $this->assertSame(1, Campaign::query()->active()->count());
    }

    public function test_no_se_puede_eliminar_la_campana_en_linea(): void
    {
        $this->login();
        $active = $this->makeCampaign('En linea', 'active');

        $this->delete(route('campaigns.destroy', $active))->assertSessionHas('error');
        $this->assertNotNull(Campaign::find($active->id));
    }

    public function test_una_campana_nueva_nace_como_borrador_con_portada_y_llamado_final(): void
    {
        $this->login();

        $this->post(route('campaigns.store'), ['name' => 'Backups verificados'])->assertRedirect();

        $campaign = Campaign::firstWhere('name', 'Backups verificados');
        $this->assertSame('draft', $campaign->status);
        $this->assertSame(['hero', 'cta'], $campaign->sections->pluck('type')->all());
    }

    public function test_duplicar_copia_las_secciones_y_deja_la_copia_en_borrador(): void
    {
        $this->login();
        $original = $this->makeCampaign('Original', 'active');
        $this->addSection($original, 'hero', 1, ['title' => 'Hola']);

        $this->post(route('campaigns.duplicate', $original));

        $copy = Campaign::firstWhere('name', 'Original (copia)');
        $this->assertSame('draft', $copy->status);
        $this->assertCount(1, $copy->sections);
    }

    public function test_guardar_una_seccion_descarta_campos_desconocidos_y_valores_peligrosos(): void
    {
        $this->login();
        $section = $this->addSection($this->makeCampaign(), 'hero', 1);

        $this->put(route('sections.update', $section), [
            'is_visible' => true,
            'anchor' => 'inicio',
            'nav_label' => 'Inicio',
            'content' => [
                'title' => '  Nuevo titular  ',
                'inyectado' => '<script>alert(1)</script>',
                'image' => 'javascript:alert(1)',
                'primary_cta' => ['label' => 'Ir', 'action' => 'hackear', 'value' => ''],
            ],
            'style' => ['bg_color' => 'url(x)', 'text_color' => '#ABCDEF', 'align' => 'diagonal', 'padding' => 'lg'],
        ])->assertSessionHasNoErrors();

        $section->refresh();
        $this->assertSame('Nuevo titular', $section->content['title']);
        $this->assertArrayNotHasKey('inyectado', $section->content);
        $this->assertNull($section->content['image']);
        $this->assertSame('lead_form', $section->content['primary_cta']['action']);
        $this->assertNull($section->style['bg_color']);
        $this->assertSame('#abcdef', $section->style['text_color']);
        $this->assertSame('left', $section->style['align']);
        $this->assertSame('lg', $section->style['padding']);
    }

    public function test_las_secciones_se_pueden_reordenar(): void
    {
        $this->login();
        $campaign = $this->makeCampaign();
        $first = $this->addSection($campaign, 'hero', 1);
        $second = $this->addSection($campaign, 'faq', 2);

        $this->post(route('sections.move', $second), ['direction' => 'up']);

        $this->assertSame([$second->id, $first->id], $campaign->sections()->pluck('id')->all());
    }

    public function test_el_ancla_solo_admite_caracteres_seguros(): void
    {
        $this->login();
        $section = $this->addSection($this->makeCampaign(), 'hero', 1);

        $this->put(route('sections.update', $section), [
            'is_visible' => true, 'anchor' => 'mal ancla!', 'content' => [], 'style' => [],
        ])->assertSessionHasErrors('anchor');
    }

    public function test_los_ajustes_del_navbar_se_guardan_y_las_listas_reemplazan_a_las_anteriores(): void
    {
        $this->login();

        $payload = [
            'brand_text' => 'UCO360', 'brand_sub' => '', 'logo' => null, 'logo_position' => 'center',
            'links_mode' => 'manual', 'links_align' => 'center',
            'links' => [['label' => 'Servicios', 'target' => '#servicios']],
            'show_cta' => true, 'cta' => ['label' => 'Hablemos', 'action' => 'whatsapp', 'value' => ''],
            'bg_color' => '#112233', 'text_color' => null, 'sticky' => false, 'border' => false,
        ];
        $this->put(route('site.update', 'navbar'), $payload)->assertSessionHasNoErrors();

        $navbar = Setting::get('navbar');
        $this->assertSame('center', $navbar['logo_position']);
        $this->assertCount(1, $navbar['links']);
        $this->assertSame('#112233', $navbar['bg_color']);
        $this->assertFalse($navbar['sticky']);

        $this->put(route('site.update', 'navbar'), [...$payload, 'links' => []]);
        $this->assertSame([], Setting::get('navbar')['links']);
    }

    public function test_el_tema_rechaza_colores_invalidos_y_acepta_una_paleta_valida(): void
    {
        $this->login();
        $theme = Setting::get('theme');

        $this->put(route('site.update', 'theme'), [...$theme, 'primary' => 'rojo'])->assertSessionHasErrors('primary');
        $this->put(route('site.update', 'theme'), [...$theme, 'primary' => '#AA0000'])->assertSessionHasNoErrors();

        $this->assertSame('#aa0000', Setting::get('theme')['primary']);
    }

    public function test_cada_campana_puede_sobrescribir_colores_y_hereda_el_resto_del_sitio(): void
    {
        $this->login();
        $campaign = $this->makeCampaign('Con tema', 'active');

        $this->put(route('campaigns.update', $campaign), [
            'name' => 'Con tema', 'slug' => $campaign->slug,
            'theme' => ['primary' => '#00ff00', 'accent' => 'no-es-color', 'radius' => 'full'],
        ])->assertSessionHasNoErrors();

        $resolved = $campaign->fresh()->resolvedTheme();
        $this->assertSame('#00ff00', $resolved['primary']);
        $this->assertSame('full', $resolved['radius']);
        $this->assertSame(Setting::get('theme')['accent'], $resolved['accent']);

        $this->get('/')->assertInertia(fn (Assert $p) => $p->where('theme.primary', '#00ff00'));
    }

    public function test_un_visitante_puede_dejar_sus_datos_y_queda_registrado(): void
    {
        $campaign = $this->makeCampaign('Activa', 'active');

        $this->post(route('leads.store'), [
            'name' => 'Ana Torres', 'company' => 'Textiles SAC', 'email' => 'ana@example.com', 'campaign_id' => $campaign->id,
        ])->assertRedirect()->assertSessionHas('lead_sent');

        $lead = Lead::first();
        $this->assertSame('Ana Torres', $lead->name);
        $this->assertSame($campaign->id, $lead->campaign_id);
        $this->assertSame('new', $lead->status);
    }

    public function test_el_formulario_exige_nombre_y_algun_medio_de_contacto(): void
    {
        $this->post(route('leads.store'), ['name' => 'Sin contacto'])->assertSessionHasErrors(['email', 'phone']);
        $this->post(route('leads.store'), ['email' => 'a@b.com'])->assertSessionHasErrors('name');
        $this->assertSame(0, Lead::count());
    }

    public function test_el_campo_trampa_descarta_envios_de_bots_sin_guardar_nada(): void
    {
        $this->post(route('leads.store'), ['name' => 'Bot', 'email' => 'bot@spam.com', 'website_url' => 'http://spam'])->assertRedirect();
        $this->assertSame(0, Lead::count());
    }

    public function test_se_puede_cambiar_el_estado_de_un_contacto(): void
    {
        $this->login();
        $lead = Lead::create(['name' => 'Ana', 'email' => 'ana@example.com']);

        $this->put(route('leads.update', $lead), ['status' => 'meeting']);
        $this->assertSame('meeting', $lead->fresh()->status);

        $this->put(route('leads.update', $lead), ['status' => 'inventado'])->assertSessionHasErrors('status');
    }

    public function test_la_subida_de_imagenes_rechaza_archivos_que_no_son_imagen(): void
    {
        $this->login();

        $file = UploadedFile::fake()->create('virus.svg', 10, 'image/svg+xml');
        $this->postJson(route('media.store'), ['image' => $file])->assertStatus(422);
    }

    public function test_el_seeder_deja_la_campana_de_uco360_en_linea_con_el_paquete_oculto(): void
    {
        $this->seed(CampaignSeeder::class);

        $campaign = Campaign::query()->active()->firstOrFail();
        $this->assertSame(9, $campaign->sections()->count());
        $this->assertFalse((bool) $campaign->sections()->where('type', 'packages')->value('is_visible'));
    }
}
