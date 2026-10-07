// Electron main process for The Safe Place.
//
// The game is a pure Vite/React SPA that loads its data with fetch('data/...').
// Chromium blocks fetch() of file:// URLs, so we can't just loadFile('index.html').
// Instead we serve the built `dist/` over a custom, privileged `app://` scheme:
// index.html lives at app://bundle/index.html and every relative fetch resolves
// under app://bundle/. A privileged+secure scheme also gives the renderer a
// stable origin so localStorage (the save system) persists across launches.

const { app, BrowserWindow, protocol, shell, Menu, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const DIST = path.join(__dirname, '..', 'dist');
const isDev = process.argv.includes('--dev');
const DEV_URL = 'http://localhost:3000';

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json',
  '.txt': 'text/plain',
};

// The bundled game needs nothing from the outside world: scripts, styles,
// fonts and data come from app://bundle, the map tileset is a data: SVG.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

// Must run before app is ready.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);

function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    const { pathname } = new URL(request.url);
    let rel = decodeURIComponent(pathname);
    if (rel === '/' || rel === '') rel = '/index.html';

    const filePath = path.normalize(path.join(DIST, rel));
    // Never serve anything outside the bundled dist directory (a plain prefix
    // check would also accept a sibling such as "dist-evil").
    if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      // fs.readFile is asar-transparent, so this works whether or not the app
      // is packed into app.asar.
      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const headers = { 'content-type': MIME[ext] || 'application/octet-stream' };
      if (ext === '.html') headers['content-security-policy'] = CONTENT_SECURITY_POLICY;
      return new Response(data, { headers });
    } catch {
      // SPA fallback: unknown non-file paths return index.html.
      if (!path.extname(filePath)) {
        try {
          const html = await fs.promises.readFile(path.join(DIST, 'index.html'));
          return new Response(html, {
            headers: { 'content-type': 'text/html', 'content-security-policy': CONTENT_SECURITY_POLICY },
          });
        } catch {
          /* fall through */
        }
      }
      return new Response('Not found', { status: 404 });
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    fullscreen: true,        // avvio in fullscreen totale
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'The Safe Place',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Garantisce il fullscreen anche se la piattaforma ignora l'opzione iniziale.
  win.once('ready-to-show', () => {
    win.setFullScreen(true);
    win.show();
  });

  // External http(s) links open in the system browser; the app never opens
  // windows of its own.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  // The page never navigates away from the bundled game.
  win.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? url.startsWith(DEV_URL) : url.startsWith('app://bundle/');
    if (!allowed) {
      event.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  if (isDev) {
    win.loadURL(DEV_URL);
    win.webContents.openDevTools();
  } else {
    win.loadURL('app://bundle/index.html');
  }
}

ipcMain.on('tsp:quit', () => app.quit());
ipcMain.handle('tsp:is-fullscreen', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return win ? win.isFullScreen() : false;
});
ipcMain.handle('tsp:set-fullscreen', (event, value) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return false;
  win.setFullScreen(Boolean(value));
  return win.isFullScreen();
});

app.whenReady().then(() => {
  // No menu bar; on macOS keep the app menu so Cmd+Q / Cmd+H keep working.
  Menu.setApplicationMenu(process.platform === 'darwin'
    ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }])
    : null);
  if (!isDev) registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
