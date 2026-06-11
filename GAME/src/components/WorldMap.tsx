/**
 * WorldMap — la mappa SVG navigabile (GDD v3, Sistema 1).
 *
 * Singola mappa grande in stile "disegnata a mano" (carta invecchiata,
 * inchiostro, etichette in corsivo), con:
 * - pan con trascinamento, zoom con rotella (0.7×–2.5×)
 * - camera che segue il marker del player a ogni tappa
 * - POI cliccabili: il click avvia il viaggio a tappe (worldMapStore)
 * - percorsi predefiniti tratteggiati tra i POI
 *
 * Il mood (giorno/alba/notte/tempesta) arriva dalla GameScreen.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WORLD_POIS, WORLD_ROUTES, WorldPoi, getPoi, routePathD,
} from '../data/worldMap';
import { useWorldMapStore } from '../store/worldMapStore';

const WORLD_W = 1200;
const WORLD_H = 800;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.5;

type MapMood = 'day' | 'night' | 'storm' | 'dawn';

interface WorldMapProps {
  mood?: MapMood;
}

/** Marcatore POI disegnato a inchiostro, per tipo. */
const PoiMarker: React.FC<{ poi: WorldPoi; isCurrent: boolean; isVisited: boolean }> = ({ poi, isCurrent, isVisited }) => {
  const ink = 'var(--tsp-ink)';
  const paper = 'var(--tsp-paper)';
  switch (poi.type) {
    case 'start':
      return (
        <g>
          <line x1="0" y1="0" x2="0" y2="-18" stroke={ink} strokeWidth="1.6" />
          <path d="M 0 -18 L 12 -14 L 0 -10 Z" fill="var(--tsp-rust)" stroke={ink} strokeWidth="0.8" />
        </g>
      );
    case 'shelter':
      return (
        <g>
          <circle r="8" fill={paper} stroke={ink} strokeWidth="1.4" />
          <path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke={ink} strokeWidth="1.5" />
        </g>
      );
    case 'village':
      return (
        <g>
          <rect x="-6" y="-6" width="12" height="12" fill={paper} stroke={ink} strokeWidth="1.4" />
          <path d="M -6 -6 L 0 -12 L 6 -6 Z" fill={paper} stroke={ink} strokeWidth="1.4" />
        </g>
      );
    case 'city':
      return (
        <g stroke={ink} strokeWidth="1.3" fill={paper}>
          <rect x="-9" y="-4" width="6" height="12" />
          <rect x="-1" y="-9" width="6" height="17" />
          <rect x="6" y="-2" width="5" height="10" />
        </g>
      );
    case 'water':
      return (
        <g fill="none" stroke="#5a6a78" strokeWidth="1.6">
          <path d="M -8 -2 Q -4 -7 0 -2 Q 4 3 8 -2" />
          <path d="M -8 4 Q -4 -1 0 4 Q 4 9 8 4" opacity="0.7" />
        </g>
      );
    case 'end':
      return (
        <g>
          <path d="M 0 -12 L 3.5 -3.5 L 12 -3.5 L 5 1.5 L 8 10.5 L 0 5.5 L -8 10.5 L -5 1.5 L -12 -3.5 L -3.5 -3.5 Z"
            fill="var(--tsp-rust)" stroke={ink} strokeWidth="0.9" opacity="0.9" />
        </g>
      );
    default: // landmark
      return (
        <g>
          <circle r="6" fill={isVisited || isCurrent ? paper : 'transparent'} stroke={ink} strokeWidth="1.4" strokeDasharray={isVisited || isCurrent ? undefined : '2.5 2'} />
          <circle r="1.8" fill={ink} />
        </g>
      );
  }
};

export const WorldMap: React.FC<WorldMapProps> = ({ mood = 'day' }) => {
  const currentPoiId = useWorldMapStore((s) => s.currentPoiId);
  const isTraveling = useWorldMapStore((s) => s.isTraveling);
  const visitedPoiIds = useWorldMapStore((s) => s.visitedPoiIds);
  const travelTo = useWorldMapStore((s) => s.travelTo);

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null);
  const [followPlayer, setFollowPlayer] = useState(true);

  const currentPoi = getPoi(currentPoiId)!;

  // Camera: centra il POI corrente finché l'utente non trascina la mappa.
  const centerOn = useCallback((wx: number, wy: number, z: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    setPan({ x: clientWidth / 2 - wx * z, y: clientHeight / 2 - wy * z });
  }, []);

  useEffect(() => {
    if (followPlayer) centerOn(currentPoi.x, currentPoi.y, zoom);
  }, [currentPoi.x, currentPoi.y, zoom, followPlayer, centerOn]);

  // Durante il viaggio la camera riprende a seguire il marker.
  useEffect(() => {
    if (isTraveling) setFollowPlayer(true);
  }, [isTraveling]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (e.deltaY < 0 ? 1.12 : 0.89)));
    setZoom(next);
  }, [zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      drag.moved = true;
      setFollowPlayer(false);
      setPan({ x: drag.panX + dx, y: drag.panY + dy });
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handlePoiClick = useCallback((poiId: string) => {
    if (dragRef.current?.moved) return;
    if (!isTraveling) travelTo(poiId);
  }, [isTraveling, travelTo]);

  const moodFilter =
    mood === 'night' ? 'brightness(0.55) saturate(0.7) hue-rotate(-10deg)' :
    mood === 'storm' ? 'brightness(0.78) saturate(0.6) contrast(1.05)' :
    mood === 'dawn'  ? 'brightness(0.92) sepia(0.08)' :
    'none';

  const routePaths = useMemo(() => WORLD_ROUTES.map((r) => ({
    key: `${r.a}-${r.b}`,
    d: routePathD(r),
    kind: r.kind,
  })), []);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden', background: '#0e1115',
        cursor: dragRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: WORLD_W, height: WORLD_H,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        transition: dragRef.current ? 'none' : 'transform 0.8s ease',
        filter: moodFilter,
      }}>
        <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} width={WORLD_W} height={WORLD_H} style={{ display: 'block' }}>
          <defs>
            <filter id="wmRough">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11" />
              <feDisplacementMap in="SourceGraphic" scale="3" />
            </filter>
            <filter id="wmInk">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
            <radialGradient id="wmVignette">
              <stop offset="62%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(20,24,30,0.4)" />
            </radialGradient>
          </defs>

          {/* carta */}
          <rect width={WORLD_W} height={WORLD_H} fill="#cdcdc2" />

          {/* pieghe */}
          <line x1={WORLD_W / 3} y1="0" x2={WORLD_W / 3} y2={WORLD_H} stroke="rgba(20,24,30,0.08)" strokeWidth="1.5" />
          <line x1={(WORLD_W / 3) * 2} y1="0" x2={(WORLD_W / 3) * 2} y2={WORLD_H} stroke="rgba(20,24,30,0.08)" strokeWidth="1.5" />
          <line x1="0" y1={WORLD_H / 2} x2={WORLD_W} y2={WORLD_H / 2} stroke="rgba(20,24,30,0.07)" strokeWidth="1.5" />

          {/* macchie di bioma */}
          <g filter="url(#wmRough)">
            {/* bosco NW (Foresta dei Sospiri) */}
            <path d="M 300 40 Q 430 30 500 80 Q 520 150 460 190 Q 360 210 300 170 Q 260 110 300 40 Z" fill="#9aa89a" opacity="0.4" />
            {/* bosco erborista */}
            <path d="M 460 420 Q 560 400 620 450 Q 640 520 580 560 Q 490 570 450 520 Q 430 460 460 420 Z" fill="#9aa89a" opacity="0.35" />
            {/* rovine vecchia città */}
            <rect x="180" y="280" width="140" height="100" fill="#8a8378" opacity="0.4" />
            {/* rovine sud (biblioteca/laboratorio) */}
            <rect x="650" y="520" width="280" height="120" fill="#8a8378" opacity="0.3" />
            {/* montagne SE */}
            <path d="M 900 400 Q 1040 380 1130 460 Q 1170 580 1120 700 Q 1020 740 940 680 Q 880 560 900 400 Z" fill="#a8a89e" opacity="0.5" />
            {/* pianure centrali */}
            <path d="M 380 220 Q 560 190 760 250 Q 820 320 760 380 Q 560 420 420 360 Q 350 290 380 220 Z" fill="#c8c2a8" opacity="0.3" />
          </g>

          {/* fiume — taglia il mondo da N a S passando per il Guado */}
          <g filter="url(#wmRough)">
            <path d="M 640 0 Q 620 120 650 220 Q 680 300 600 360 Q 540 420 580 520 Q 620 620 560 800"
              fill="none" stroke="#7a8a98" strokeWidth="14" opacity="0.45" />
            <path d="M 640 0 Q 620 120 650 220 Q 680 300 600 360 Q 540 420 580 520 Q 620 620 560 800"
              fill="none" stroke="#5a6a78" strokeWidth="4" opacity="0.5" />
          </g>

          {/* curve di livello sulle montagne */}
          <g fill="none" stroke="rgba(20,24,30,0.4)" strokeWidth="0.7" filter="url(#wmInk)">
            <ellipse cx="1020" cy="560" rx="120" ry="80" opacity="0.5" />
            <ellipse cx="1020" cy="560" rx="85" ry="55" opacity="0.4" />
            <ellipse cx="1020" cy="560" rx="50" ry="32" opacity="0.35" />
          </g>

          {/* alberelli a inchiostro nei boschi */}
          <g fill="none" stroke="var(--tsp-ink)" strokeWidth="1" filter="url(#wmInk)" opacity="0.65">
            {([[340, 80], [390, 60], [430, 100], [360, 130], [470, 140], [410, 160],
               [500, 460], [540, 440], [580, 500], [500, 520]] as Array<[number, number]>).map(([cx, cy], i) => (
              <g key={i}>
                <path d={`M ${cx} ${cy + 7} L ${cx} ${cy - 3}`} strokeWidth="1.2" />
                <path d={`M ${cx - 5} ${cy} Q ${cx} ${cy - 10} ${cx + 5} ${cy}`} />
                <path d={`M ${cx - 3} ${cy - 4} Q ${cx} ${cy - 11} ${cx + 3} ${cy - 4}`} />
              </g>
            ))}
          </g>

          {/* triangoli montagna */}
          <g fill="none" stroke="var(--tsp-ink)" strokeWidth="1.1" filter="url(#wmInk)" opacity="0.75">
            {([[950, 530], [1000, 500], [1060, 540], [990, 590], [1070, 600], [930, 620]] as Array<[number, number]>).map(([x, y], i) => (
              <path key={i} d={`M ${x - 9} ${y + 7} L ${x} ${y - 8} L ${x + 9} ${y + 7} M ${x - 4} ${y + 2} L ${x - 1} ${y - 1} M ${x + 1} ${y - 1} L ${x + 4} ${y + 2}`} />
            ))}
          </g>

          {/* percorsi */}
          <g fill="none" filter="url(#wmInk)">
            {routePaths.map(({ key, d, kind }) => (
              <path
                key={key}
                d={d}
                stroke={kind === 'guado' ? '#5a6a78' : 'rgba(20,24,30,0.55)'}
                strokeWidth={kind === 'strada' ? 1.8 : 1.3}
                strokeDasharray={kind === 'strada' ? '7 4' : '3 4'}
              />
            ))}
          </g>

          {/* POI */}
          {WORLD_POIS.map((poi) => {
            const isCurrent = poi.id === currentPoiId;
            const isVisited = visitedPoiIds.includes(poi.id);
            return (
              <g
                key={poi.id}
                transform={`translate(${poi.x} ${poi.y})`}
                onClick={() => handlePoiClick(poi.id)}
                style={{ cursor: isTraveling ? 'wait' : 'pointer' }}
                filter="url(#wmInk)"
              >
                {/* area di click generosa */}
                <circle r="22" fill="transparent" />
                <PoiMarker poi={poi} isCurrent={isCurrent} isVisited={isVisited} />
                <text
                  x="0" y={poi.type === 'city' ? 28 : 24}
                  textAnchor="middle"
                  fontFamily="var(--tsp-hand)"
                  fontSize="15"
                  fill="var(--tsp-ink)"
                  opacity={isVisited || isCurrent ? 0.9 : 0.65}
                  transform="rotate(-2)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {poi.name}
                </text>
                {poi.note && (isVisited || isCurrent) && (
                  <text
                    x="0" y={poi.type === 'city' ? 42 : 38}
                    textAnchor="middle"
                    fontFamily="var(--tsp-hand)"
                    fontSize="11"
                    fill="var(--tsp-rust)"
                    opacity="0.75"
                    transform="rotate(-2)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {poi.note}
                  </text>
                )}
              </g>
            );
          })}

          {/* marker player — si muove con transizione tra le tappe */}
          <g
            transform={`translate(${currentPoi.x} ${currentPoi.y})`}
            style={{ transition: 'transform 0.85s ease-in-out', pointerEvents: 'none' }}
          >
            <circle r="6" fill="var(--tsp-rust)" stroke="var(--tsp-ink)" strokeWidth="1.3" />
            <circle r="12" fill="none" stroke="var(--tsp-rust)" strokeWidth="1.2" opacity="0.6">
              <animate attributeName="r" values="9;15;9" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <text
              x="14" y="-8"
              fontFamily="var(--tsp-hand)"
              fontSize="12"
              fill="var(--tsp-rust)"
              style={{ userSelect: 'none' }}
            >
              {isTraveling ? 'in cammino…' : 'tu sei qui'}
            </text>
          </g>

          {/* macchia di caffè e vignetta */}
          <ellipse cx="1080" cy="90" rx="46" ry="30" fill="rgba(74,52,32,0.16)" filter="url(#wmRough)" />
          <rect width={WORLD_W} height={WORLD_H} fill="url(#wmVignette)" />
        </svg>
      </div>

      {/* hint zoom/pan */}
      <div className="t-sans" style={{
        position: 'absolute', right: 16, bottom: 90,
        fontSize: 9, letterSpacing: '0.25em',
        color: 'rgba(216,210,194,0.45)',
        pointerEvents: 'none',
      }}>
        ROTELLA ZOOM · TRASCINA PER ESPLORARE
      </div>
    </div>
  );
};
