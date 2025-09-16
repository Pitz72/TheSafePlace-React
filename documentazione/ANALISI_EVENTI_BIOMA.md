# Analisi Eventi per Bioma - Conteggio Esistente

## Riepilogo Generale

**Totale eventi analizzati: 63 eventi**

### Distribuzione per Bioma

| Bioma | Numero Eventi | Percentuale | Stato |
|-------|---------------|-------------|-------|
| CITY | 12 eventi | 19% | ✅ Ben fornito |
| FOREST | 11 eventi | 17% | ✅ Ben fornito |
| RIVER | 10 eventi | 16% | ⚠️ Discreto |
| PLAINS | 10 eventi | 16% | ⚠️ Discreto |
| VILLAGE | 9 eventi | 14% | ⚠️ Leggermente carente |
| UNIQUE | 6 eventi | 10% | ❌ Carente (eventi speciali) |
| REST_STOP | 5 eventi | 8% | ❌ Molto carente |

## Dettaglio Eventi per Bioma

### CITY_EVENTS.JSON (12 eventi) ✅
- city_military_checkpoint
- city_broken_pharmacy
- city_subway_entrance
- city_rooftop_access
- city_bookstore
- city_department_store
- city_police_station
- city_gas_station
- city_hospital_ruins
- city_electronics_store
- city_military_bunker
- city_unique_webradio

### FOREST_EVENTS.JSON (11 eventi) ✅
- forest_hidden_trap
- forest_hermit_shelter
- forest_ancient_tree
- forest_stream
- forest_spider_webs
- forest_hunter_stand
- forest_bird_song
- forest_overgrown_path
- forest_fallen_log_bridge
- forest_mysterious_circle
- forest_abandoned_camp

### RIVER_EVENTS.JSON (10 eventi) ⚠️
- river_fishing_spot
- river_old_pier
- river_message_in_a_bottle
- river_makeshift_filter
- river_submerged_car
- river_rapids
- river_strange_glow
- river_skeletal_remains
- river_beaver_dam
- river_clay_deposit

### PLAINS_EVENTS.JSON (10 eventi) ⚠️
- plains_wild_dog_pack
- plains_old_scarecrow
- plains_abandoned_vehicle
- plains_strange_carcass
- plains_memorial_forgotten
- plains_dust_devil
- plains_radio_tower
- plains_old_well
- plains_mirage
- plains_fissure
- plains_vulture_circle

### VILLAGE_EVENTS.JSON (9 eventi) ⚠️
- village_locked_house
- village_playground
- village_community_board
- village_vegetable_garden
- village_water_pump
- village_doghouse
- village_canned_food_cache
- village_wind_chimes
- village_family_album
- village_scrawled_warning

### UNIQUE_EVENTS.JSON (6 eventi) ❌
- city_unique_webradio
- unique_eurocenter
- unique_magnetar
- unique_bunker_discovery
- unique_scientist_notes
- unique_time_capsule

### REST_STOP_EVENTS.JSON (5 eventi) ❌
- rest_stop_day_interaction
- rest_choice
- scavenge_choice
- investigate_shelter
- ignore_choice

## Priorità per Nuovi Eventi

### 🔴 PRIORITÀ ALTA
**REST_STOP** - Aggiungere 5-7 eventi
- Attualmente solo 5 eventi (8% del totale)
- Obiettivo: portare a 10-12 eventi
- Temi suggeriti: incontri con altri sopravvissuti, rifornimenti nascosti, strutture abbandonate

### 🟡 PRIORITÀ MEDIA
**VILLAGE** - Aggiungere 2-3 eventi
- Attualmente 9 eventi (14% del totale)
- Obiettivo: portare a 11-12 eventi
- Temi suggeriti: case abbandonate, negozi locali, strutture comunitarie

### 🟢 PRIORITÀ BASSA
**UNIQUE** - Considerare 1-2 eventi aggiuntivi
- Eventi speciali, meno frequenti per design
- Mantenere la rarità e unicità

## Obiettivo Target

**Target ideale: 10-12 eventi per bioma principale**

Questo garantirà:
- Varietà nell'esperienza di gioco
- Riduzione della ripetitività
- Bilanciamento tra i diversi biomi
- Maggiore immersione narrativa

---

*Analisi completata il: $(date)*
*File analizzati: 7 file JSON nella cartella /public/events/*