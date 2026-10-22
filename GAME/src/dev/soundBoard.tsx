import React, { useEffect, useState } from 'react';
import { audioManager, AmbienceScene } from '../utils/audio';
import { ambienceMix } from '../utils/sound/ambience';
import { WeatherType } from '../types';

/**
 * Drawn by sound.html (development only): every sound effect, a few game moments that
 * request several cues at once, and the ambience with biome, hour and weather
 * under the reviewer's control. Not part of the build.
 */

const GROUPS: { title: string; names: string[] }[] = [
    { title: 'Interfaccia', names: ['navigate', 'confirm', 'cancel', 'error'] },
    { title: 'Ricompense', names: ['xp_gain', 'item_get', 'trophy', 'level_up'] },
    { title: 'Missioni', names: ['quest_start', 'quest_update', 'quest_complete'] },
    { title: 'Combattimento', names: ['combat_start', 'hit_enemy', 'hit_player', 'victory', 'defeat'] },
    { title: 'Storia', names: ['ash_lullaby'] },
];

/** Cues the game requests together: only the most important reward should be heard. */
const MOMENTS: { label: string; names: string[] }[] = [
    { label: 'Sali di livello (con XP e trofeo)', names: ['confirm', 'level_up', 'xp_gain', 'trophy'] },
    { label: 'Missione completata (con XP e oggetto)', names: ['quest_complete', 'xp_gain', 'item_get'] },
    { label: 'Ultimo colpo e vittoria (con trofeo)', names: ['hit_enemy', 'victory', 'trophy'] },
    { label: 'Nuova partita (missione avviata)', names: ['confirm', 'quest_start', 'xp_gain'] },
];

const BIOMES: [string, string][] = [
    ['.', 'Pianura'], ['F', 'Foresta'], ['~', 'Fiume'], ['M', 'Montagna'],
    ['C', 'Città'], ['V', 'Villaggio'], ['A', 'Avamposto'],
];

const PRESETS: { label: string; scene: AmbienceScene }[] = [
    { label: 'Menu (crepuscolo)', scene: { biome: '.', hour: 20.2, weather: WeatherType.SERENO } },
    { label: 'Alba nel bosco', scene: { biome: 'F', hour: 6.3, weather: WeatherType.SERENO } },
    { label: 'Notte in pianura', scene: { biome: '.', hour: 23, weather: WeatherType.SERENO } },
    { label: 'Tempesta in città', scene: { biome: 'C', hour: 15, weather: WeatherType.TEMPESTA } },
    { label: 'Pioggia dal rifugio', scene: { biome: 'R', hour: 22, weather: WeatherType.PIOGGIA, sheltered: true } },
    { label: 'Nebbia sul fiume', scene: { biome: '~', hour: 7.5, weather: WeatherType.NEBBIA } },
];

const formatHour = (hour: number) => `${String(Math.floor(hour)).padStart(2, '0')}:${String(Math.round((hour % 1) * 60)).padStart(2, '0')}`;

const Button: React.FC<{ onClick: () => void; active?: boolean; children: React.ReactNode }> = ({ onClick, active, children }) => (
    <button
        onClick={onClick}
        className={`choice !px-4 !py-2 border-line2 text-[18px] hover:border-ember/60 ${active ? 'is-selected' : 'bg-bg0/30'}`}
    >
        {children}
    </button>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; text: string; onChange: (v: number) => void }> = ({ label, value, min, max, step, text, onChange }) => (
    <label className="flex items-center gap-4 text-[18px] text-ink2">
        <span className="w-28">{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="flex-1 accent-[rgb(var(--accent))]" />
        <span className="w-16 text-right font-cond tnum text-ink">{text}</span>
    </label>
);

export const SoundBoard: React.FC = () => {
    const [scene, setScene] = useState<AmbienceScene>(PRESETS[1].scene);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(audioManager.getVolumeForUI());
    const [muted, setMuted] = useState(audioManager.getIsMutedForUI());

    useEffect(() => {
        document.documentElement.className = 'theme-standard';
    }, []);

    useEffect(() => {
        audioManager.setAmbience(playing ? scene : null);
    }, [playing, scene]);

    const update = (patch: Partial<AmbienceScene>) => setScene(s => ({ ...s, ...patch }));
    const mix = ambienceMix(scene);
    const bars: [string, number][] = [
        ['Vento', mix.wind], ['Fischio', mix.whistle], ['Foglie', mix.leaves], ['Pioggia', mix.rain],
        ['Tuoni', mix.thunder], ['Acqua', mix.water], ['Uccelli', mix.birds], ['Grilli', mix.crickets],
        ['Gufi', mix.owls], ['Scricchiolii', mix.creaks], ['Fuoco', mix.fire],
    ];

    return (
        <div className="min-h-screen bg-bg0 px-12 py-10 font-sans text-ink">
            <p className="eyebrow">Solo sviluppo</p>
            <h1 className="title-display mt-2 text-[54px]">Anteprima audio</h1>
            <p className="prose-story mt-2 max-w-3xl text-[19px] text-ink2">
                Tutti i suoni sono sintetizzati in tempo reale (Web Audio): nessun file audio.
                Il primo clic sblocca l'audio del browser.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-8">
                <section className="surface p-7">
                    <h2 className="eyebrow mb-4">Effetti</h2>
                    {GROUPS.map(group => (
                        <div key={group.title} className="mb-5">
                            <p className="mb-2 font-cond text-[17px] font-semibold uppercase tracking-[0.14em] text-ink3">{group.title}</p>
                            <div className="flex flex-wrap gap-2">
                                {group.names.map(name => (
                                    <Button key={name} onClick={() => audioManager.playSound(name)}>{name}</Button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <h2 className="eyebrow mb-3 mt-7">Momenti di gioco</h2>
                    <div className="flex flex-col gap-2">
                        {MOMENTS.map(moment => (
                            <Button key={moment.label} onClick={() => moment.names.forEach(name => audioManager.playSound(name))}>
                                {moment.label}
                            </Button>
                        ))}
                    </div>
                    <h2 className="eyebrow mb-3 mt-7">Uscita</h2>
                    <div className="flex flex-col gap-3">
                        <Slider label="Volume" value={volume} min={0} max={10} step={1} text={String(volume)} onChange={v => { setVolume(v); audioManager.setVolume(v); audioManager.playSound('navigate'); }} />
                        <div className="flex gap-2">
                            <Button active={!muted} onClick={() => { setMuted(false); audioManager.setMuted(false); audioManager.playSound('navigate'); }}>Suono attivo</Button>
                            <Button active={muted} onClick={() => { setMuted(true); audioManager.setMuted(true); }}>Disattivo</Button>
                        </div>
                    </div>
                </section>

                <section className="surface p-7">
                    <div className="mb-4 flex items-center gap-4">
                        <h2 className="eyebrow flex-1">Ambiente</h2>
                        <Button active={playing} onClick={() => { audioManager.playSound('navigate'); setPlaying(p => !p); }}>
                            {playing ? 'Ferma' : 'Avvia'}
                        </Button>
                    </div>
                    <div className="mb-5 flex flex-wrap gap-2">
                        {PRESETS.map(preset => (
                            <Button key={preset.label} onClick={() => { audioManager.playSound('navigate'); setScene(preset.scene); setPlaying(true); }}>
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                        {BIOMES.map(([tile, label]) => (
                            <Button key={tile} active={scene.biome === tile} onClick={() => update({ biome: tile })}>{label}</Button>
                        ))}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                        {Object.values(WeatherType).map(weather => (
                            <Button key={weather} active={scene.weather === weather} onClick={() => update({ weather })}>{weather}</Button>
                        ))}
                        <Button active={scene.sheltered === true} onClick={() => update({ sheltered: !scene.sheltered })}>Nel rifugio</Button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Slider label="Ora" value={scene.hour} min={0} max={23.75} step={0.25} text={formatHour(scene.hour)} onChange={hour => update({ hour })} />
                        <Slider label="Acqua vicina" value={scene.water ?? (scene.biome === '~' ? 1 : 0)} min={0} max={1} step={0.05} text={(scene.water ?? 0).toFixed(2)} onChange={water => update({ water })} />
                        <Slider label="Livello" value={scene.level ?? 1} min={0} max={1} step={0.05} text={(scene.level ?? 1).toFixed(2)} onChange={level => update({ level })} />
                    </div>
                    <h2 className="eyebrow mb-3 mt-7">Strati</h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                        {bars.map(([label, value]) => (
                            <div key={label} className="flex items-center gap-3 text-[16px] text-ink3">
                                <span className="w-28">{label}</span>
                                <div className="h-1.5 flex-1 rounded-full bg-ink4/30">
                                    <div className="h-full rounded-full bg-ember" style={{ width: `${Math.min(1, value) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
