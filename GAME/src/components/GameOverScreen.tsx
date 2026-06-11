/**
 * GameOverScreen — l'ultima pagina del diario, v3 "Diario del Sopravvissuto".
 *
 * Dal design handoff: niente teschio ASCII né "GAME OVER" urlato — la morte
 * è una voce di diario interrotta, scritta in terza persona, con causa,
 * giorni di viaggio e gli ultimi ricordi annotati. Tre azioni in basso.
 */

import React, { useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useTimeStore } from '../store/timeStore';
import { GameState, DeathCause } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Stamp } from './ui/Stamp';

interface DeathProse {
  cause: string;
  note: string;
  prose: string;
}

const DEATH_PROSE: Record<DeathCause, DeathProse> = {
  COMBAT: {
    cause: 'Ferite · combattimento',
    note: 'la guardia non è bastata',
    prose: 'Il colpo arrivò da dove non guardava. Si piegò sulle ginocchia, e il diario gli scivolò dalla tasca, aperto sulla pagina sbagliata.',
  },
  STARVATION: {
    cause: 'Fame',
    note: 'lo stomaco vuoto da giorni',
    prose: 'Aveva smesso di sentire la fame il giorno prima — questo lo spaventò più di tutto. Si sedette per riposare un momento, e il momento non finì.',
  },
  DEHYDRATION: {
    cause: 'Sete',
    note: "l'acqua era finita",
    prose: "La borraccia era leggera da troppo tempo. Pensava al fiume segnato sulla mappa, due giorni a est. Due giorni erano un'eternità.",
  },
  SICKNESS: {
    cause: 'Malattia',
    note: 'la febbre non è scesa',
    prose: 'La febbre saliva da tre notti. Scrisse le ultime righe con una calligrafia che non sembrava più la sua.',
  },
  POISON: {
    cause: 'Veleno',
    note: 'qualcosa di sbagliato, mangiato o toccato',
    prose: 'Se ne accorse troppo tardi, dal sapore amaro che non andava via. Le mani smisero di obbedirgli una riga a metà.',
  },
  ENVIRONMENT: {
    cause: 'Il mondo stesso',
    note: 'una caduta, un passo falso',
    prose: 'A volte non serve un nemico. Basta un appiglio che cede, un terreno che mente. Il mondo ha reclamato anche lui, senza rabbia.',
  },
  UNKNOWN: {
    cause: 'Sconosciuta',
    note: 'il diario non lo dice',
    prose: "Il diario si interrompe qui, a metà di un pensiero. Quello che è successo dopo, nessuno l'ha scritto.",
  },
};

function dayOrdinal(day: number): string {
  const ordinals = ['', 'primo', 'secondo', 'terzo', 'quarto', 'quinto', 'sesto', 'settimo', 'ottavo', 'nono', 'decimo',
    'undicesimo', 'dodicesimo', 'tredicesimo', 'quattordicesimo', 'quindicesimo', 'sedicesimo', 'diciassettesimo',
    'diciottesimo', 'diciannovesimo', 'ventesimo'];
  return ordinals[day] ?? `${day}º`;
}

const GameOverScreen: React.FC = () => {
  const { deathCause, setGameState } = useGameStore();
  const journal = useGameStore((state) => state.journal);
  const gameTime = useTimeStore((state) => state.gameTime);
  const alignment = useCharacterStore((state) => state.alignment);

  const prose = DEATH_PROSE[deathCause || 'UNKNOWN'];

  const stampText = useMemo(() => {
    const diff = alignment.lena - alignment.elian;
    if (diff > 5) return 'FINE · LENA';
    if (diff < -5) return 'FINE · ELIAN';
    return 'FINE';
  }, [alignment]);

  // Le ultime annotazioni del viaggio diventano "ricordi"
  const memories = useMemo(
    () => journal.slice(0, 4).map((e) => e.text),
    [journal]
  );

  const handleLoad = useCallback(() => setGameState(GameState.LOAD_GAME), [setGameState]);
  const handleNewGame = useCallback(() => setGameState(GameState.CHARACTER_CREATION), [setGameState]);
  const handleMainMenu = useCallback(() => setGameState(GameState.MAIN_MENU), [setGameState]);

  const handlerMap = useMemo(() => ({
    Enter: handleMainMenu,
    Escape: handleMainMenu,
  }), [handleMainMenu]);

  useKeyboardInput(handlerMap);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'radial-gradient(ellipse 50% 40% at 50% 50%, #14171d, #050608)',
      zIndex: 30,
    }}>
      {/* ash falling */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 1 + (i % 3) * 0.5,
          height: 1 + (i % 3) * 0.5,
          left: `${(i * 41) % 100}%`,
          top: `${(i * 17) % 100}%`,
          background: 'rgba(220,228,235,0.35)',
          borderRadius: '50%',
          filter: 'blur(0.3px)',
        }} />
      ))}

      {/* the closing page */}
      <div className="paper" style={{
        position: 'absolute',
        left: '50%', top: '48%',
        transform: 'translate(-50%, -50%) rotate(-0.8deg)',
        width: 'min(600px, calc(100% - 64px))',
        maxHeight: 'calc(100% - 150px)',
        overflowY: 'auto', scrollbarWidth: 'none',
        padding: '48px 56px 44px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.4)',
      }}>
        {/* dark stain */}
        <div style={{
          position: 'absolute', top: -8, left: 80,
          width: 100, height: 30,
          background: 'radial-gradient(ellipse, rgba(125,58,42,0.55), transparent 70%)',
          filter: 'blur(3px)', pointerEvents: 'none',
        }} />

        <div className="t-sans" style={{ fontSize: 10, letterSpacing: '0.5em', color: 'var(--tsp-rust)', marginBottom: 8 }}>
          ULTIMA VOCE · DIARIO INTERROTTO
        </div>
        <div className="t-serif" style={{ fontSize: 48, lineHeight: 0.95, fontWeight: 500, letterSpacing: '-0.015em', marginBottom: 18 }}>
          Il {dayOrdinal(gameTime.day)} giorno.
        </div>
        <hr className="ink-rule" style={{ marginBottom: 22 }} />

        <p className="t-serif" style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--tsp-ink)', marginBottom: 16, textWrap: 'pretty' }}>
          {prose.prose}
        </p>
        <p className="t-serif" style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--tsp-ink-faded)', fontStyle: 'italic', marginBottom: 16, textWrap: 'pretty' }}>
          La pagina rimase aperta dove l'aveva lasciata. E il mondo, come sempre, continuò.
        </p>

        <hr className="ink-rule-dashed" style={{ marginBottom: 16 }} />

        <div style={{ display: 'flex', gap: 24, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div className="t-label-sm" style={{ marginBottom: 4, color: 'var(--tsp-rust)' }}>CAUSA</div>
            <div className="t-serif" style={{ fontSize: 16, fontStyle: 'italic' }}>{prose.cause}</div>
            <div className="t-hand" style={{ fontSize: 14, color: 'var(--tsp-slate)', marginTop: 2 }}>{prose.note}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-label-sm" style={{ marginBottom: 4 }}>HA CAMMINATO</div>
            <div className="t-serif" style={{ fontSize: 16 }}>
              {gameTime.day} {gameTime.day === 1 ? 'giorno' : 'giorni'}
            </div>
            <div className="t-hand" style={{ fontSize: 14, color: 'var(--tsp-slate)', marginTop: 2 }}>
              {journal.length} {journal.length === 1 ? 'voce annotata' : 'voci annotate'}
            </div>
          </div>
        </div>

        {memories.length > 0 && (
          <>
            <div className="t-label-sm" style={{ marginBottom: 6 }}>LE ULTIME RIGHE</div>
            <div className="t-hand" style={{ fontSize: 15, color: 'var(--tsp-ink)', lineHeight: 1.5, marginBottom: 8 }}>
              {memories.map((m, i) => (
                <div key={i}>· {m}</div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
          <div className="t-hand" style={{ fontSize: 16, color: 'var(--tsp-slate)', fontStyle: 'italic' }}>
            — qui finisce il diario di Ultimo, figlio del custode —
          </div>
          <Stamp rotate={-12} color="rust">{stampText}</Stamp>
        </div>
      </div>

      {/* actions */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button className="tsp-btn" onClick={handleLoad} style={{
          color: 'var(--tsp-paper)',
          borderColor: 'rgba(216,210,194,0.4)',
          background: 'transparent',
          padding: '12px 28px 10px',
        }}>
          CARICA L'ULTIMO SALVATAGGIO
        </button>
        <button className="tsp-btn tsp-btn-rust" onClick={handleNewGame} style={{ padding: '12px 28px 10px' }}>
          UN NUOVO SOPRAVVISSUTO
        </button>
        <button className="tsp-btn tsp-btn-ghost" onClick={handleMainMenu} style={{ color: 'var(--tsp-paper-edge)', padding: '12px 28px 10px' }}>
          MENU PRINCIPALE
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center' }}>
        <span className="t-sans" style={{ fontSize: 9, letterSpacing: '0.5em', color: 'rgba(216,210,194,0.35)' }}>
          IL MONDO CONTINUA SENZA DI TE
        </span>
      </div>
    </div>
  );
};

export default GameOverScreen;
