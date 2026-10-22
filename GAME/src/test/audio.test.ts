import { describe, it, expect } from 'vitest';
import { NO_CUE, SOUNDS, SOUND_ALIASES, arbitrate } from '../utils/sound/sfx';
import { ambienceMix, nightness } from '../utils/sound/ambience';
import { audioManager } from '../utils/audio';
import { WeatherType } from '../types';

/** Every name the game passes to playSound (see the call sites). */
const USED_NAMES = [
    'navigate', 'confirm', 'cancel', 'error', 'back', 'enter_refuge', 'item_get', 'xp_gain', 'level_up',
    'trophy', 'quest_start', 'quest_update', 'quest_complete', 'combat_start', 'hit_player', 'hit_enemy',
    'victory', 'defeat',
];

describe('sound effects', () => {
    it('every sound the game asks for exists (aliases included)', () => {
        for (const name of USED_NAMES) expect(SOUNDS[SOUND_ALIASES[name] ?? name], name).toBeDefined();
    });

    it('a level-up plays one cue, not the XP line and the trophy on top of it', () => {
        const { play } = arbitrate(['confirm', 'level_up', 'xp_gain', 'trophy'], 10, NO_CUE);
        expect(play.sort()).toEqual(['confirm', 'level_up']);
    });

    it('interface sounds and blows always play, merged when repeated', () => {
        const { play } = arbitrate(['error', 'error', 'hit_player', 'item_get'], 0, NO_CUE);
        expect(play.sort()).toEqual(['error', 'hit_player', 'item_get']);
    });

    it('a ringing cue holds back lesser ones, but not a more important one', () => {
        const first = arbitrate(['quest_complete'], 5, NO_CUE);
        expect(arbitrate(['item_get'], 5.5, first.state).play).toEqual([]);
        expect(arbitrate(['trophy'], 5.5, first.state).play).toEqual([]);
        expect(arbitrate(['level_up'], 5.5, first.state).play).toEqual(['level_up']);
        expect(arbitrate(['item_get'], 5 + SOUNDS.quest_complete.hold + 0.01, first.state).play).toEqual(['item_get']);
    });

    it('unknown names are ignored', () => {
        expect(arbitrate(['does_not_exist'], 0, NO_CUE).play).toEqual([]);
    });
});

describe('ambience mix', () => {
    const scene = (biome: string, hour: number, weather = WeatherType.SERENO) => ambienceMix({ biome, hour, weather });

    it('crickets sing at night, birds at dawn', () => {
        expect(scene('.', 23).crickets).toBeGreaterThan(0.5);
        expect(scene('.', 12).crickets).toBe(0);
        expect(scene('F', 6.3).birds).toBeGreaterThan(scene('F', 13).birds);
        expect(scene('F', 2).birds).toBe(0);
        expect(nightness(3)).toBe(1);
        expect(nightness(13)).toBe(0);
    });

    it('rain silences animals, a storm brings thunder and stronger wind', () => {
        const rain = scene('.', 23, WeatherType.PIOGGIA);
        expect(rain.rain).toBeGreaterThan(0);
        expect(rain.crickets).toBe(0);
        const storm = scene('.', 12, WeatherType.TEMPESTA);
        expect(storm.thunder).toBeGreaterThan(0);
        expect(storm.wind).toBeGreaterThan(scene('.', 12).wind);
        expect(scene('.', 12, WeatherType.NEBBIA).wind).toBeLessThan(scene('.', 12).wind);
    });

    it('places sound like their landscape', () => {
        expect(scene('~', 12).water).toBe(1);
        expect(scene('M', 12).whistle).toBeGreaterThan(0);
        expect(scene('C', 12).creakKind).toBe('metal');
        expect(scene('A', 12).fire).toBeGreaterThan(0);
        expect(ambienceMix({ biome: '.', hour: 12, weather: WeatherType.PIOGGIA, sheltered: true }).fire).toBeGreaterThan(0);
        // Special places borrow a landscape instead of falling silent.
        expect(scene('L', 12).creakKind).toBe('metal');
        expect(scene('?', 12).wind).toBeGreaterThan(0);
    });
});

describe('audio manager without Web Audio (jsdom)', () => {
    it('plays silently and keeps the settings', async () => {
        for (const name of [...USED_NAMES, 'ash_lullaby', 'unknown']) audioManager.playSound(name);
        audioManager.setAmbience({ biome: 'F', hour: 22, weather: WeatherType.PIOGGIA, sheltered: true });
        await Promise.resolve();

        audioManager.setVolume(14);
        expect(audioManager.getVolumeForUI()).toBe(10);
        audioManager.setVolume(3);
        audioManager.setAmbienceEnabled(false);
        expect(audioManager.getAmbienceEnabledForUI()).toBe(false);
        expect(JSON.parse(localStorage.getItem('tspc_audio_settings') ?? '{}')).toEqual({ volume: 3, isMuted: false, ambience: false });

        audioManager.setAmbienceEnabled(true);
        audioManager.setVolume(7);
        audioManager.setAmbience(null);
    });
});
