// Exposes a minimal, explicit API to the renderer. Nothing else from Node or
// Electron is reachable from the game page.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tspDesktop', {
  isDesktop: true,
  quit: () => ipcRenderer.send('tsp:quit'),
  isFullScreen: () => ipcRenderer.invoke('tsp:is-fullscreen'),
  setFullScreen: (value) => ipcRenderer.invoke('tsp:set-fullscreen', Boolean(value)),
});
