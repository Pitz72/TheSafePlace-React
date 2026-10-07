/**
 * Window controls that work both in the desktop app (through the preload
 * bridge, window.tspDesktop) and in a browser (Fullscreen API).
 */
export const isDesktopApp = (): boolean => typeof window !== 'undefined' && Boolean(window.tspDesktop?.isDesktop);

export async function isFullScreen(): Promise<boolean> {
    if (isDesktopApp()) return window.tspDesktop!.isFullScreen();
    return Boolean(document.fullscreenElement);
}

/** Resolves with the resulting state (the browser may refuse the request). */
export async function setFullScreen(value: boolean): Promise<boolean> {
    if (isDesktopApp()) return window.tspDesktop!.setFullScreen(value);
    try {
        if (value && !document.fullscreenElement) await document.documentElement.requestFullscreen();
        if (!value && document.fullscreenElement) await document.exitFullscreen();
    } catch (error) {
        console.warn('Fullscreen request refused:', error);
    }
    return Boolean(document.fullscreenElement);
}

/** Closes the game. Returns false when the page can't close itself (browser tab). */
export function quitGame(): boolean {
    if (isDesktopApp()) {
        window.tspDesktop!.quit();
        return true;
    }
    window.close();
    return window.closed;
}
