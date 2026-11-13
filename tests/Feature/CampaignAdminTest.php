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

    public function test_los_colores_de_una_seccion_admiten_nombres_del_tema_pero_no_cualquier_texto(): void
    {
        $this->login();
        $section = $this->addSection($this->makeCampaign(), 'hero', 1);

        $this->put(route('sections.update', $section), [
            'is_visible' => true, 'anchor' => 'inicio', 'content' => ['title' => 'Hola'],
            'style' => ['bg_color' => 'dark', 'text_color' => 'inventado', 'accent_color' => '#FF9C34'],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $section->refresh();
        $this->assertSame('dark', $section->style['bg_color']);
        $this->assertNull($section->style['text_color']);
        $this->assertSame('#ff9c34', $section->style['accent_color']);
    }

    public function test_el_tema_de_una_campana_no_acepta_nombres_de_color_solo_hexadecimales(): void
    {
        $this->login();
        $campaign = $this->makeCampaign('Tema', 'active');

        $this->put(route('campaigns.update', $campaign), [
            'name' => 'Tema', 'slug' => $campaign->slug, 'theme' => ['primary' => 'dark', 'accent' => '#123456'],
        ])->assertSessionHasNoErrors();

        $theme = $campaign->fresh()->theme;
        $this->assertNull($theme['primary']);
        $this->assertSame('#123456', $theme['accent']);
    }

    public function test_solo_se_aceptan_imagenes_de_rutas_conocidas(): void
    {
        $this->assertSame('/brand/uco360-logo.png', SectionTypes::imageUrl('/brand/uco360-logo.png'));
        $this->assertSame('/uploads/a1b2.jpg', SectionTypes::imageUrl('/uploads/a1b2.jpg'));
        $this->assertNull(SectionTypes::imageUrl('/uploads/../../.env'));
        $this->assertNull(SectionTypes::imageUrl('/etc/passwd'));
        $this->assertNull(SectionTypes::imageUrl('http://inseguro.test/x.png'));
    }

    public function test_el_catalogo_incluye_las_piezas_de_marketing(): void
    {
        foreach (['promo', 'calculator', 'quiz', 'included', 'popup'] as $type) {
            $this->assertContains($type, SectionTypes::keys());
        }
    }

    public function test_los_campos_numericos_se_limitan_a_su_rango(): void
    {
        $clean = SectionTypes::sanitizeContent('calculator', [
            'people_min' => '3', 'people_max' => 99999999, 'people_default' => -4, 'title' => 'x',
        ]);

        $this->assertSame(3, $clean['people_min']);
        $this->assertSame(100000, $clean['people_max']);
        $this->assertSame(1, $clean['people_default']);

        $popup = SectionTypes::sanitizeContent('popup', ['seconds' => 1, 'trigger' => 'inventado', 'position' => 'center']);
        $this->assertSame(3, $popup['seconds']);
        $this->assertSame('delay', $popup['trigger']);
        $this->assertSame('center', $popup['position']);
    }

    public function test_la_landing_recibe_la_barra_de_anuncio_la_calculadora_y_el_popup(): void
    {
        $campaign = $this->makeCampaign('Con piezas', 'active');
        $this->addSection($campaign, 'promo', 1);
        $this->addSection($campaign, 'hero', 2);
        $this->addSection($campaign, 'calculator', 3);
        $this->addSection($campaign, 'popup', 4);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('sections', 4)
            ->where('sections.0.type', 'promo')
            ->where('sections.2.type', 'calculator')
            ->where('sections.3.type', 'popup'));
    }

    public function test_el_texto_con_formato_conserva_lo_permitido_y_quita_lo_peligroso(): void
    {
        $clean = SectionTypes::sanitizeContent('text', [
            'title' => 'Cada hora <span class="m-accent">cuesta</span><script>alert(1)</script>',
            'body' => '<p style="text-align:center;position:fixed" onclick="x()">Hola <strong>mundo</strong> <span class="t-accent">naranja</span> <span class="inventada">x</span></p>'
                .'<p><a href="javascript:alert(1)">mal</a> <a href="https://uco360.pe" target="_blank">bien</a></p>'
                .'<ul><li>uno</li></ul><img src="x" onerror="alert(1)"><iframe src="https://evil.test"></iframe>',
        ]);

        $this->assertStringContainsString('<span class="m-accent">cuesta</span>', $clean['title']);
        $this->assertStringNotContainsString('script', $clean['title']);
        $this->assertStringNotContainsString('<p', $clean['title']);

        $body = $clean['body'];
        $this->assertStringContainsString('<strong>mundo</strong>', $body);
        $this->assertStringContainsString('class="t-accent"', $body);
        $this->assertStringContainsString('text-align:center', $body);
        $this->assertStringContainsString('<li>uno</li>', $body);
        $this->assertStringContainsString('href="https://uco360.pe"', $body);
        foreach (['onclick', 'position', 'inventada', 'javascript:', '<img', 'onerror', 'iframe'] as $bad) {
            $this->assertStringNotContainsString($bad, $body);
        }
    }

    public function test_los_titulares_y_textos_largos_usan_el_editor_y_las_listas_siguen_en_texto_plano(): void
    {
        $text = collect(SectionTypes::schemaForClient()['text']['content'])->keyBy('key');
        $this->assertSame('richline', $text['title']['type']);
        $this->assertSame('richtext', $text['body']['type']);

        // «Una línea por punto» no admite formato: lo rompería.
        $included = collect(SectionTypes::schemaForClient()['included']['content'])->keyBy('key');
        $points = collect($included['items']['fields'])->keyBy('key');
        $this->assertSame('textarea', $points['points']['type']);
    }

    public function test_el_texto_plano_guardado_antes_del_editor_sigue_siendo_valido(): void
    {
        $clean = SectionTypes::sanitizeContent('text', ['title' => 'Precio < 5 & más', 'body' => "Primero.\n\nSegundo."]);

        $this->assertSame('Precio &lt; 5 &amp; más', $clean['title']);
        $this->assertStringContainsString('Primero.', $clean['body']);
        $this->assertStringContainsString('Segundo.', $clean['body']);
    }

    public function test_los_montos_de_ejemplo_muestran_los_paquetes_y_adelantan_el_popup(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $this->seed(\Database\Seeders\PreciosEjemploSeeder::class);

        $campaign = Campaign::where('status', 'active')->first();
        $packages = $campaign->sections()->where('type', 'packages')->first();
        $popup = $campaign->sections()->where('type', 'popup')->first();

        $this->assertTrue($packages->is_visible);
        $this->assertSame('Desde S/ 000 al mes', $packages->content['items'][0]['price_label']);
        $this->assertStringContainsString('Montos de ejemplo', $packages->content['note']);
        $this->assertSame(12, $popup->content['seconds']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('sections', 14));
    }

    public function test_los_montos_de_ejemplo_no_pisan_lo_editado_en_el_panel(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);

        $campaign = Campaign::where('status', 'active')->first();
        $packages = $campaign->sections()->where('type', 'packages')->first();
        $content = $packages->content;
        $content['items'][0]['price_label'] = 'S/ 1,500 al mes';
        $packages->update(['content' => $content, 'is_visible' => false]);
        $campaign->sections()->where('type', 'popup')->first()->update([
            'content' => [...$campaign->sections()->where('type', 'popup')->first()->content, 'seconds' => 20],
        ]);

        $this->seed(\Database\Seeders\PreciosEjemploSeeder::class);

        $packages->refresh();
        $this->assertFalse($packages->is_visible);
        $this->assertSame('S/ 1,500 al mes', $packages->content['items'][0]['price_label']);
        $this->assertSame(20, $campaign->sections()->where('type', 'popup')->first()->content['seconds']);
    }

    public function test_el_seeder_de_visuales_agrega_la_franja_sin_duplicar_ni_pisar(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $campaign = Campaign::where('status', 'active')->first();

        // Una campaña creada antes del diseño con imágenes: sin franja y sin tarjeta flotante.
        $campaign->sections()->where('type', 'marquee')->delete();
        $text = $campaign->sections()->where('type', 'text')->first();
        $content = $text->content;
        unset($content['overlay']);
        $text->update(['content' => $content]);

        $popup = $campaign->sections()->where('type', 'popup')->first();
        $old = $popup->content;
        unset($old['visual'], $old['dismiss_label']);
        $popup->update(['content' => $old]);

        $this->seed(\Database\Seeders\VisualesSeeder::class);
        $this->seed(\Database\Seeders\VisualesSeeder::class);

        $this->assertSame('Ahora no', $popup->fresh()->content['dismiss_label']);
        $this->assertSame('report', $popup->fresh()->content['visual']);

        $types = $campaign->sections()->orderBy('position')->pluck('type')->all();
        $this->assertSame(1, count(array_keys($types, 'marquee')));
        $this->assertSame('marquee', $types[array_search('calculator', $types, true) + 1]);
        $this->assertSame('report', $text->fresh()->content['overlay']);
        $positions = $campaign->sections()->pluck('position')->all();
        $this->assertCount(count($positions), array_unique($positions));
    }

    public function test_el_mapa_acepta_el_codigo_de_google_y_guarda_solo_su_direccion(): void
    {
        $this->login();
        $contact = Setting::get('contact');
        $src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1d3901.5!2d-77.0!3d-12.09';

        $this->put(route('site.update', 'contact'), [
            ...$contact,
            'map_url' => 'https://maps.app.goo.gl/abc123',
            'map_embed' => '<iframe src="'.$src.'" width="600" onload="x()" loading="lazy"></iframe>',
        ])->assertSessionHasNoErrors();

        $saved = Setting::get('contact');
        $this->assertSame($src, $saved['map_embed']);
        $this->assertSame('https://maps.app.goo.gl/abc123', $saved['map_url']);
    }

    public function test_el_mapa_rechaza_enlaces_que_no_son_de_google_ni_https(): void
    {
        $this->login();
        $contact = Setting::get('contact');

        $this->put(route('site.update', 'contact'), [...$contact, 'map_embed' => '<iframe src="https://evil.test/x"></iframe>'])
            ->assertSessionHasErrors('map_embed');
        $this->put(route('site.update', 'contact'), [...$contact, 'map_embed' => 'javascript:alert(1)'])
            ->assertSessionHasErrors('map_embed');
        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => 'http://maps.example.test'])
            ->assertSessionHasErrors('map_url');
        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => 'javascript:alert(1)'])
            ->assertSessionHasErrors('map_url');
    }

    public function test_sin_datos_de_mapa_la_landing_usa_la_direccion_y_el_cierre_trae_el_ajuste(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('contact.map_url', '')
            ->where('contact.map_embed', '')
            ->where('contact.address', fn ($v) => str_contains($v, 'San Isidro')));

        $cta = Campaign::where('status', 'active')->first()->sections()->where('type', 'cta')->first();
        $this->assertTrue($cta->content['show_map']);
    }

    public function test_el_seeder_de_visuales_enciende_el_mapa_en_campanas_anteriores(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $cta = Campaign::where('status', 'active')->first()->sections()->where('type', 'cta')->first();
        $old = $cta->content;
        unset($old['show_map']);
        $cta->update(['content' => $old]);

        $this->seed(\Database\Seeders\VisualesSeeder::class);

        $this->assertTrue($cta->fresh()->content['show_map']);
    }

    public function test_el_enlace_corto_de_google_se_convierte_en_el_punto_exacto_del_mapa(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'maps.app.goo.gl/*' => \Illuminate\Support\Facades\Http::response('', 302, [
                'Location' => 'https://www.google.com/maps/place/Foo/@-12.0901,-77.0166,17z/data=!4m6!8m2!3d-12.0902756!4d-77.0165959?entry=tts',
            ]),
        ]);
        $this->login();
        $contact = Setting::get('contact');

        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => 'https://maps.app.goo.gl/abc'])
            ->assertSessionHas('success');
        $this->assertSame('-12.090276,-77.016596', Setting::get('contact')['map_coords']);

        // Al quitar el enlace, el punto se borra.
        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => '']);
        $this->assertSame('', Setting::get('contact')['map_coords']);
    }

    public function test_un_enlace_largo_no_necesita_conexion_y_uno_ajeno_nunca_se_visita(): void
    {
        \Illuminate\Support\Facades\Http::fake();
        $this->login();
        $contact = Setting::get('contact');

        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => 'https://www.google.com/maps/place/X/@-12.09,-77.01,17z/data=!3d-12.0905!4d-77.0165']);
        $this->assertSame('-12.090500,-77.016500', Setting::get('contact')['map_coords']);

        $this->put(route('site.update', 'contact'), [...$contact, 'map_url' => 'https://evil.test/@-12.0,-77.0'])
            ->assertSessionHas('error');
        $this->assertSame('', Setting::get('contact')['map_coords']);

        \Illuminate\Support\Facades\Http::assertNothingSent();
    }

    public function test_si_google_no_responde_se_avisa_y_se_guarda_igual(): void
    {
        \Illuminate\Support\Facades\Http::fake(['*' => \Illuminate\Support\Facades\Http::response('', 500)]);
        $this->login();

        $this->put(route('site.update', 'contact'), [...Setting::get('contact'), 'map_url' => 'https://maps.app.goo.gl/abc'])
            ->assertSessionHas('error');

        $this->assertSame('https://maps.app.goo.gl/abc', Setting::get('contact')['map_url']);
        $this->assertSame('', Setting::get('contact')['map_coords']);
    }

    public function test_el_id_de_analytics_se_guarda_limpio_y_llega_a_la_landing(): void
    {
        $this->login();

        // Pegado dentro del código que entrega Google: se queda solo con el ID, en mayúsculas.
        $this->put(route('site.update', 'analytics'), ['ga_id' => '<script async src="https://www.googletagmanager.com/gtag/js?id=g-ab12cd34ef"></script>'])
            ->assertSessionHasNoErrors();
        $this->assertSame('G-AB12CD34EF', Setting::get('analytics')['ga_id']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('analytics.ga_id', 'G-AB12CD34EF'));

        $this->put(route('site.update', 'analytics'), ['ga_id' => ''])->assertSessionHasNoErrors();
        $this->assertSame('', Setting::get('analytics')['ga_id']);
    }

    public function test_el_id_de_analytics_rechaza_lo_que_no_es_un_id_de_medicion(): void
    {
        $this->login();

        $this->put(route('site.update', 'analytics'), ['ga_id' => 'UA-12345-1'])->assertSessionHasErrors('ga_id');
        $this->put(route('site.update', 'analytics'), ['ga_id' => 'hola mundo'])->assertSessionHasErrors('ga_id');
        $this->assertSame('', Setting::get('analytics')['ga_id']);
    }

    public function test_el_cotizador_conserva_los_pesos_decimales_y_limita_los_valores(): void
    {
        $clean = SectionTypes::sanitizeContent('quote', [
            'uco_price' => '50', 'min_price' => 1500, 'reveal' => 'inventado',
            'devices' => [
                ['name' => 'Licencia Office 365', 'group' => 'Equipos', 'weight' => '0.05', 'qty' => 15, 'preset_qty' => '15, 30, 60'],
                ['name' => 'UPS', 'group' => 'Red', 'weight' => 0.25, 'qty' => -3],
                ['name' => 'Absurdo', 'weight' => 99999999, 'qty' => 99999999],
            ],
        ]);

        $this->assertSame(0.05, $clean['devices'][0]['weight']);
        $this->assertSame(0.25, $clean['devices'][1]['weight']);
        $this->assertSame(0, $clean['devices'][1]['qty']);
        $this->assertSame(1000, $clean['devices'][2]['weight']);
        $this->assertSame(100000, $clean['devices'][2]['qty']);
        $this->assertSame('gate', $clean['reveal']);
        $this->assertSame('15, 30, 60', $clean['devices'][0]['preset_qty']);
    }

    public function test_los_datos_de_fabrica_del_cotizador_siguen_el_pdf_de_pesos(): void
    {
        $devices = collect(\App\Support\QuoteDefaults::devices());

        // 14 tipos de equipo y los pesos oficiales.
        $this->assertCount(14, $devices);
        $this->assertSame(1.0, $devices->firstWhere('name', 'PC / Laptop')['weight']);
        $this->assertSame(0.05, $devices->firstWhere('name', 'Licencia Office 365')['weight']);
        $this->assertSame(0.2, $devices->firstWhere('name', 'Cámara CCTV')['weight']);
        $this->assertSame(1.5, $devices->firstWhere('name', 'Firewall')['weight']);

        // El plan inicial suma los 29.55 UCO de la maqueta, y 1 UCO = S/ 50 con mínimo de S/ 1,500.
        $total = $devices->sum(fn ($d) => $d['qty'] * $d['weight']);
        $this->assertEqualsWithDelta(29.55, $total, 0.001);
        $quote = \App\Support\QuoteDefaults::quote();
        $this->assertSame(50, $quote['uco_price']);
        $this->assertSame(1500, $quote['min_price']);
        $this->assertSame(1500, (int) max($quote['min_price'], $total * $quote['uco_price']));
    }

    public function test_la_campana_nueva_trae_el_cotizador_en_la_portada_y_la_calculadora_oculta(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $campaign = Campaign::where('status', 'active')->first();
        $types = $campaign->sections()->orderBy('position')->pluck('type')->all();

        $this->assertSame('hero', $types[1]);
        $this->assertSame('quote', $types[2]);
        $this->assertTrue($campaign->sections()->where('type', 'quote')->first()->content['in_hero']);

        $calc = $campaign->sections()->where('type', 'calculator')->first();
        $this->assertFalse($calc->is_visible);
        $this->assertFalse($calc->content['in_hero']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('sections.1.type', 'hero')
            ->where('sections.2.type', 'quote')
            ->where('sections.2.content.min_price', 1500));
    }

    public function test_el_seeder_del_cotizador_actualiza_una_campana_anterior_sin_tocar_la_portada(): void
    {
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $campaign = Campaign::where('status', 'active')->first();

        // Una campaña anterior: sin cotizador y con la calculadora en la portada.
        $campaign->sections()->where('type', 'quote')->delete();
        $calc = $campaign->sections()->where('type', 'calculator')->first();
        $calc->update(['is_visible' => true, 'content' => [...$calc->content, 'in_hero' => true]]);
        $hero = $campaign->sections()->where('type', 'hero')->first();
        $title = $hero->content['title'];

        $this->seed(\Database\Seeders\CotizadorSeeder::class);
        $this->seed(\Database\Seeders\CotizadorSeeder::class);

        $this->assertSame(1, $campaign->sections()->where('type', 'quote')->count());
        $this->assertFalse($calc->fresh()->is_visible);
        $this->assertFalse($calc->fresh()->content['in_hero']);
        $this->assertSame($title, $hero->fresh()->content['title']);
    }

    public function test_lo_que_se_guarda_en_el_panel_llega_a_la_base_y_a_la_landing(): void
    {
        $this->login();
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $campaign = Campaign::where('status', 'active')->first();
        $hero = $campaign->sections()->where('type', 'hero')->first();
        $quote = $campaign->sections()->where('type', 'quote')->first();

        $devices = $quote->content['devices'];
        $devices[0]['weight'] = 1.5;
        $devices[] = ['name' => 'Tablet', 'hint' => 'Tablets de la empresa', 'group' => 'Principales', 'weight' => 0.3, 'qty' => 2, 'preset_qty' => '2, 4, 6'];

        $this->put(route('sections.update', $quote), [
            'is_visible' => true, 'anchor' => 'cotizador', 'nav_label' => 'Cotizador',
            'content' => [...$quote->content, 'uco_price' => 60, 'min_price' => 2000, 'title' => 'Tu tarifa', 'devices' => $devices],
            'style' => $quote->style,
        ])->assertSessionHasNoErrors();

        $this->put(route('sections.update', $hero), [
            'is_visible' => true, 'anchor' => 'inicio', 'nav_label' => 'Inicio',
            'content' => [...$hero->content, 'audience' => [['icon' => '⛏️', 'label' => 'Minería'], ['icon' => '', 'label' => 'Colegios']]],
            'style' => $hero->style,
        ])->assertSessionHasNoErrors();

        // En la base de datos
        $quote->refresh();
        $this->assertSame(60, $quote->content['uco_price']);
        $this->assertSame(2000, $quote->content['min_price']);
        $this->assertCount(15, $quote->content['devices']);
        $this->assertSame(1.5, $quote->content['devices'][0]['weight']);
        $this->assertSame('Colegios', $hero->fresh()->content['audience'][1]['label']);

        // Y lo que ve el visitante
        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('sections.1.content.audience.0.label', 'Minería')
            ->where('sections.2.content.uco_price', 60)
            ->where('sections.2.content.devices.14.name', 'Tablet'));
    }

    public function test_los_rubros_de_la_portada_se_editan_y_el_seeder_no_pisa_lo_editado(): void
    {
        $fields = collect(SectionTypes::schemaForClient()['hero']['content'])->pluck('key');
        $this->assertTrue($fields->contains('audience_label'));
        $this->assertTrue($fields->contains('audience'));

        $clean = SectionTypes::sanitizeContent('hero', ['audience_label' => 'Nuestros rubros', 'audience' => [
            ['icon' => '🏨', 'label' => 'Hoteles'], ['icon' => '', 'label' => 'Minería'],
        ]]);
        $this->assertSame('Nuestros rubros', $clean['audience_label']);
        $this->assertCount(2, $clean['audience']);
        $this->assertSame('Minería', $clean['audience'][1]['label']);

        // Campaña anterior: la portada no tiene rubros y el seeder se los agrega una sola vez.
        $this->seed(\Database\Seeders\CampaignSeeder::class);
        $campaign = Campaign::where('status', 'active')->first();
        $hero = $campaign->sections()->where('type', 'hero')->first();
        $this->assertCount(4, $hero->content['audience']);

        $hero->update(['content' => [...$hero->content, 'audience' => [['icon' => '', 'label' => 'Solo uno']]]]);
        $this->seed(\Database\Seeders\CotizadorSeeder::class);
        $this->assertSame('Solo uno', $hero->fresh()->content['audience'][0]['label']);

        $content = $hero->content;
        unset($content['audience'], $content['audience_label']);
        $hero->update(['content' => $content]);
        $this->seed(\Database\Seeders\CotizadorSeeder::class);
        $this->assertCount(4, $hero->fresh()->content['audience']);
    }

    public function test_todos_los_textos_del_cotizador_se_editan_en_el_panel(): void
    {
        $fields = collect(SectionTypes::schemaForClient()['quote']['content'])->pluck('key');

        foreach (['uco_price', 'min_price', 'currency', 'presets', 'devices', 'uco_label', 'clear_label', 'all_label', 'units_label', 'empty_label',
            'name_label', 'company_label', 'phone_label', 'error_name', 'error_company', 'error_phone', 'gate_title', 'gate_button',
            'result_label', 'result_unit', 'min_note', 'benefits', 'whatsapp_cta', 'diag_cta', 'disclaimer', 'summary_prefix', 'reveal', 'show_uco'] as $key) {
            $this->assertTrue($fields->contains($key), "Falta editar {$key} en el panel");
        }

        $clean = SectionTypes::sanitizeContent('quote', ['clear_label' => 'Reiniciar', 'uco_label' => 'puntos']);
        $this->assertSame('Reiniciar', $clean['clear_label']);
        $this->assertSame('puntos', $clean['uco_label']);
    }

    public function test_el_contacto_del_cotizador_guarda_la_cotizacion_en_el_mensaje(): void
    {
        $campaign = $this->makeCampaign('Con cotizador', 'active');
        $message = 'Cotizador (referencial): 29.55 UCO → S/ 1,500.00 / mes + IGV. Equipos: 15 PC / Laptop, 1 Sede / Site.';

        $this->post(route('leads.store'), [
            'name' => 'Ana Pérez', 'company' => '20123456789', 'phone' => '999888777',
            'message' => $message, 'website_url' => '', 'campaign_id' => $campaign->id,
        ])->assertSessionHasNoErrors();

        $lead = Lead::first();
        $this->assertSame('20123456789', $lead->company);
        $this->assertSame($message, $lead->message);
        $this->assertSame($campaign->id, $lead->campaign_id);
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
        $this->assertSame(15, $campaign->sections()->count());
        $this->assertFalse((bool) $campaign->sections()->where('type', 'packages')->value('is_visible'));
    }
}
