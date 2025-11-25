@tool
extends EditorScript

func _run():
	var theme = Theme.new()
	
	# Colors
	var bg_color = Color.BLACK
	var fg_color = Color("33ff00") # Phosphor Green
	
	# Font
	var font = load("res://assets/TerminalFont.tres")
	theme.default_font = font
	theme.default_font_size = 14
	
	# PanelContainer Style
	var style_box = StyleBoxFlat.new()
	style_box.bg_color = bg_color
	style_box.border_width_left = 1
	style_box.border_width_top = 1
	style_box.border_width_right = 1
	style_box.border_width_bottom = 1
	style_box.border_color = fg_color
	style_box.corner_radius_top_left = 0
	style_box.corner_radius_top_right = 0
	style_box.corner_radius_bottom_right = 0
	style_box.corner_radius_bottom_left = 0
	style_box.anti_aliasing = false
	
	theme.set_stylebox("panel", "PanelContainer", style_box)
	
	# Label Color
	theme.set_color("font_color", "Label", fg_color)
	theme.set_color("font_color", "RichTextLabel", fg_color)
	theme.set_color("default_color", "RichTextLabel", fg_color)
	
	# ProgressBar Style
	var bg_style = StyleBoxFlat.new()
	bg_style.bg_color = Color(0.1, 0.1, 0.1)
	bg_style.border_width_left = 1
	bg_style.border_width_top = 1
	bg_style.border_width_right = 1
	bg_style.border_width_bottom = 1
	bg_style.border_color = fg_color
	
	var fg_style = StyleBoxFlat.new()
	fg_style.bg_color = fg_color
	
	theme.set_stylebox("background", "ProgressBar", bg_style)
	theme.set_stylebox("fill", "ProgressBar", fg_style)
	theme.set_color("font_color", "ProgressBar", Color.BLACK)
	
	ResourceSaver.save(theme, "res://assets/terminal.theme")
	print("Terminal Theme created at res://assets/terminal.theme")
