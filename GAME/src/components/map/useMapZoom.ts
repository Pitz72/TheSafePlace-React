import { useCallback, useState } from 'react';

/** Rows of tiles visible at each zoom level (the middle one is the default). */
export const ZOOM_LEVELS = [17, 25, 35];
const ZOOM_KEY = 'tspc_map_zoom';

const loadZoom = () => {
    try {
        const saved = Number(localStorage.getItem(ZOOM_KEY));
        return ZOOM_LEVELS.includes(saved) ? saved : ZOOM_LEVELS[1];
    } catch {
        return ZOOM_LEVELS[1];
    }
};

/**
 * Map zoom, remembered between sessions. `change(-1)` zooms in (fewer rows),
 * `change(1)` zooms out.
 */
export function useMapZoom() {
    const [zoom, setZoom] = useState(loadZoom);
    const change = useCallback((delta: number) => {
        setZoom(current => {
            const index = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, ZOOM_LEVELS.indexOf(current) + delta));
            const next = ZOOM_LEVELS[index];
            try { localStorage.setItem(ZOOM_KEY, String(next)); } catch { /* the zoom still applies */ }
            return next;
        });
    }, []);
    return {
        zoom,
        change,
        canZoomIn: zoom !== ZOOM_LEVELS[0],
        canZoomOut: zoom !== ZOOM_LEVELS[ZOOM_LEVELS.length - 1],
    };
}
