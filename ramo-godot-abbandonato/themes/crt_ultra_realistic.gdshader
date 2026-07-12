shader_type canvas_item;

// =============================================================================
// 🎮 CRT ULTRA-REALISTIC SHADER - THE SAFE PLACE v0.9.6.5+
// =============================================================================
// Simulazione super-realistica di monitor CRT a fosfori verdi anni '80
// Include: Power-on effect, phosphor persistence, barrel distortion,
// scanlines autentiche, noise, chromatic aberration, bloom, e molto altro
//
// Autore: Jules (LLM Assistant) - Per The Safe Place
// Data: 2025-09-24
// Licenza: MIT - Progetto The Safe Place
// =============================================================================

// ===== TEXTURE SAMPLING =====
uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_linear_mipmap;

// ===== MONITOR POWER-ON EFFECT =====
uniform float power_on_time : hint_range(0.0, 10.0) = 0.0; // Tempo dall'accensione (secondi)
uniform float power_on_duration : hint_range(0.5, 5.0) = 2.0; // Durata effetto accensione
uniform bool enable_power_on_effect = true;

// ===== PHOSPHOR PERSISTENCE SYSTEM =====
uniform float phosphor_persistence : hint_range(0.0, 1.0) = 0.85; // Persistenza fosfori
uniform float phosphor_decay : hint_range(0.1, 2.0) = 0.3; // Decadimento fosfori
uniform vec3 phosphor_color : source_color = vec3(0.0, 0.95, 0.15); // Verde P1 fosfori
uniform vec3 background_glow : source_color = vec3(0.02, 0.08, 0.02); // Bagliore sfondo

// ===== GEOMETRIC DISTORTION =====
uniform float barrel_distortion : hint_range(0.0, 0.05) = 0.008; // Bombatura leggera
uniform float pincushion_effect : hint_range(0.0, 0.02) = 0.003; // Effetto cuscino
uniform float corner_softness : hint_range(0.0, 0.5) = 0.15; // Morbidezza angoli

// ===== SCANLINE SYSTEM =====
uniform float scanline_strength : hint_range(0.0, 1.0) = 0.25; // Forza scanline
uniform float scanline_frequency : hint_range(200.0, 800.0) = 312.0; // Frequenza (Hz)
uniform float scanline_speed : hint_range(0.0, 10.0) = 0.0; // Movimento scanline
uniform float scanline_thickness : hint_range(0.5, 2.0) = 1.2; // Spessore linee

// ===== CHROMATIC ABERRATION =====
uniform float chromatic_aberration : hint_range(0.0, 0.01) = 0.002; // Aberrazione cromatica
uniform vec2 chromatic_offset = vec2(0.001, 0.0005);

// ===== NOISE AND INTERFERENCE =====
uniform float noise_strength : hint_range(0.0, 0.5) = 0.08; // Forza rumore
uniform float interference_strength : hint_range(0.0, 0.3) = 0.05; // Interferenze
uniform float static_noise : hint_range(0.0, 0.2) = 0.02; // Rumore statico

// ===== BLOOM AND GLOW =====
uniform float bloom_strength : hint_range(0.0, 2.0) = 0.4; // Forza bloom
uniform float glow_radius : hint_range(1.0, 5.0) = 2.5; // Raggio bagliore
uniform float phosphor_glow : hint_range(0.0, 1.0) = 0.3; // Bagliore fosfori

// ===== VIGNETTE AND BORDER =====
uniform float vignette_strength : hint_range(0.0, 1.0) = 0.35; // Forza vignette
uniform float border_fade : hint_range(0.0, 0.2) = 0.08; // Dissolvenza bordi
uniform vec3 border_color : source_color = vec3(0.0, 0.0, 0.0); // Colore bordi

// ===== COLOR CORRECTION =====
uniform float brightness : hint_range(0.5, 2.0) = 1.15; // Luminosità
uniform float contrast : hint_range(0.5, 2.0) = 1.25; // Contrasto
uniform float saturation : hint_range(0.0, 2.0) = 1.1; // Saturazione
uniform float gamma : hint_range(0.5, 2.0) = 1.1; // Gamma

// ===== ADVANCED EFFECTS =====
uniform float mura_pattern : hint_range(0.0, 1.0) = 0.1; // Pattern Mura
uniform float moire_strength : hint_range(0.0, 0.5) = 0.05; // Effetto Moire
uniform float rolling_lines : hint_range(0.0, 1.0) = 0.02; // Linee rotolanti

// ===== UTILITY FUNCTIONS =====

// Generatore rumore migliorato (Perlin-like)
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
    );
}

// Rumore frazionario per effetti vintage
float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Funzione sigmoid per transizioni morbide
float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-x));
}

// ===== POWER-ON EFFECT =====
float calculate_power_on_factor() {
    if (!enable_power_on_effect) return 1.0;

    float progress = power_on_time / power_on_duration;
    if (progress >= 1.0) return 1.0;

    // Effetto accensione realistico: rapido all'inizio, poi stabilizzazione
    float power_curve = sigmoid((progress - 0.3) * 8.0);
    return smoothstep(0.0, 1.0, power_curve);
}

// ===== GEOMETRIC DISTORTION =====
vec2 apply_barrel_distortion(vec2 uv) {
    vec2 center = uv - 0.5;
    float radius = length(center);

    // Barrel distortion + pincushion effect
    float distortion = radius * radius * (barrel_distortion - pincushion_effect * radius);
    vec2 distorted = center * (1.0 + distortion);

    // Corner softness
    float corner_factor = 1.0 - smoothstep(0.7 - corner_softness, 0.7 + corner_softness, radius);
    distorted *= corner_factor;

    return distorted + 0.5;
}

// ===== PHOSPHOR PERSISTENCE =====
vec3 apply_phosphor_persistence(vec3 color, vec2 uv) {
    // Simula la persistenza dei fosfori CRT
    float persistence_factor = phosphor_persistence * (1.0 - phosphor_decay * random(uv + TIME * 0.1));

    // Effetto di "memoria" dei fosfori
    vec3 persistent_color = phosphor_color * persistence_factor;

    // Mescola con il colore corrente
    return mix(color, persistent_color, persistence_factor * 0.3);
}

// ===== SCANLINE SYSTEM =====
float apply_scanlines(vec2 uv) {
    // Scanline orizzontali con movimento
    float scan_y = uv.y * scanline_frequency + TIME * scanline_speed;
    float scanline = sin(scan_y) * 0.5 + 0.5;

    // Scanline verticali sottili (shadow mask effect)
    float scan_x = uv.x * scanline_frequency * 0.1;
    float vertical_scan = sin(scan_x) * 0.5 + 0.5;

    // Combina scanline orizzontali e verticali
    float combined_scan = scanline * (1.0 - scanline_strength * 0.3) +
                         vertical_scan * (scanline_strength * 0.1);

    // Applica spessore
    combined_scan = pow(combined_scan, scanline_thickness);

    return 1.0 - (combined_scan * scanline_strength);
}

// ===== CHROMATIC ABERRATION =====
vec3 apply_chromatic_aberration(vec2 uv) {
    // Aberrazione cromatica leggera (come nei vecchi CRT)
    vec2 red_offset = uv + chromatic_offset * chromatic_aberration;
    vec2 green_offset = uv;
    vec2 blue_offset = uv - chromatic_offset * chromatic_aberration * 0.5;

    // Campiona i canali colore separatamente
    float r = texture(SCREEN_TEXTURE, red_offset).r;
    float g = texture(SCREEN_TEXTURE, green_offset).g;
    float b = texture(SCREEN_TEXTURE, blue_offset).b;

    return vec3(r, g, b);
}

// ===== NOISE AND INTERFERENCE =====
vec3 apply_noise_and_interference(vec3 color, vec2 uv) {
    // Rumore bianco classico
    float white_noise = random(uv + TIME * 0.5) * noise_strength;

    // Interferenze orizzontali (come segnali TV disturbati)
    float interference = sin(uv.y * 50.0 + TIME * 2.0) * interference_strength;
    interference *= sin(uv.x * 10.0 + TIME * 0.3) * 0.5 + 0.5;

    // Rumore statico a grana fine
    float static_noise_val = noise(uv * 100.0 + TIME * 0.1) * static_noise;

    // Linee rotolanti (rolling lines)
    float rolling = sin(uv.y * 20.0 + TIME * 3.0) * rolling_lines;

    // Combina tutti gli effetti rumore
    float total_noise = white_noise + interference + static_noise_val + rolling;
    total_noise = clamp(total_noise, 0.0, 1.0);

    return color + vec3(total_noise);
}

// ===== BLOOM AND GLOW =====
vec3 apply_bloom_glow(vec3 color, vec2 uv) {
    // Bloom semplice basato su luminanza
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 bloom_color = phosphor_color * luminance * bloom_strength;

    // Glow dei fosfori
    vec3 glow = phosphor_color * phosphor_glow * smoothstep(0.0, 1.0, luminance);

    return color + bloom_color + glow;
}

// ===== ADVANCED PATTERNS =====
vec3 apply_advanced_patterns(vec3 color, vec2 uv) {
    // Pattern Mura (dot pattern dei fosfori)
    vec2 mura_uv = uv * 300.0; // Densità pattern
    vec2 mura_pos = fract(mura_uv);
    float mura = step(0.5, length(mura_pos - 0.5));
    mura = mix(1.0, 0.95, mura * mura_pattern);

    // Effetto Moire (interferenza tra pattern)
    float moire = sin(uv.x * 100.0) * sin(uv.y * 100.0) * moire_strength;
    moire = 1.0 + moire;

    return color * mura * moire;
}

// ===== VIGNETTE AND BORDER =====
float apply_vignette(vec2 uv) {
    vec2 center = uv - 0.5;
    float dist = length(center);
    float vignette = 1.0 - smoothstep(0.5 - vignette_strength, 0.7, dist);
    return vignette;
}

vec3 apply_border_fade(vec3 color, vec2 uv) {
    vec2 center = uv - 0.5;
    float dist = length(center);
    float border_factor = smoothstep(0.45, 0.5, dist);
    return mix(color, border_color, border_factor * border_fade);
}

// ===== COLOR CORRECTION =====
vec3 apply_color_correction(vec3 color) {
    // Brightness
    color *= brightness;

    // Contrast
    color = (color - 0.5) * contrast + 0.5;

    // Saturation (conversione a HSL semplificata)
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(gray), color, saturation);

    // Gamma correction
    color = pow(color, vec3(1.0 / gamma));

    return clamp(color, 0.0, 1.0);
}

// ===== MAIN FRAGMENT SHADER =====
void fragment() {
    // ===== POWER-ON EFFECT =====
    float power_factor = calculate_power_on_factor();

    // ===== GEOMETRIC DISTORTION =====
    vec2 distorted_uv = apply_barrel_distortion(UV);

    // Controllo bounds dopo distorsione (senza return)
    bool is_out_of_bounds = (distorted_uv.x < 0.0 || distorted_uv.x > 1.0 ||
                            distorted_uv.y < 0.0 || distorted_uv.y > 1.0);

    vec3 final_color;

    if (is_out_of_bounds) {
        // Fuori dai bounds: mostra solo colore del bordo
        final_color = border_color;
    } else {
        // ===== COLOR SAMPLING WITH CHROMATIC ABERRATION =====
        vec3 base_color = apply_chromatic_aberration(distorted_uv);

        // Converti a luminanza per simulare monitor monocromatico
        float luminance = dot(base_color, vec3(0.299, 0.587, 0.114));

        // Applica colore fosfori
        vec3 crt_color = phosphor_color * luminance;

        // ===== APPLICA TUTTI GLI EFFETTI =====

        // Phosphor persistence
        crt_color = apply_phosphor_persistence(crt_color, distorted_uv);

        // Background glow
        crt_color += background_glow * (1.0 - luminance) * 0.05;

        // Scanlines
        float scanline_factor = apply_scanlines(distorted_uv);
        crt_color *= scanline_factor;

        // Noise and interference
        crt_color = apply_noise_and_interference(crt_color, distorted_uv);

        // Bloom and glow
        crt_color = apply_bloom_glow(crt_color, distorted_uv);

        // Advanced patterns
        crt_color = apply_advanced_patterns(crt_color, distorted_uv);

        // Vignette
        float vignette_factor = apply_vignette(distorted_uv);
        crt_color *= vignette_factor;

        // Border fade
        crt_color = apply_border_fade(crt_color, distorted_uv);

        // Color correction finale
        crt_color = apply_color_correction(crt_color);

        // Applica power-on effect
        crt_color *= power_factor;

        final_color = crt_color;
    }

    // Output finale
    COLOR = vec4(final_color, 1.0);
}