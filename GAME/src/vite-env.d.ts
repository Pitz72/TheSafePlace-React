/// <reference types="vite/client" />

/** Game version, injected by Vite from package.json at build time. */
declare const __APP_VERSION__: string;

/** Bridge exposed by the Electron preload script (absent in the browser build). */
interface DesktopBridge {
    isDesktop: true;
    quit: () => void;
    isFullScreen: () => Promise<boolean>;
    setFullScreen: (value: boolean) => Promise<boolean>;
}

interface Window {
    tspDesktop?: DesktopBridge;
}
