import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { GameState, AttributeName, Attributes } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../constants';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import KeyArt from './art/KeyArt';
import Modal from './ui/Modal';
import Icon from './ui/Icon';

/** 4d6, the lowest die discarded. */
const rollStat = (): number => {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  rolls.shift();
  return rolls.reduce((sum, current) => sum + current, 0);
};

const ATTRIBUTE_HINTS: Record<AttributeName, string> = {
  for: 'Colpire, sollevare, portare peso',
  des: 'Schivare, mirare, muoversi in silenzio',
  cos: 'Resistere a fame, freddo e ferite',
  int: 'Capire, riparare, ricordare',
  sag: 'Intuire, orientarsi, sopravvivere',
  car: 'Convincere, mercanteggiare, intimidire',
};

const modifier = (value: number) => {
  const mod = Math.floor((value - 10) / 2);
  return `${mod >= 0 ? '+' : ''}${mod}`;
};

/** Ultimo's attributes are rolled one by one; ENTER speeds up, then starts the journey. */
const CharacterCreationScreen: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const setAttributes = useCharacterStore((state) => state.setAttributes);

  const [rolledStats, setRolledStats] = useState<Partial<Attributes>>({});
  const [currentAttribute, setCurrentAttribute] = useState<AttributeName | null>(null);
  const [rollingValue, setRollingValue] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  // ENTER during the animation reveals the remaining rolls at once.
  const skipRef = useRef(false);

  // The roll animation: cancelled on unmount (and on React's double mount in development).
  useEffect(() => {
    let cancelled = false;
    let rollInterval: ReturnType<typeof setInterval> | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>(resolve => { timers.push(setTimeout(resolve, ms)); });

    const rollSequence = async () => {
      const finalStats: Partial<Attributes> = {};
      for (const attr of ATTRIBUTES) {
        if (cancelled) return;
        setCurrentAttribute(attr);
        rollInterval = setInterval(() => setRollingValue(Math.floor(Math.random() * 16) + 3), 50);
        await wait(skipRef.current ? 0 : 1100);
        clearInterval(rollInterval);
        if (cancelled) return;
        finalStats[attr] = rollStat();
        setRolledStats({ ...finalStats });
        await wait(skipRef.current ? 0 : 350);
      }
      if (cancelled) return;
      setCurrentAttribute(null);
      setIsComplete(true);
    };
    rollSequence();
    return () => {
      cancelled = true;
      if (rollInterval) clearInterval(rollInterval);
      timers.forEach(clearTimeout);
    };
  }, []);

  const startGame = useCallback(() => {
    if (!isComplete) {
      skipRef.current = true;
      return;
    }
    setAttributes(rolledStats as Attributes);
    setGameState(GameState.IN_GAME);
  }, [isComplete, rolledStats, setAttributes, setGameState]);

  const handlerMap = useMemo(() => ({
    Enter: startGame,
  }), [startGame]);

  useKeyboardInput(handlerMap);

  return (
    <div className="relative h-full w-full">
      <KeyArt variant="dawn" shade="none" />
      <div className="absolute inset-0 bg-bg0/30" />
      <Modal
        backdrop="soft"
        eyebrow="Nuovo viaggio"
        icon="dice"
        title="Chi è Ultimo"
        subtitle={isComplete ? 'Il viaggio può cominciare.' : 'Diciassette anni, e quello che il padre gli ha insegnato. Il resto lo decidono i dadi.'}
        size="lg"
        hints={[{ keys: ['INVIO'], label: isComplete ? "Inizia l'avventura" : 'Accelera', active: isComplete }]}
      >
        <div className="grid grid-cols-3 gap-4 px-12 pb-10">
          {ATTRIBUTES.map((attr) => {
            const rolled = rolledStats[attr];
            const isRolling = currentAttribute === attr;
            const value = rolled ?? (isRolling ? rollingValue : null);
            return (
              <div
                key={attr}
                className={`surface-flat relative overflow-hidden px-7 py-6 transition-all duration-300 ${isRolling ? '!border-ember/60' : ''}`}
                style={isRolling ? { boxShadow: '0 0 40px -10px rgb(var(--c-ember) / 0.6)' } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="eyebrow">{attr}</div>
                    <div className="mt-1 text-[25px] font-medium text-ink">{ATTRIBUTE_LABELS[attr]}</div>
                  </div>
                  {rolled !== undefined && (
                    <span className="chip text-sage anim-fade-in">{modifier(rolled)}</span>
                  )}
                </div>
                <div className={`title-display mt-3 text-[92px] tnum ${rolled !== undefined ? 'text-ink' : isRolling ? 'text-ember' : 'text-ink4'}`}>
                  {value ?? '—'}
                </div>
                <div className="mt-1 text-[17px] text-ink3">{ATTRIBUTE_HINTS[attr]}</div>
                {rolled !== undefined && <Icon name="check" size={20} className="absolute bottom-6 right-6 text-sage anim-fade-in" strokeWidth={2.4} />}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default CharacterCreationScreen;
