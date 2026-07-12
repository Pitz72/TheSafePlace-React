# 🎨 SISTEMA TEMI - THE SAFE PLACE v0.4.1

## 🎯 **OVERVIEW DEL SISTEMA TEMI**

Il ThemeManager è responsabile della gestione dei temi grafici, font e colori dell'interfaccia utente. Implementa l'estetica CRT retrò con shader personalizzati per un'esperienza autentica anni '80.

### **Caratteristiche Principali**
- **CRT Aesthetics**: Shader scanline e curvatura schermo
- **Perfect DOS Font**: Font bitmap autentico VGA
- **Color Palette**: Schema colori verde fosforescente
- **Theme Consistency**: Applicazione uniforme across UI

---

## 🖼️ **COMPONENTI TEMATICI**

### **1. Font System**
```gdscript
# Perfect DOS VGA 437
const FONT_PATH = "res://themes/Perfect DOS VGA 437 Win.ttf"
const FONT_SIZE = 16  # Pixel perfect per CRT
const FONT_COLOR = Color(0.0, 1.0, 0.0)  # Verde brillante
```

### **2. Color Palette**
```gdscript
const COLORS = {
    "background": Color(0.0, 0.0, 0.0, 1.0),      # Nero puro
    "text_primary": Color(0.0, 1.0, 0.0, 1.0),   # Verde acceso
    "text_secondary": Color(0.0, 0.8, 0.0, 1.0), # Verde scuro
    "accent": Color(0.0, 1.0, 1.0, 1.0),         # Ciano
    "warning": Color(1.0, 1.0, 0.0, 1.0),        # Giallo
    "error": Color(1.0, 0.0, 0.0, 1.0)           # Rosso
}
```

### **3. CRT Shader**
```glsl
// crt_terminal.gdshader
shader_type canvas_item;

uniform float scanline_intensity = 0.1;
uniform float curvature = 0.05;
uniform float vignette = 0.1;

void fragment() {
    // Curvatura schermo CRT
    vec2 curved_uv = UV;
    curved_uv.x += sin(curved_uv.y * 3.14159) * curvature;
    
    // Scanlines orizzontali
    float scanline = sin(curved_uv.y * 500.0) * scanline_intensity;
    
    // Vignette agli angoli
    float vignette_factor = 1.0 - length(curved_uv - 0.5) * vignette;
    
    vec4 color = texture(TEXTURE, curved_uv);
    color.rgb *= (1.0 + scanline) * vignette_factor;
    
    COLOR = color;
}
```

---

## 🏗️ **ARCHITETTURA THEMEMANAGER**

### **Singleton Structure**
```gdscript
extends Node

# Riferimenti risorse tema
@onready var main_theme: Theme = preload("res://themes/main_theme.tres")
@onready var crt_shader: ShaderMaterial = preload("res://shaders/crt_material.tres")

# Configurazioni tema
var current_theme_name: String = "crt_retro"
var theme_config: Dictionary = {}
```

### **Inizializzazione**
```gdscript
func _ready():
    _load_theme_config()
    _apply_crt_theme()
    _setup_font_system()
    TSPLogger.info("ThemeManager", "Tema CRT inizializzato")
```

---

## 🎨 **APPLICAZIONE TEMI**

### **1. Theme Resource (main_theme.tres)**
```tres
[gd_resource type="Theme" load_steps=3 format=3]

[ext_resource path="res://themes/Perfect DOS VGA 437 Win.ttf" type="FontFile" id="1"]

[resource]
default_font = ExtResource("1")
default_font_size = 16

Label/colors/font_color = Color(0, 1, 0, 1)
Button/colors/font_color = Color(0, 1, 0, 1)
Panel/colors/background = Color(0, 0, 0, 0.8)
```

### **2. Dynamic Application**
```gdscript
func apply_theme_to_control(control: Control):
    # Applica font
    if control is Label or control is Button:
        control.add_theme_font_override("font", main_theme.default_font)
        control.add_theme_font_size_override("font_size", FONT_SIZE)
        control.add_theme_color_override("font_color", COLORS.text_primary)
    
    # Applica shader CRT se applicabile
    if control is Panel:
        control.material = crt_shader
```

### **3. Global Theme Application**
```gdscript
func apply_global_theme():
    # Applica a tutti i controlli della scena
    var root = get_tree().root
    _apply_theme_recursive(root)

func _apply_theme_recursive(node: Node):
    if node is Control:
        apply_theme_to_control(node)
    
    for child in node.get_children():
        _apply_theme_recursive(child)
```

---

## 🔧 **CONFIGURAZIONE CRT**

### **Shader Parameters**
```gdscript
func configure_crt_shader():
    crt_shader.set_shader_parameter("scanline_intensity", 0.15)
    crt_shader.set_shader_parameter("curvature", 0.08)
    crt_shader.set_shader_parameter("vignette", 0.2)
    crt_shader.set_shader_parameter("glow", 0.1)
```

### **Performance Settings**
```gdscript
# Bilanciamento qualità/performance
const CRT_QUALITY_HIGH = {
    "scanlines": 0.2,
    "curvature": 0.1,
    "resolution": 1.0
}

const CRT_QUALITY_MEDIUM = {
    "scanlines": 0.1,
    "curvature": 0.05,
    "resolution": 0.8
}
```

---

## 📐 **SISTEMA LAYOUT**

### **Grid System**
```gdscript
const PANEL_WIDTH = 200
const PANEL_HEIGHT = 150
const PANEL_MARGIN = 10

const LAYOUT_3_COLUMN = {
    "left_column": {"x": 10, "width": 200},
    "center_column": {"x": 220, "width": 200},
    "right_column": {"x": 430, "width": 200}
}
```

### **Responsive Scaling**
```gdscript
func get_scaled_font_size() -> int:
    var viewport_size = get_viewport().size
    var scale_factor = min(viewport_size.x / 640.0, viewport_size.y / 480.0)
    return int(FONT_SIZE * scale_factor)
```

---

## 🎯 **INTEGRAZIONE COMPONENTI**

### **Con GameUI**
```gdscript
# GameUI applica tema ai pannelli
func _ready():
    ThemeManager.apply_global_theme()
    ThemeManager.theme_changed.connect(_on_theme_changed)

func _on_theme_changed():
    # Ricolora tutti i pannelli
    _update_panel_colors()
```

### **Con Popups**
```gdscript
# Popup ereditano tema automaticamente
func _ready():
    theme = ThemeManager.main_theme
    material = ThemeManager.crt_shader
```

---

## 🔄 **GESTIONE STATI TEMA**

### **Theme States**
```gdscript
enum ThemeState {
    CRT_RETRO,      # Default CRT
    CLEAN_MODERN,   # UI pulita (fallback)
    HIGH_CONTRAST,  # Accessibilità
    DEBUG_MODE      # Debug visuale
}
```

### **Dynamic Switching**
```gdscript
func switch_theme(new_theme: ThemeState):
    current_theme_state = new_theme
    
    match new_theme:
        ThemeState.CRT_RETRO:
            _apply_crt_theme()
        ThemeState.CLEAN_MODERN:
            _apply_clean_theme()
        ThemeState.DEBUG_MODE:
            _apply_debug_theme()
    
    theme_changed.emit()
```

---

## 🧪 **TESTING E QUALITÀ**

### **Visual Testing**
```gdscript
func test_crt_effects():
    # Verifica shader applicati correttamente
    var test_panel = Panel.new()
    apply_theme_to_control(test_panel)
    assert(test_panel.material == crt_shader)

func test_font_consistency():
    # Verifica font uniforme across UI
    var labels = get_tree().get_nodes_in_group("ui_labels")
    for label in labels:
        assert(label.get_theme_font("font") == main_theme.default_font)
```

### **Performance Testing**
```gdscript
func benchmark_theme_application():
    var start_time = Time.get_time()
    apply_global_theme()
    var duration = Time.get_time() - start_time
    assert(duration < 0.1)  # < 100ms
```

---

## 📊 **PERFORMANCE CHARACTERISTICS**

### **Memory Usage**
- **Theme Resource**: ~50KB
- **Shader Material**: ~10KB per istanza
- **Font Texture**: ~100KB (bitmap)

### **CPU Overhead**
- **Theme Application**: <50ms per scena completa
- **Shader Rendering**: <2ms per frame
- **Dynamic Updates**: <1ms per cambiamento

### **GPU Requirements**
- **Shader Support**: OpenGL 3.3+ / Vulkan
- **Texture Units**: 1 per shader CRT
- **Fill Rate**: Minimo impatto

---

## 🔮 **EVOLUZIONE FUTURA**

### **Miglioramenti Pianificati**
- **Multiple Themes**: Selezione tema utente
- **Dynamic Colors**: Adattamento basato ora/tempo
- **Advanced Shaders**: Effetti CRT più realistici
- **Accessibility**: Temi high contrast

### **Estensioni Possibili**
- **Custom User Themes**: Creazione temi personalizzati
- **Theme Marketplace**: Condivisione temi community
- **Real-time Effects**: Cambiamenti tema dinamici
- **Mobile Adaptation**: Temi ottimizzati mobile

---

## 📋 **API PUBBLICA**

### **Theme Application**
```gdscript
static func apply_global_theme() -> void
static func apply_theme_to_control(control: Control) -> void
static func get_color(color_name: String) -> Color
static func get_font() -> FontFile
```

### **Configuration**
```gdscript
static func set_crt_intensity(value: float) -> void
static func set_font_size(size: int) -> void
static func switch_theme(theme_state: ThemeState) -> void
```

---

**Versione:** v0.4.1 "Write Only When You're Not Drunk"  
**Data:** 22 Settembre 2025  
**Target:** LLM Technical Analysis