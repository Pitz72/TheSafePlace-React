import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useNotificationStore } from '../stores/notifications/notificationStore';
import type { SaveSlotInfo } from '../utils/saveSystem';
import LoadingSpinner from './LoadingSpinner';

const LoadScreen: React.FC = () => {
  const { loadSavedGame, getSaveSlots, deleteSave, goBack, recoverSave, exportSave, importSave } = useGameStore();
  const { addNotification } = useNotificationStore();

  const [saveSlots, setSaveSlots] = useState<SaveSlotInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carica informazioni slot salvataggio
  useEffect(() => {
    try {
      const slots = getSaveSlots();
      setSaveSlots(slots);
      
      // Trova il primo slot con salvataggio esistente e non corrotto
      const firstValidSlot = slots.findIndex(slot => slot.exists && !slot.corrupted);
      if (firstValidSlot !== -1) {
        setSelectedIndex(firstValidSlot);
      } else {
        // Se non ci sono salvataggi validi, seleziona il primo slot vuoto
        const firstEmptySlot = slots.findIndex(slot => !slot.exists);
        if (firstEmptySlot !== -1) {
          setSelectedIndex(firstEmptySlot);
        }
      }

      // Mostra notifica se ci sono salvataggi corrotti
      const corruptedSlots = slots.filter(slot => slot.corrupted);
      if (corruptedSlots.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Salvataggi Corrotti Rilevati',
          message: `${corruptedSlots.length} salvataggio/i corrotto/i. Usa [R] per tentare il recupero.`,
          duration: 5000
        });
      }

      // Mostra suggerimento se non ci sono salvataggi
      const validSlots = slots.filter(slot => slot.exists && !slot.corrupted);
      if (validSlots.length === 0) {
        addNotification({
          type: 'info',
          title: 'Nessun Salvataggio',
          message: 'Nessun salvataggio trovato. Inizia una nuova partita o importa un salvataggio esistente.',
          duration: 4000
        });
      }
    } catch (err) {
      setError('Errore nel caricamento degli slot di salvataggio');
      console.error('Error loading save slots:', err);
      
      addNotification({
        type: 'error',
        title: 'Errore Sistema Salvataggio',
        message: 'Impossibile accedere al sistema di salvataggio. Controlla le impostazioni del browser.',
        duration: 6000
      });
    }
  }, [getSaveSlots, addNotification]);

  // Gestione input keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showDeleteConfirm) {
        // Modalità conferma eliminazione
        if (e.key === 'y' || e.key === 'Y') {
          handleConfirmDelete();
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
          setShowDeleteConfirm(null);
        }
        return;
      }

      // Navigazione normale
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(saveSlots.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          handleLoadGame();
          break;
        case 'Delete':
        case 'd':
        case 'D':
          e.preventDefault();
          handleDeleteSave();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleRecoverSave();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          handleExportSave();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          handleImportSave();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          // Naviga direttamente alla creazione personaggio
          const { setCurrentScreen } = useGameStore.getState();
          setCurrentScreen('characterCreation');
          break;
        case 'Escape':
          e.preventDefault();
          goBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIndex, saveSlots.length, showDeleteConfirm]);

  const handleLoadGame = async () => {
    const selectedSlot = saveSlots[selectedIndex];
    
    if (!selectedSlot || !selectedSlot.exists || selectedSlot.corrupted) {
      setError('Slot di salvataggio non valido o corrotto');
      return;
    }

    // Controllo compatibilità versione
    if (selectedSlot.metadata && !isVersionCompatible(selectedSlot.metadata.version)) {
      const confirmLoad = window.confirm(
        `Questo salvataggio è della versione ${selectedSlot.metadata.version} che potrebbe non essere completamente compatibile con la versione attuale. Alcuni dati potrebbero essere persi o corrotti. Vuoi continuare comunque?`
      );
      
      if (!confirmLoad) {
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await loadSavedGame(selectedSlot.slot);
      
      if (!success) {
        setError('Errore nel caricamento del salvataggio');
      }
      // Il successo è gestito dal gameStore con notifiche
    } catch (err) {
      setError('Errore nel caricamento del salvataggio');
      console.error('Load game error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSave = () => {
    const selectedSlot = saveSlots[selectedIndex];
    
    if (!selectedSlot || !selectedSlot.exists) {
      setError('Nessun salvataggio da eliminare');
      return;
    }

    setShowDeleteConfirm(selectedSlot.slot);
  };

  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;

    try {
      const success = deleteSave(showDeleteConfirm);
      
      if (success) {
        // Ricarica la lista degli slot
        const updatedSlots = getSaveSlots();
        setSaveSlots(updatedSlots);
        
        // Aggiusta l'indice selezionato se necessario
        if (selectedIndex >= updatedSlots.length) {
          setSelectedIndex(Math.max(0, updatedSlots.length - 1));
        }
        
        addNotification({
          type: 'success',
          title: 'Salvataggio Eliminato',
          message: `Salvataggio eliminato con successo`,
          duration: 2000
        });
        
        setError(null);
      } else {
        setError('Errore nell\'eliminazione del salvataggio');
        addNotification({
          type: 'error',
          title: 'Errore Eliminazione',
          message: 'Impossibile eliminare il salvataggio',
          duration: 3000
        });
      }
    } catch (err) {
      setError('Errore nell\'eliminazione del salvataggio');
      console.error('Delete save error:', err);
    }

    setShowDeleteConfirm(null);
  };

  const handleRecoverSave = async () => {
    const selectedSlot = saveSlots[selectedIndex];
    
    if (!selectedSlot || !selectedSlot.exists || !selectedSlot.corrupted) {
      setError('Seleziona un salvataggio corrotto da recuperare');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await recoverSave(selectedSlot.slot);
      
      if (success) {
        // Ricarica la lista degli slot per mostrare il salvataggio recuperato
        const updatedSlots = getSaveSlots();
        setSaveSlots(updatedSlots);
      }
    } catch (err) {
      setError('Errore durante il recupero del salvataggio');
      console.error('Recovery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSave = async () => {
    const selectedSlot = saveSlots[selectedIndex];
    
    if (!selectedSlot || !selectedSlot.exists || selectedSlot.corrupted) {
      setError('Seleziona un salvataggio valido da esportare');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await exportSave(selectedSlot.slot);
    } catch (err) {
      setError('Errore durante l\'esportazione del salvataggio');
      console.error('Export error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSave = async () => {
    const selectedSlot = saveSlots[selectedIndex];
    
    if (!selectedSlot) {
      setError('Seleziona uno slot per l\'importazione');
      return;
    }

    // Conferma se lo slot contiene già un salvataggio
    if (selectedSlot.exists && !selectedSlot.corrupted) {
      const confirmOverwrite = window.confirm(
        `Lo slot ${getSlotDisplayName(selectedSlot.slot)} contiene già un salvataggio. Vuoi sovrascriverlo?`
      );
      
      if (!confirmOverwrite) {
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await importSave(selectedSlot.slot);
      
      if (success) {
        // Ricarica la lista degli slot per mostrare il nuovo salvataggio
        const updatedSlots = getSaveSlots();
        setSaveSlots(updatedSlots);
      }
    } catch (err) {
      setError('Errore durante l\'importazione del salvataggio');
      console.error('Import error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlaytime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatLocation = (location: string): string => {
    const locationMap: Record<string, string> = {
      'city': 'Città',
      'forest': 'Foresta',
      'plains': 'Pianura',
      'river': 'Fiume',
      'village': 'Villaggio',
      'menu': 'Menu',
      'game': 'In Gioco'
    };
    
    return locationMap[location] || location;
  };

  const getSlotDisplayName = (slot: string): string => {
    if (slot === 'autosave') return 'Salvataggio Automatico';
    if (slot === 'quicksave') return 'Salvataggio Rapido';
    return `Slot ${slot.replace('slot', '')}`;
  };

  const isVersionCompatible = (version: string): boolean => {
    // Versioni compatibili con v0.9.7
  const compatibleVersions = ['0.5.0', '0.6.0', '0.6.1', '0.9.6', '0.9.6.1', '0.9.7'];
    return compatibleVersions.includes(version);
  };

  const getVersionWarning = (version: string): string | null => {
    if (!isVersionCompatible(version)) {
      return `⚠️ Versione ${version} potrebbe non essere compatibile`;
    }
    return null;
  };

  if (showDeleteConfirm) {
    const slotToDelete = saveSlots.find(s => s.slot === showDeleteConfirm);
    
    return (
      <div className="min-h-screen bg-black text-phosphor-400 font-mono p-4">
        <div className="max-w-2xl mx-auto">
          <div className="border border-phosphor-600 p-6 bg-phosphor-900 bg-opacity-20">
            <h2 className="text-xl text-phosphor-300 mb-4">Conferma Eliminazione</h2>
            
            <div className="mb-6">
              <p className="mb-2">Sei sicuro di voler eliminare questo salvataggio?</p>
              
              {slotToDelete?.metadata && (
                <div className="bg-black bg-opacity-50 p-3 border border-phosphor-700 mt-3">
                  <div className="text-phosphor-300">{slotToDelete.metadata.playerName}</div>
                  <div className="text-sm text-phosphor-500">
                    Livello {slotToDelete.metadata.playerLevel} • {formatLocation(slotToDelete.metadata.location)}
                  </div>
                  <div className="text-sm text-phosphor-500">
                    Tempo di gioco: {formatPlaytime(slotToDelete.metadata.playtime)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="mb-4 text-phosphor-500">
                Questa azione non può essere annullata.
              </p>
              
              <div className="space-x-4">
                <span className="text-phosphor-300">[Y]</span> Sì, elimina
                <span className="ml-6 text-phosphor-300">[N]</span> No, annulla
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-phosphor-400 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl text-phosphor-300 mb-2">CARICA PARTITA</h1>
          <div className="text-sm text-phosphor-600">
            ↑↓ Naviga • [ENTER] Carica • [N] Nuova Partita • [D] Elimina • [R] Recupera • [E] Esporta • [I] Importa • [ESC] Torna
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 border border-red-600 bg-red-900 bg-opacity-20 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mb-4">
            <LoadingSpinner size="medium" message="Caricamento partita in corso..." />
          </div>
        )}

        {/* Save Slots List */}
        <div className="space-y-2">
          {saveSlots.map((slot, index) => (
            <div
              key={slot.slot}
              className={`
                border p-4 transition-colors
                ${index === selectedIndex 
                  ? 'border-phosphor-400 bg-phosphor-900 bg-opacity-30' 
                  : 'border-phosphor-600'
                }
                ${slot.corrupted ? 'border-red-600 bg-red-900 bg-opacity-10' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                {/* Slot Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-phosphor-300 font-bold">
                      {getSlotDisplayName(slot.slot)}
                    </span>
                    
                    {index === selectedIndex && (
                      <span className="text-phosphor-400">◄</span>
                    )}
                  </div>

                  {slot.exists && !slot.corrupted && slot.metadata ? (
                    <div className="space-y-1">
                      {/* Character Info */}
                      <div className="flex items-center gap-4">
                        <span className="text-phosphor-200 font-semibold">
                          {slot.metadata.playerName}
                        </span>
                        <span className="text-phosphor-500">
                          Livello {slot.metadata.playerLevel}
                        </span>
                      </div>

                      {/* Game Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-phosphor-500">
                          📍 {formatLocation(slot.metadata.location)}
                        </span>
                        <span className="text-phosphor-500">
                          ⏱️ {formatPlaytime(slot.metadata.playtime)}
                        </span>
                      </div>

                      {/* Save Info */}
                      <div className="text-xs text-phosphor-600">
                        <div>
                          Salvato: {new Date(slot.metadata.lastModified).toLocaleString('it-IT')} • 
                          Versione: {slot.metadata.version}
                        </div>
                        {getVersionWarning(slot.metadata.version) && (
                          <div className="text-yellow-400 mt-1">
                            {getVersionWarning(slot.metadata.version)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : slot.corrupted ? (
                    <div className="text-red-400">
                      <div className="mb-1">⚠️ Salvataggio corrotto o non compatibile</div>
                      <div className="text-xs text-red-300">
                        Premi [R] per tentare il recupero
                      </div>
                    </div>
                  ) : (
                    <div className="text-phosphor-600 italic">
                      Slot vuoto
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="text-right text-sm text-phosphor-600">
                  {slot.exists && !slot.corrupted && (
                    <div className="space-y-1">
                      <div>[ENTER] Carica</div>
                      <div>[E] Esporta</div>
                      <div>[D] Elimina</div>
                    </div>
                  )}
                  {slot.exists && slot.corrupted && (
                    <div className="space-y-1">
                      <div className="text-yellow-400">[R] Recupera</div>
                      <div>[D] Elimina</div>
                    </div>
                  )}
                  {!slot.exists && (
                    <div className="space-y-1">
                      <div className="text-green-400">[I] Importa</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No saves message */}
        {saveSlots.length === 0 || saveSlots.every(slot => !slot.exists) ? (
          <div className="text-center py-8">
            <div className="text-phosphor-500 text-lg mb-4">
              Nessun salvataggio trovato
            </div>
            <div className="text-phosphor-600 mb-6">
              Inizia una nuova partita per creare il tuo primo salvataggio
            </div>
            <div className="px-6 py-2 border border-phosphor-600 text-phosphor-400 text-center">
              [N] Nuova Partita
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-phosphor-600">
          <div className="mb-2">
            Salvataggi trovati: {saveSlots.filter(s => s.exists && !s.corrupted).length}
          </div>
          
          <div className="mb-4 p-3 border border-phosphor-700 bg-phosphor-900 bg-opacity-10">
            <div className="text-phosphor-400 font-bold mb-2">Funzionalità Avanzate</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-phosphor-300">[E] Esporta:</span> Scarica il salvataggio come file JSON</div>
              <div><span className="text-phosphor-300">[I] Importa:</span> Carica un salvataggio da file</div>
              <div><span className="text-phosphor-300">[R] Recupera:</span> Tenta di riparare salvataggi corrotti</div>
            </div>
          </div>
          
          <div>
            Premi [ESC] per tornare al menu principale
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadScreen;