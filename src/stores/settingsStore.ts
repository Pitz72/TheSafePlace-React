import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VideoMode = 'standard' | 'no-effects' | 'high-contrast';

interface SettingsState {
  // Video settings
  videoMode: VideoMode;
  
  // Audio settings
  audioEnabled: boolean;
  
  // Actions
  setVideoMode: (mode: VideoMode) => void;
  setAudioEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  videoMode: 'standard' as VideoMode,
  audioEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setVideoMode: (mode: VideoMode) => {
        set({ videoMode: mode });
        // Apply theme immediately
        applyTheme(mode);
      },
      
      setAudioEnabled: (enabled: boolean) => {
        set({ audioEnabled: enabled });
      },
      
      resetSettings: () => {
        set(defaultSettings);
        applyTheme(defaultSettings.videoMode);
      },
    }),
    {
      name: 'tsp-settings',
      version: 1,
    }
  )
);

// Theme application function
function applyTheme(mode: VideoMode) {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('theme-standard', 'theme-no-effects', 'theme-high-contrast');
  
  // Apply new theme class
  root.classList.add(`theme-${mode}`);
  
  // Update CSS custom properties based on theme
  switch (mode) {
    case 'standard':
      // Reset to default CRT theme - restore original phosphor colors
      root.style.removeProperty('--phosphor-primary');
      root.style.removeProperty('--phosphor-secondary');
      root.style.removeProperty('--phosphor-bg');
      root.style.removeProperty('--phosphor-panel-bg');
      root.style.removeProperty('--phosphor-border');
      root.style.removeProperty('--phosphor-text');
      root.style.removeProperty('--phosphor-glow');
      
      // Reset map colors
      root.style.removeProperty('--phosphor-plains');
      root.style.removeProperty('--phosphor-forest');
      root.style.removeProperty('--phosphor-mountain');
      root.style.removeProperty('--phosphor-water');
      root.style.removeProperty('--phosphor-ruin');
      root.style.removeProperty('--phosphor-special');
      
      // Reset CRT effects to default
      root.style.removeProperty('--crt-scan-opacity');
      root.style.removeProperty('--crt-flicker-intensity');
      root.style.removeProperty('--crt-vignette-opacity');
      root.style.removeProperty('--crt-glow-intensity');
      root.style.removeProperty('--crt-noise-opacity');
      root.style.removeProperty('--crt-curvature');
      root.style.removeProperty('--crt-gradient-opacity');
      break;
      
    case 'no-effects':
      // Disable CRT effects
      root.style.setProperty('--crt-scan-opacity', '0');
      root.style.setProperty('--crt-flicker-intensity', '0');
      root.style.setProperty('--crt-vignette-opacity', '0');
      root.style.setProperty('--crt-glow-intensity', '0');
      root.style.setProperty('--crt-noise-opacity', '0');
      root.style.setProperty('--crt-curvature', '0');
      root.style.setProperty('--crt-gradient-opacity', '0');
      break;
      
    case 'high-contrast':
      // High contrast black and white theme
      root.style.setProperty('--phosphor-primary', '#ffffff');
      root.style.setProperty('--phosphor-secondary', '#cccccc');
      root.style.setProperty('--phosphor-bg', '#000000');
      root.style.setProperty('--phosphor-panel-bg', '#111111');
      root.style.setProperty('--phosphor-border', '#ffffff');
      root.style.setProperty('--phosphor-text', '#ffffff');
      root.style.setProperty('--phosphor-glow', '#ffffff');
      
      // Map colors in high contrast
      root.style.setProperty('--phosphor-plains', '#ffffff');
      root.style.setProperty('--phosphor-forest', '#cccccc');
      root.style.setProperty('--phosphor-mountain', '#888888');
      root.style.setProperty('--phosphor-water', '#666666');
      root.style.setProperty('--phosphor-ruin', '#444444');
      root.style.setProperty('--phosphor-special', '#ffffff');
      
      // Disable CRT effects for accessibility
      root.style.setProperty('--crt-scan-opacity', '0');
      root.style.setProperty('--crt-flicker-intensity', '0');
      root.style.setProperty('--crt-vignette-opacity', '0');
      root.style.setProperty('--crt-glow-intensity', '0');
      root.style.setProperty('--crt-noise-opacity', '0');
      root.style.setProperty('--crt-curvature', '0');
      root.style.setProperty('--crt-gradient-opacity', '0');
      break;
  }
}

// Initialize theme on store creation
if (typeof window !== 'undefined') {
  // Get initial settings from localStorage or use defaults
  const stored = localStorage.getItem('tsp-settings');
  const initialMode = stored 
    ? JSON.parse(stored).state?.videoMode || 'standard'
    : 'standard';
  
  // Apply theme immediately
  applyTheme(initialMode);
}

// Export theme application function for external use
export { applyTheme };