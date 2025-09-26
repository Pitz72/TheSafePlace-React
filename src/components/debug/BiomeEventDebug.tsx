import React, { useState } from 'react';
import { useEventStore } from '@/stores/events/eventStore';
import { useWorldStore } from '@/stores/world/worldStore';

interface BiomeEventDebugProps {
  onClose: () => void;
}

const BiomeEventDebug: React.FC<BiomeEventDebugProps> = ({ onClose }) => {
  const { forceBiomeEvent, eventDatabase, loadEventDatabase } = useEventStore();
  const { currentBiome } = useWorldStore();
  const [selectedBiome, setSelectedBiome] = useState<string>(currentBiome || 'FOREST');
  const [isLoading, setIsLoading] = useState(false);

  const biomes = [
    'CITY',
    'FOREST', 
    'PLAINS',
    'RIVER',
    'VILLAGE',
    'REST_STOP',
    'UNIQUE'
  ];

  const handleLoadDatabase = async () => {
    setIsLoading(true);
    try {
      await loadEventDatabase();
      console.log('[DEBUG] Database eventi caricato:', Object.keys(eventDatabase));
    } catch (error) {
      console.error('[DEBUG] Errore nel caricamento database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceEvent = () => {
    console.log(`[DEBUG] Forzando evento per bioma: ${selectedBiome}`);
    forceBiomeEvent(selectedBiome);
  };

  const getEventCount = (biome: string) => {
    return eventDatabase[biome]?.length || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🎲 Debug Eventi Bioma</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Carica Database */}
          <div>
            <button
              onClick={handleLoadDatabase}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors"
            >
              {isLoading ? 'Caricamento...' : 'Carica Database Eventi'}
            </button>
          </div>

          {/* Stato Database */}
          <div className="bg-gray-100 p-3 rounded">
            <h3 className="font-semibold mb-2">Stato Database:</h3>
            <div className="text-sm space-y-1">
              {biomes.map(biome => (
                <div key={biome} className="flex justify-between">
                  <span>{biome}:</span>
                  <span className={getEventCount(biome) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getEventCount(biome)} eventi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selettore Bioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Bioma:
            </label>
            <select
              value={selectedBiome}
              onChange={(e) => setSelectedBiome(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {biomes.map(biome => (
                <option key={biome} value={biome}>
                  {biome} ({getEventCount(biome)} eventi)
                </option>
              ))}
            </select>
          </div>

          {/* Bioma Corrente */}
          <div className="bg-yellow-100 p-3 rounded">
            <p className="text-sm">
              <strong>Bioma Corrente:</strong> {currentBiome || 'Non definito'}
            </p>
          </div>

          {/* Forza Evento */}
          <div>
            <button
              onClick={handleForceEvent}
              disabled={getEventCount(selectedBiome) === 0}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
            >
              🎯 Forza Evento per {selectedBiome}
            </button>
            {getEventCount(selectedBiome) === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Nessun evento disponibile per questo bioma
              </p>
            )}
          </div>

          {/* Istruzioni */}
          <div className="bg-blue-50 p-3 rounded text-sm">
            <h4 className="font-semibold mb-1">Istruzioni:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Carica il database eventi</li>
              <li>Seleziona un bioma</li>
              <li>Forza un evento per testare</li>
              <li>Controlla la console per i log di debug</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomeEventDebug;