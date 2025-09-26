/*
⚠️ AVVISO CRITICO - PANNELLO INVENTARIO DEFINITIVO E IMMUTABILE ⚠️

QUESTO FILE È STATO DICHIARATO DEFINITIVO E IMMUTABILE

- DIVIETO ASSOLUTO di modifica senza autorizzazione esplicita scritta dell'operatore
- CONTENUTO FINALE: Ogni aspetto del pannello inventario è stato finalizzato e certificato
- PROTEZIONE TOTALE: Qualsiasi tentativo di modifica non autorizzata è VIETATO
- AUTORIZZAZIONE RICHIESTA: Solo l'operatore può autorizzare modifiche future
- SISTEMA COLORI: Verde uniforme consolidato e definitivo
- LAYOUT: Struttura panel ottimizzata e immutabile

Data finalizzazione: 2025-01-15 (Sessione Serale)
Data conferma: 2025-09-26 (Sessione di Verifica)
Stato: DEFINITIVO E PROTETTO - CONFERMA RINNOVATA
*/

import React from 'react';
import { useInventoryStore } from '../stores/inventory/inventoryStore';
import type { IInventorySlot } from '../interfaces/items';


const InventoryPanel: React.FC = () => {
  const { getInventory, items: itemDatabase } = useInventoryStore();
  const inventory = getInventory();



  return (
    <div className="panel">
      <h3 className="panel-title">INVENTARIO</h3>
      <ul className="space-y-2 text-uniform">
        {inventory.map((slot: IInventorySlot | null, index: number) => {
          const item = slot ? itemDatabase[slot.itemId] : null;
          return (
            <li key={index}>
              {item && slot ? (
                <>
                  <span className="text-green-400">{item.name}</span>
                  <span className="text-phosphor-400 ml-1"> x{slot.quantity}</span>
                  {slot.portions && <span className="text-yellow-400 ml-1">({slot.portions})</span>}
                </>
              ) : (
                <span className="text-phosphor-600">- Vuoto -</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InventoryPanel;