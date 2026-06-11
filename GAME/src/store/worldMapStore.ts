/**
 * worldMapStore — stato di posizione e viaggio sulla mappa SVG (Sistema 1).
 *
 * Il player si muove per tappe tra POI lungo percorsi predefiniti.
 * Ogni tratta consuma tempo via `timeStore.advanceTime`, che a sua volta
 * applica decadimento sopravvivenza, meteo e trigger di storia — il costo
 * del viaggio (GDD v3: tempo/fatica/fame/sete) passa tutto da lì.
 *
 * Gli eventi probabilistici per tratta (Sistema 2) si aggancieranno qui,
 * in `travelTo` tra una tappa e l'altra.
 */

import { create } from 'zustand';
import { useTimeStore } from './timeStore';
import { useGameStore } from './gameStore';
import { GameState, JournalEntryType } from '../types';
import {
  START_POI_ID, findPath, getPoi, getRoute, WorldRoute,
} from '../data/worldMap';

/** Durata dell'animazione del marker per tratta (ms, solo visuale). */
export const LEG_ANIMATION_MS = 900;

const ROUTE_VERBS: Record<WorldRoute['kind'], string> = {
  strada: 'lungo la strada',
  sentiero: 'per il sentiero',
  guado: 'attraverso il guado',
  valico: 'su per il valico',
};

interface WorldMapState {
  /** POI in cui si trova (o verso cui sta viaggiando) il player. */
  currentPoiId: string;
  /** Viaggio in corso: blocca input e nuovi viaggi. */
  isTraveling: boolean;
  /** Destinazione finale del viaggio in corso (per la UI). */
  travelTargetId: string | null;
  /** POI già visitati (per future meccaniche di scoperta). */
  visitedPoiIds: string[];

  travelTo: (targetId: string) => void;
  reset: () => void;
}

export const useWorldMapStore = create<WorldMapState>((set, get) => ({
  currentPoiId: START_POI_ID,
  isTraveling: false,
  travelTargetId: null,
  visitedPoiIds: [START_POI_ID],

  travelTo: (targetId: string) => {
    const { currentPoiId, isTraveling } = get();
    if (isTraveling || targetId === currentPoiId) return;

    const path = findPath(currentPoiId, targetId);
    if (!path || path.length < 2) return;

    const target = getPoi(targetId);
    if (!target) return;

    const { addJournalEntry } = useGameStore.getState();
    addJournalEntry({
      text: `Ti metti in cammino verso ${target.name}.`,
      type: JournalEntryType.NARRATIVE,
    });
    set({ isTraveling: true, travelTargetId: targetId });

    let legIndex = 0;

    const step = () => {
      // Interruzione: morte o cambio stato durante il viaggio
      if (useGameStore.getState().gameState !== GameState.IN_GAME) {
        set({ isTraveling: false, travelTargetId: null });
        return;
      }

      if (legIndex >= path.length - 1) {
        set((state) => ({
          isTraveling: false,
          travelTargetId: null,
          visitedPoiIds: state.visitedPoiIds.includes(targetId)
            ? state.visitedPoiIds
            : [...state.visitedPoiIds, targetId],
        }));
        addJournalEntry({
          text: target.note
            ? `Sei arrivato: ${target.name}. ${target.note.charAt(0).toUpperCase()}${target.note.slice(1)}.`
            : `Sei arrivato: ${target.name}.`,
          type: JournalEntryType.NARRATIVE,
        });
        return;
      }

      const from = path[legIndex];
      const to = path[legIndex + 1];
      const route = getRoute(from, to);
      const toPoi = getPoi(to);
      if (!route || !toPoi) {
        set({ isTraveling: false, travelTargetId: null });
        return;
      }

      // Costo della tratta: il tempo trascina con sé sopravvivenza e meteo.
      useTimeStore.getState().advanceTime(route.hours * 60);

      // Qui si aggancerà il tiro eventi per tratta (Sistema 2, GDD v3).

      set({ currentPoiId: to });
      if (legIndex < path.length - 2) {
        addJournalEntry({
          text: `Prosegui ${ROUTE_VERBS[route.kind]}, oltre ${toPoi.name}.`,
          type: JournalEntryType.SYSTEM_MESSAGE,
        });
      }

      legIndex++;
      setTimeout(step, LEG_ANIMATION_MS);
    };

    step();
  },

  reset: () => set({
    currentPoiId: START_POI_ID,
    isTraveling: false,
    travelTargetId: null,
    visitedPoiIds: [START_POI_ID],
  }),
}));
