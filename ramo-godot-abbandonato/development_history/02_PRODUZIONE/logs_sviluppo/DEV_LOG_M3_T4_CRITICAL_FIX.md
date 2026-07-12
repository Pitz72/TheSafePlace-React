# DEV LOG - M3.T4.FIX: Risoluzione Bug Critico "Invalid access to 'id'"

**Data:** 2025-08-03
**Autore:** Gemini (Assistente LLM)
**Operatore:** Utente

---

## 1. Obiettivo del Task

Risolvere il bug critico che causava il crash del gioco all'interno di `EventManager.gd` durante la selezione di una scelta in un evento. Il problema era causato da un tentativo di accedere a un campo `id` inesistente negli oggetti `choice`.

## 2. Analisi del Problema

Il file `EventManager.gd` nella funzione `process_event_choice` riceveva correttamente un `choice_index` (indice numerico) dal popup degli eventi. Tuttavia, la logica interna tentava di utilizzare questo indice per trovare una scelta con un `id` corrispondente, che non è mai esistito nei nostri file di dati JSON.

Inoltre, la struttura dati per le conseguenze (ricompense/penalità) era gestita in modo frammentato e non robusto, con un alto rischio di crash se un campo non era presente.

## 3. Modifiche Implementate

### 3.1. Correzione della Logica in `EventManager.gd`

La funzione `process_event_choice` è stata completamente riscritta per risolvere il bug e migliorare la robustezza del codice:

1.  **Utilizzo dell'Indice:** La funzione ora utilizza direttamente l'indice numerico `choice_idx` per recuperare la scelta corretta dall'array `choices` dell'evento. È stato rimosso ogni riferimento a `choice["id"]`.

2.  **Controlli di Sicurezza:** Sono stati aggiunti controlli difensivi per verificare la validità dell'indice ricevuto e per gestire in modo sicuro l'accesso a tutte le chiavi dei dizionari (`skill_check`, `consequences`, etc.) utilizzando il metodo `.get()` con valori di default.

3.  **Struttura Dati Unificata:** La logica ora sfrutta appieno la struttura dati normalizzata introdotta in precedenza. Invece di leggere `reward` e `penalty` separatamente, il codice ora accede a un singolo dizionario `consequences`, `consequences_success`, o `consequences_failure`, semplificando il flusso e riducendo la duplicazione.

4.  **Applicazione Centralizzata delle Conseguenze:** L'applicazione di tutte le conseguenze (guadagno/perdita di oggetti, modifiche alle statistiche, etc.) è ora gestita da un'unica chiamata alla funzione `_apply_event_consequences`, rendendo il codice più pulito e manutenibile.

### 3.2. Codice Modificato (`EventManager.gd`)

```gdscript
# Processa la scelta del giocatore per un evento (Logica riscritta per M3.T4.FIX)
func process_event_choice(event_id: String, choice_index: String) -> void:
	print("[EventManager] Processing scelta evento: ", event_id, " - scelta index: ", choice_index)

	if not cached_events.has(event_id):
		print("[EventManager] ERRORE: Evento non trovato: ", event_id)
		return

	var event = cached_events[event_id]
	var choices = event.get("choices", [])
	
	if not choice_index.is_valid_int():
		print("[EventManager] ERRORE: Indice scelta non è un intero valido: ", choice_index)
		return
		
	var choice_idx = choice_index.to_int()

	if choice_idx < 0 or choice_idx >= choices.size():
		print("[EventManager] ERRORE: Indice scelta non valido: ", choice_idx)
		return

	var choice = choices[choice_idx]

	var result_text = ""
	var narrative_log = ""
	var skill_check_details = {}
	var consequences = {}

	if choice.has("skill_check"):
		var check_data = choice.get("skill_check", {})
		var stat = check_data.get("stat", "forza")
		var difficulty = check_data.get("difficulty", 15)
		
		skill_check_details = SkillCheckManager.perform_check(stat, difficulty)

		if skill_check_details.get("success", false):
			consequences = choice.get("consequences_success", {})
			result_text = consequences.get("narrative_text", "Successo!")
		else:
			consequences = choice.get("consequences_failure", {})
			result_text = consequences.get("narrative_text", "Fallimento.")
	else:
		consequences = choice.get("consequences", {})
		result_text = consequences.get("narrative_text", "Azione completata.")

	if not consequences.is_empty():
		_apply_event_consequences(consequences)

	narrative_log = result_text
	
	event_choice_resolved.emit(result_text, narrative_log, skill_check_details)
```

## 4. Risultati e Verifica

- **Bug Risolto:** Il gioco non va più in crash quando si seleziona una scelta in un evento.
- **Stabilità Migliorata:** L'aggiunta di controlli di sicurezza rende il sistema di eventi più resiliente a eventuali errori nei file di dati JSON.
- **Coerenza del Codice:** La logica è ora allineata con l'architettura basata su dati normalizzati.

Il task è stato completato con successo.