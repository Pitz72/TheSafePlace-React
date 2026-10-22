// utils/audio.ts
import { Ambience, AmbienceScene } from './sound/ambience';
import { CueState, LULLABY_LENGTH, NO_CUE, SOUNDS, SOUND_ALIASES, arbitrate, playLullaby } from './sound/sfx';
import { NoiseBank, Synth, createImpulse, createNoiseBank } from './sound/synth';

export type { AmbienceScene };

const AUDIO_SETTINGS_KEY = 'tspc_audio_settings';

/**
 * @interface AudioSettings
 * @description Represents the audio settings.
 * @property {number} volume - The volume level, from 0 to 10.
 * @property {boolean} isMuted - Whether the audio is muted.
 * @property {boolean} ambience - Whether the ambience (wind, rain, animals) plays.
 */
interface AudioSettings {
    volume: number; // Stored as 0-10
    isMuted: boolean;
    ambience: boolean;
}

/** The nodes every sound goes through, built with the AudioContext. */
interface AudioGraph {
    /** Volume and mute. */
    master: GainNode;
    sfx: Synth;
    reverb: ConvolverNode;
    bank: NoiseBank;
    impulse: AudioBuffer;
}

/** Requests older than this when the context finally runs are dropped, not played late. */
const STALE_MS = 300;

class AudioManager {
    private audioContext: AudioContext | null = null;
    private audioUnavailable = false;
    private graph: AudioGraph | null = null;

    private volume: number; // 0-10, as shown in the options
    private isMuted: boolean;
    private ambienceEnabled: boolean;

    /** Sounds requested in the current instant, played together by flush(). */
    private pending: string[] = [];
    private flushQueued = false;
    private cue: CueState = NO_CUE;
    private lullaby: GainNode[] = [];

    private scene: AmbienceScene | null = null;
    private sceneKey = '';
    private ambience: Ambience | null = null;

    constructor() {
        const savedSettings = this.loadSettings();
        this.volume = savedSettings.volume;
        this.isMuted = savedSettings.isMuted;
        this.ambienceEnabled = savedSettings.ambience;
    }

    private loadSettings(): AudioSettings {
        try {
            const settingsStr = localStorage.getItem(AUDIO_SETTINGS_KEY);
            if (settingsStr) {
                const saved = JSON.parse(settingsStr);
                // A damaged value must not leave the volume at NaN.
                const volume = Number(saved?.volume);
                return {
                    volume: Number.isFinite(volume) ? Math.min(10, Math.max(0, Math.round(volume))) : 7,
                    isMuted: saved?.isMuted === true,
                    ambience: saved?.ambience !== false,
                };
            }
        } catch (e) {
            console.error("Failed to parse audio settings from localStorage", e);
        }
        // Default settings
        return { volume: 7, isMuted: false, ambience: true };
    }

    private saveSettings() {
        try {
            const settings: AudioSettings = {
                volume: this.volume,
                isMuted: this.isMuted,
                ambience: this.ambienceEnabled,
            };
            localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save audio settings to localStorage", e);
        }
    }

    /** UI volume (0-10) to gain: squared, so the steps of the slider sound even. */
    private masterGain(): number {
        return this.isMuted ? 0 : 1.6 * (this.volume / 10) ** 2;
    }

    private applyMasterGain() {
        if (!this.audioContext || !this.graph) return;
        this.graph.master.gain.setTargetAtTime(this.masterGain(), this.audioContext.currentTime, 0.03);
    }

    // Public methods for UI control
    /**
     * Sets the volume.
     * @param {number} uiVolume - The volume level, from 0 to 10.
     */
    public setVolume(uiVolume: number) {
        const volume = Number(uiVolume);
        this.volume = Number.isFinite(volume) ? Math.min(10, Math.max(0, Math.round(volume))) : this.volume;
        this.saveSettings();
        this.applyMasterGain();
    }

    /**
     * Sets whether the audio is muted.
     * @param {boolean} muted - Whether the audio is muted.
     */
    public setMuted(muted: boolean) {
        this.isMuted = muted;
        this.saveSettings();
        if (muted) {
            this.pending = [];
            this.stopLullaby();
        }
        this.applyMasterGain();
        this.syncAmbience();
    }

    /**
     * Turns the ambience (wind, rain, birds, insects) on or off; effects keep playing.
     * @param {boolean} enabled - Whether the ambience plays.
     */
    public setAmbienceEnabled(enabled: boolean) {
        this.ambienceEnabled = enabled;
        this.saveSettings();
        this.syncAmbience();
    }

    /**
     * Gets the volume for the UI.
     * @returns {number} The volume level, from 0 to 10.
     */
    public getVolumeForUI(): number {
        return this.volume;
    }

    /**
     * Gets whether the audio is muted for the UI.
     * @returns {boolean} Whether the audio is muted.
     */
    public getIsMutedForUI(): boolean {
        return this.isMuted;
    }

    /**
     * Gets whether the ambience is on, for the UI.
     * @returns {boolean} Whether the ambience plays.
     */
    public getAmbienceEnabledForUI(): boolean {
        return this.ambienceEnabled;
    }

    /**
     * Sets what the player hears around them; null for silence. Calls with the
     * same scene are cheap: only a change is passed on to the soundscape.
     * @param {AmbienceScene | null} scene - Where, when and under which sky.
     */
    public setAmbience(scene: AmbienceScene | null) {
        const key = scene
            ? [scene.biome, Math.round(scene.hour * 12), scene.weather, (scene.water ?? 0).toFixed(2), scene.sheltered === true, (scene.level ?? 1).toFixed(2)].join('|')
            : '';
        if (key === this.sceneKey) return;
        this.sceneKey = key;
        this.scene = scene;
        this.syncAmbience();
    }

    /** Starts, updates or stops the soundscape. It never creates the context itself:
     *  browsers only allow that after the player has pressed something. */
    private syncAmbience() {
        const context = this.audioContext;
        const graph = this.graph;
        if (!context || !graph || !this.scene || !this.ambienceEnabled || this.isMuted) {
            this.ambience?.dispose();
            this.ambience = null;
            return;
        }
        if (!this.ambience) this.ambience = new Ambience(context, graph.master, graph.bank, graph.impulse);
        this.ambience.setScene(this.scene);
    }

    private buildGraph(context: AudioContext): AudioGraph {
        // A gentle limiter keeps a storm plus a level-up from ever clipping.
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -10;
        limiter.knee.value = 8;
        limiter.ratio.value = 8;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.25;
        limiter.connect(context.destination);

        const master = context.createGain();
        master.gain.value = this.masterGain();
        master.connect(limiter);

        const bank = createNoiseBank(context);
        const impulse = createImpulse(context);
        const reverb = context.createConvolver();
        reverb.buffer = impulse;
        const reverbReturn = context.createGain();
        reverbReturn.gain.value = 0.55;
        reverb.connect(reverbReturn);
        reverbReturn.connect(master);

        return { master, reverb, bank, impulse, sfx: { ctx: context, out: master, verb: reverb, noise: bank } };
    }

    private async ensureContext(): Promise<AudioContext | null> {
        if (this.isMuted) return null;

        if (!this.audioContext) {
            if (this.audioUnavailable) return null;
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.graph = this.buildGraph(this.audioContext);
            } catch {
                // No Web Audio (old browser, test environment): play silently from now on.
                this.audioContext = null;
                this.graph = null;
                this.audioUnavailable = true;
                console.warn('Web Audio API non disponibile: il gioco proseguirà senza suoni.');
                return null;
            }
            // Minimised or hidden: the soundscape pauses with the game.
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) void this.audioContext?.suspend();
                else if (!this.isMuted) void this.audioContext?.resume();
            });
            // The ambience (and the noise it needs) starts just after this first sound, not before it.
            setTimeout(() => this.syncAmbience(), 0);
        }

        if (this.audioContext.state === 'suspended' && !document.hidden) {
            await this.audioContext.resume();
        }

        return this.audioContext;
    }

    /** Plays everything requested in the same instant, after arbitration. */
    private async flush() {
        const names = this.pending;
        this.pending = [];
        this.flushQueued = false;
        const requestedAt = performance.now();
        const context = await this.ensureContext();
        if (!context || !this.graph || this.isMuted || context.state !== 'running' || performance.now() - requestedAt > STALE_MS) return;
        const { play, state } = arbitrate(names, context.currentTime, this.cue);
        this.cue = state;
        const t = context.currentTime + 0.01;
        for (const name of play) SOUNDS[name].play(this.graph.sfx, t);
    }

    private stopLullaby() {
        const now = this.audioContext?.currentTime ?? 0;
        for (const gain of this.lullaby) {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setTargetAtTime(0, now, 0.02);
        }
        this.lullaby = [];
    }

    private async playMusicBox() {
        const context = await this.ensureContext();
        if (!context || !this.graph) return;
        this.stopLullaby();

        const t = context.currentTime + 0.05;
        const dry = context.createGain();
        dry.connect(this.graph.master);
        const wet = context.createGain();
        wet.connect(this.graph.reverb);
        playLullaby({ ctx: context, out: dry, verb: wet, noise: this.graph.bank }, t);
        // La melodia si interrompe bruscamente dopo 8 secondi (only the room keeps ringing).
        for (const gain of [dry, wet]) {
            gain.gain.setValueAtTime(1, t + LULLABY_LENGTH - 0.015);
            gain.gain.linearRampToValueAtTime(0, t + LULLABY_LENGTH);
        }
        this.lullaby = [dry, wet];
    }

    /**
     * Plays a sound.
     * @param {string} sound - The name of the sound to play.
     */
    public playSound(sound: string) {
        const name = SOUND_ALIASES[sound] ?? sound;
        if (name === 'ash_lullaby') {
            void this.playMusicBox();
            return;
        }
        if (!SOUNDS[name] || this.isMuted || this.audioUnavailable) return;
        // Fire-and-forget: everything asked for in this instant is played together.
        this.pending.push(name);
        if (this.flushQueued) return;
        this.flushQueued = true;
        queueMicrotask(() => void this.flush());
    }
}

export const audioManager = new AudioManager();
