/**
 * Test di validazione per la fix del bug ESC nel crafting system
 * 
 * Questo test verifica che:
 * 1. Il tasto ESC non causi più crash o cambi di porta
 * 2. La navigazione funzioni correttamente
 * 3. Non ci siano più fallback pericolosi come window.history.back()
 */

// Test per verificare che il componente CraftingScreenRedesigned gestisca correttamente l'ESC
export const validateEscKeyFix = () => {
  console.log('🔍 VALIDAZIONE FIX TASTO ESC - CRAFTING SYSTEM');
  console.log('================================================');
  
  const tests = [
    {
      name: 'Verifica rimozione window.history.back()',
      test: () => {
        // Leggi il file del componente per verificare che non contenga più window.history.back()
        return fetch('/src/components/CraftingScreenRedesigned.tsx')
          .then(response => response.text())
          .then(content => {
            const hasHistoryBack = content.includes('window.history.back()');
            return {
              passed: !hasHistoryBack,
              message: hasHistoryBack 
                ? '❌ FALLITO: window.history.back() ancora presente nel codice'
                : '✅ SUCCESSO: window.history.back() rimosso dal codice'
            };
          })
          .catch(() => ({
            passed: false,
            message: '❌ ERRORE: Impossibile leggere il file del componente'
          }));
      }
    },
    
    {
      name: 'Verifica presenza safeOnExit',
      test: () => {
        return fetch('/src/components/CraftingScreenRedesigned.tsx')
          .then(response => response.text())
          .then(content => {
            const hasSafeOnExit = content.includes('safeOnExit');
            return {
              passed: hasSafeOnExit,
              message: hasSafeOnExit
                ? '✅ SUCCESSO: Funzione safeOnExit implementata'
                : '❌ FALLITO: Funzione safeOnExit non trovata'
            };
          })
          .catch(() => ({
            passed: false,
            message: '❌ ERRORE: Impossibile verificare safeOnExit'
          }));
      }
    },
    
    {
      name: 'Verifica gestione errori sicura',
      test: () => {
        return fetch('/src/components/CraftingScreenRedesigned.tsx')
          .then(response => response.text())
          .then(content => {
            const hasErrorFeedback = content.includes('setCraftingFeedback') && 
                                   content.includes('Errore nell\'uscita');
            return {
              passed: hasErrorFeedback,
              message: hasErrorFeedback
                ? '✅ SUCCESSO: Gestione errori sicura implementata'
                : '❌ FALLITO: Gestione errori sicura non trovata'
            };
          })
          .catch(() => ({
            passed: false,
            message: '❌ ERRORE: Impossibile verificare gestione errori'
          }));
      }
    },
    
    {
      name: 'Verifica setCurrentScreen in App.tsx',
      test: () => {
        return fetch('/src/App.tsx')
          .then(response => response.text())
          .then(content => {
            const hasSetCurrentScreen = content.includes('const setCurrentScreen = useGameStore(state => state.setCurrentScreen)') &&
                                       content.includes('onExit={() => setCurrentScreen(\'shelter\')}');
            return {
              passed: hasSetCurrentScreen,
              message: hasSetCurrentScreen
                ? '✅ SUCCESSO: setCurrentScreen correttamente importato in App.tsx'
                : '❌ FALLITO: setCurrentScreen non trovato o non importato correttamente'
            };
          })
          .catch(() => ({
            passed: false,
            message: '❌ ERRORE: Impossibile verificare App.tsx'
          }));
      }
    }
  ];
  
  // Esegui tutti i test
  Promise.all(tests.map(test => test.test())).then(results => {
    console.log('\n📊 RISULTATI TEST:');
    console.log('==================');
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${tests[index].name}`);
      console.log(`   ${result.message}`);
    });
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log(`\n🎯 RIEPILOGO: ${passedTests}/${totalTests} test superati`);
    
    if (passedTests === totalTests) {
      console.log('🎉 TUTTI I TEST SUPERATI! La fix del tasto ESC è stata implementata correttamente.');
      console.log('\n📋 ISTRUZIONI PER IL TEST MANUALE:');
      console.log('1. Avvia il gioco e vai nella schermata di crafting');
      console.log('2. Premi il tasto ESC');
      console.log('3. Verifica che torni alla schermata shelter senza errori');
      console.log('4. Controlla che la porta rimanga 5173 (non cambi a 5176)');
      console.log('5. Ripeti il test più volte per assicurarti della stabilità');
    } else {
      console.log('⚠️ ALCUNI TEST FALLITI! Controlla l\'implementazione.');
    }
  });
};

// Test di simulazione ESC key
export const simulateEscKeyPress = () => {
  console.log('🎮 SIMULAZIONE PRESSIONE TASTO ESC');
  console.log('==================================');
  
  // Simula la pressione del tasto ESC
  const escEvent = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    which: 27,
    bubbles: true,
    cancelable: true
  });
  
  console.log('📤 Invio evento ESC...');
  document.dispatchEvent(escEvent);
  
  // Verifica che non ci siano errori nella console
  setTimeout(() => {
    console.log('✅ Evento ESC inviato. Controlla la console per eventuali errori.');
    console.log('🔍 Se non vedi errori, la fix sta funzionando correttamente!');
  }, 100);
};

// Test avanzato per verificare il funzionamento completo del tasto ESC
export const testEscKeyFunctionality = () => {
  console.log('🧪 TEST FUNZIONALITÀ COMPLETA TASTO ESC');
  console.log('=====================================');
  
  // Verifica che siamo nella schermata corretta
  const currentScreen = (window as any).useGameStore?.getState?.()?.currentScreen;
  
  if (currentScreen === 'crafting') {
    console.log('✅ Siamo nella schermata crafting - perfetto per il test');
    
    // Simula pressione ESC
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    
    console.log('📤 Simulazione pressione ESC...');
    document.dispatchEvent(escEvent);
    
    // Verifica dopo un breve delay
    setTimeout(() => {
      const newScreen = (window as any).useGameStore?.getState?.()?.currentScreen;
      
      if (newScreen === 'shelter') {
        console.log('🎉 SUCCESSO! Il tasto ESC ha funzionato correttamente');
        console.log('✅ Navigazione: crafting → shelter');
      } else {
        console.log('❌ FALLITO: Il tasto ESC non ha cambiato schermata');
        console.log(`   Schermata attuale: ${newScreen}`);
        console.log('   Schermata attesa: shelter');
      }
    }, 500);
    
  } else {
    console.log(`ℹ️ Schermata attuale: ${currentScreen}`);
    console.log('💡 Per testare il tasto ESC, vai prima nella schermata crafting');
    console.log('   1. Vai al rifugio (shelter)');
    console.log('   2. Apri il crafting');
    console.log('   3. Esegui di nuovo questo test');
  }
};

// Test di regressione per verificare che non ci siano più crash
export const testEscKeyRegression = () => {
  console.log('🔄 TEST REGRESSIONE TASTO ESC');
  console.log('============================');
  
  let errorCount = 0;
  const originalError = console.error;
  
  // Intercetta errori
  console.error = (...args) => {
    errorCount++;
    originalError.apply(console, args);
  };
  
  // Simula multiple pressioni ESC
  for (let i = 0; i < 5; i++) {
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(escEvent);
  }
  
  // Ripristina console.error
  setTimeout(() => {
    console.error = originalError;
    
    if (errorCount === 0) {
      console.log('✅ SUCCESSO: Nessun errore durante multiple pressioni ESC');
    } else {
      console.log(`⚠️ ATTENZIONE: ${errorCount} errori rilevati durante il test`);
    }
  }, 1000);
};

// Esporta le funzioni per l'uso nella console
if (typeof window !== 'undefined') {
  (window as any).validateEscKeyFix = validateEscKeyFix;
  (window as any).simulateEscKeyPress = simulateEscKeyPress;
  (window as any).testEscKeyFunctionality = testEscKeyFunctionality;
  (window as any).testEscKeyRegression = testEscKeyRegression;
}

console.log('🛠️ Test ESC Key Fix caricato!');
console.log('💡 Usa validateEscKeyFix() per eseguire i test automatici');
console.log('💡 Usa simulateEscKeyPress() per simulare la pressione ESC');
console.log('💡 Usa testEscKeyFunctionality() per testare la navigazione ESC');
console.log('💡 Usa testEscKeyRegression() per test di regressione');