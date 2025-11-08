// utils/audio.ts

const AUDIO_SETTINGS_KEY = 'tspc_audio_settings';

/**
 * @interface AudioSettings
 * @description Represents the audio settings.
 * @property {number} volume - The volume level, from 0 to 10.
 * @property {boolean} isMuted - Whether the audio is muted.
 */
interface AudioSettings {
    volume: number; // Stored as 0-10
    isMuted: boolean;
}

class AudioManager {
    private audioContext: AudioContext | null = null;
    private musicBoxSource: OscillatorNode | null = null;
    
    private volume: number; // Stored as 0.0 to 0.2
    private isMuted: boolean;

    constructor() {
        const savedSettings = this.loadSettings();
        this.volume = this.uiVolumeToGain(savedSettings.volume);
        this.isMuted = savedSettings.isMuted;
    }
    
    private loadSettings(): AudioSettings {
        try {
            const settingsStr = localStorage.getItem(AUDIO_SETTINGS_KEY);
            if (settingsStr) {
                return JSON.parse(settingsStr);
            }
        } catch (e) {
            console.error("Failed to parse audio settings from localStorage", e);
        }
        // Default settings
        return { volume: 7, isMuted: false };
    }

    private saveSettings() {
        try {
            const settings: AudioSettings = {
                volume: this.gainToUiVolume(this.volume),
                isMuted: this.isMuted,
            };
            localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save audio settings to localStorage", e);
        }
    }

    // Convert UI volume (0-10) to gain value (0.0-0.2)
    private uiVolumeToGain(uiVolume: number): number {
        return (uiVolume / 10) * 0.2;
    }
    
    // Convert gain value back to UI volume for saving
    private gainToUiVolume(gain: number): number {
        return Math.round((gain / 0.2) * 10);
    }

    // Public methods for UI control
    /**
     * Sets the volume.
     * @param {number} uiVolume - The volume level, from 0 to 10.
     */
    public setVolume(uiVolume: number) {
        this.volume = this.uiVolumeToGain(uiVolume);
        this.saveSettings();
    }

    /**
     * Sets whether the audio is muted.
     * @param {boolean} muted - Whether the audio is muted.
     */
    public setMuted(muted: boolean) {
        this.isMuted = muted;
        this.saveSettings();
        if (muted && this.musicBoxSource) {
            this.musicBoxSource.stop();
            this.musicBoxSource = null;
        }
    }
    
    /**
     * Gets the volume for the UI.
     * @returns {number} The volume level, from 0 to 10.
     */
    public getVolumeForUI(): number {
        return this.gainToUiVolume(this.volume);
    }

    /**
     * Gets whether the audio is muted for the UI.
     * @returns {boolean} Whether the audio is muted.
     */
    public getIsMutedForUI(): boolean {
        return this.isMuted;
    }

    private async ensureContext(): Promise<AudioContext | null> {
        if (this.isMuted) return null;

        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser");
                return null;
            }
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        return this.audioContext;
    }

    private async playFrequency(freq: number, duration: number, type: OscillatorType = 'square') {
        const context = await this.ensureContext();
        if (!context) return;

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, context.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration / 1000);
    }
    
    private async playSequence(notes: { freq: number, duration: number, type?: OscillatorType }[]) {
        const context = await this.ensureContext();
        if (!context) return;
        
        let time = context.currentTime;
        
        notes.forEach(note => {
            const oscillator = context!.createOscillator();
            const gainNode = context!.createGain();
            
            oscillator.type = note.type || 'square';
            oscillator.frequency.setValueAtTime(note.freq, time);

            gainNode.gain.setValueAtTime(this.volume, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + note.duration / 1000);

            oscillator.connect(gainNode);
            gainNode.connect(context!.destination);

            oscillator.start(time);
            oscillator.stop(time + note.duration / 1000);
            
            time += note.duration / 1000;
        });
    }

    private async playMusicBox() {
        const context = await this.ensureContext();
        if (!context) return;
        
        if (this.musicBoxSource) {
            this.musicBoxSource.stop();
            this.musicBoxSource = null;
        }

        const melody = [
            { freq: 523, duration: 250 }, // C5
            { freq: 523, duration: 250 },
            { freq: 780, duration: 250 }, // G5 (stonato, dovrebbe essere 784)
            { freq: 784, duration: 250 },
            { freq: 880, duration: 250 }, // A5
            { freq: 880, duration: 250 },
            { freq: 784, duration: 500 }, // G5
            { freq: 659, duration: 250 }, // E5
            { freq: 659, duration: 250 },
            { freq: 585, duration: 250 }, // D5 (stonato, dovrebbe essere 587)
            { freq: 587, duration: 250 },
            { freq: 523, duration: 500 }, // C5
        ];

        let time = context.currentTime;

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'triangle';
        // Use a fraction of the global volume for the music box to keep it subtle
        gainNode.gain.value = this.volume * 0.8; 

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        melody.forEach(note => {
            oscillator.frequency.setValueAtTime(note.freq, time);
            time += note.duration / 1000;
        });

        oscillator.start(context.currentTime);
        // La melodia si interromperà bruscamente dopo 8 secondi
        oscillator.stop(context.currentTime + 8);
        this.musicBoxSource = oscillator;
    }

    /**
     * Plays a sound.
     * @param {string} sound - The name of the sound to play.
     */

    public playSound(sound: string) {
        // This is now a fire-and-forget wrapper around the new async methods
        switch(sound) {
            case 'navigate':
                this.playFrequency(880, 50);
                break;
            case 'confirm':
                this.playSequence([{ freq: 523, duration: 70 }, { freq: 659, duration: 70 }]);
                break;
            case 'cancel':
                this.playSequence([{ freq: 659, duration: 70 }, { freq: 523, duration: 70 }]);
                break;
            case 'error':
                this.playFrequency(110, 200);
                break;
            case 'item_get':
                this.playSequence([{ freq: 523, duration: 80 }, { freq: 659, duration: 80 }, { freq: 784, duration: 80 }]);
                break;
            case 'xp_gain':
                this.playFrequency(1200, 100, 'sine');
                break;
            case 'level_up':
                this.playSequence([
                    { freq: 261, duration: 100 }, { freq: 329, duration: 100 }, 
                    { freq: 392, duration: 100 }, { freq: 523, duration: 200 }
                ]);
                break;
            case 'combat_start':
                this.playSequence([{ freq: 110, duration: 150 }, { freq: 98, duration: 300 }]);
                break;
            case 'hit_player':
                this.playFrequency(150, 100);
                break;
            case 'hit_enemy':
                this.playFrequency(300, 80);
                break;
            case 'victory':
                 this.playSequence([
                    { freq: 392, duration: 100 }, { freq: 523, duration: 100 }, 
                    { freq: 659, duration: 100 }, { freq: 784, duration: 300 }
                ]);
                break;
            case 'defeat':
                 this.playSequence([
                    { freq: 523, duration: 200 }, { freq: 392, duration: 200 }, 
                    { freq: 329, duration: 200 }, { freq: 261, duration: 400 }
                ]);
                break;
            case 'ash_lullaby':
                this.playMusicBox();
                break;
        }
    }
}

export const audioManager = new AudioManager();