### Prompt per LLM Locale (Passo 3 di 4)

**Contesto:** Stiamo riscontrando una serie di errori TypeScript (`TS1117: An object literal cannot have multiple properties with the same name`) nel file `gameStore.ts`. La causa è la presenza di definizioni duplicate per tre funzioni: `getWeatherDescription`, `getRandomWeatherMessage`, e `performAbilityCheck`. Durante un refactoring, queste funzioni sono state sostituite da versioni "facade" più snelle che delegano ad altri store, ma le vecchie implementazioni non sono state rimosse.

**Azione:** Rimuovi le tre implementazioni di funzione obsolete e più lunghe dal file `src/stores/gameStore.ts`.

**File da modificare:** `src/stores/gameStore.ts`

**Istruzioni precise per la modifica (Rimozione di Blocchi di Codice):**

1.  **Rimuovi la vecchia funzione `getWeatherDescription`**:
    *   **Cerca e cancella il seguente blocco di codice (approssimativamente dalle righe 425 a 438):**
    ```typescript
    getWeatherDescription: (weather: WeatherType): string => {
      const descriptions = {
        [WeatherType.CLEAR]: 'Il cielo si schiarisce, rivelando un sole pallido che filtra attraverso l\'aria polverosa. La visibilità migliora notevolmente.',
        [WeatherType.LIGHT_RAIN]: 'Gocce sottili iniziano a cadere dal cielo grigio, creando piccole pozze sul terreno arido. L\'aria si fa più umida.',
        [WeatherType.HEAVY_RAIN]: 'La pioggia battente trasforma il paesaggio in un mare di fango. Ogni passo diventa una lotta contro gli elementi.',
        [WeatherType.STORM]: 'Una tempesta furiosa scuote la terra desolata. Lampi illuminano brevemente l\'orizzonte mentre il vento ulula tra le rovine.',
        [WeatherType.FOG]: 'Una nebbia spettrale avvolge tutto in un manto grigio. Il mondo oltre pochi metri scompare in un\'inquietante foschia.',
        [WeatherType.WIND]: 'Raffiche violente sollevano nuvole di polvere e detriti, rendendo difficile tenere gli occhi aperti. Il vento porta con sé echi del passato.'
      };
      return descriptions[weather] || 'Il tempo cambia in modi che sfidano ogni comprensione, come se la natura stessa fosse stata corrotta.';
    },
    ```

2.  **Rimuovi la vecchia funzione `getRandomWeatherMessage`**:
    *   **Cerca e cancella il seguente blocco di codice (approssimativamente dalle righe 440 a 516):**
    ```typescript
    getRandomWeatherMessage: (weather: WeatherType): string => {
      const weatherMessages = {
        [WeatherType.CLEAR]: [
          'I raggi del sole filtrano attraverso l\'aria, riscaldando leggermente il tuo volto.',
          'Il cielo sereno offre una tregua dalla desolazione circostante.',
          'Una brezza leggera porta con sé il profumo di terre lontane.',
          'La luce del sole rivela dettagli nascosti nel paesaggio.'
        ],
        [WeatherType.LIGHT_RAIN]: [
          'Le gocce di pioggia tamburellano dolcemente sulle superfici metalliche abbandonate.',
          'L\'umidità nell\'aria porta un senso di rinnovamento in questo mondo arido.',
          'La pioggia leggera crea riflessi argentei sulle pozzanghere.',
          'Il suono della pioggia maschera i tuoi passi.'
        ],
        [WeatherType.HEAVY_RAIN]: [
          'La pioggia torrenziale rende il terreno scivoloso e traditore.',
          'L\'acqua scorre in rivoli lungo i detriti, creando nuovi percorsi.',
          'Il martellare della pioggia è assordante, coprendo ogni altro suono.',
          'Ti rifugi momentaneamente sotto una lamiera arrugginita.'
        ],
        [WeatherType.STORM]: [
          'Un fulmine illumina il paesaggio desolato per un istante accecante.',
          'Il tuono rimbomba tra le rovine come il grido di un gigante ferito.',
          'Il vento della tempesta minaccia di trascinarti via.',
          'La furia degli elementi ti ricorda quanto sei piccolo in questo mondo.'
        ],
        [WeatherType.FOG]: [
          'Forme indistinte emergono e scompaiono nella nebbia come fantasmi.',
          'Il mondo si riduce a pochi metri di visibilità inquietante.',
          'La nebbia sembra sussurrare segreti che non riesci a comprendere.',
          'Ogni passo nella foschia è un salto nel vuoto.'
        ],
        [WeatherType.WIND]: [
          'Il vento porta con sé frammenti di carta e foglie secche del passato.',
          'Le raffiche fanno gemere le strutture metalliche abbandonate.',
          'Il vento ulula una melodia malinconica tra i rottami.',
          'Devi lottare contro le raffiche per mantenere l\'equilibrio.'
        ]
      };

      const messages = weatherMessages[weather];
      return messages ? messages[Math.floor(Math.random() * messages.length)] : 'Il tempo si comporta in modo strano.';
    },
    ```

3.  **Rimuovi la vecchia funzione `performAbilityCheck`**:
    *   **Cerca e cancella il seguente blocco di codice (approssimativamente dalle righe 658 a 693):**
    ```typescript
    performAbilityCheck: (ability, difficulty, addToJournal = true, successMessageType) => {
      const { addLogEntry, getWeatherEffects } = get();
      const characterStore = useCharacterStore.getState();

      // Get base modifier from character store
      const baseModifier = characterStore.getModifier(ability);

      // Get weather effects from game store
      const weatherEffects = getWeatherEffects();
      const weatherModifier = weatherEffects.skillCheckModifier;
      const totalModifier = baseModifier + weatherModifier;

      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + totalModifier;
      const success = total >= difficulty;

      characterStore.addExperience(success ? 5 : 1);

      const result: AbilityCheckResult = { success, roll, modifier: totalModifier, total, difficulty };

      if (addToJournal) {
        const context = {
          ability,
          roll,
          modifier: totalModifier,
          baseModifier,
          weatherModifier,
          total,
          difficulty
        };
        addLogEntry(success ? (successMessageType || MessageType.SKILL_CHECK_SUCCESS) : MessageType.SKILL_CHECK_FAILURE, context);
      }
      return result;
    },
    ```

**Risultato atteso:** Dopo aver rimosso questi tre blocchi di codice, gli errori `TS1117` dovrebbero scomparire, poiché rimarrà solo una definizione per ciascuna di queste funzioni (la versione facade più corta alla fine del file).
