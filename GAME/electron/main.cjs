// Electron main process for The Safe Place.
//
// The game is a pure Vite/React SPA that loads its data with fetch('data/...').
// Chromium blocks fetch() of file:// URLs, so we can't just loadFile('index.html').
// Instead we serve the built `dist/` over a custom, privileged `app://` scheme:
// index.html lives at app://bundle/index.html and every relative fetch resolves
// under app://bundle/. A privileged+secure scheme also gives the renderer a
// stable origin so localStorage (the save system) persists across launches.

const { app, BrowserWindow, protocol, shell, Menu } = require('electron');
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
    // Never serve anything outside the bundled dist directory.
    if (!filePath.startsWith(DIST)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      // fs.readFile is asar-transparent, so this works whether or not the app
      // is packed into app.asar.
      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      return new Response(data, {
        headers: { 'content-type': MIME[ext] || 'application/octet-stream' },
      });
    } catch {
      // SPA fallback: unknown non-file paths return index.html.
      if (!path.extname(filePath)) {
        try {
          const html = await fs.promises.readFile(path.join(DIST, 'index.html'));
          return new Response(html, { headers: { 'content-type': 'text/html' } });
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
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'The Safe Place',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  // External http(s) links open in the system browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    win.loadURL(DEV_URL);
    win.webContents.openDevTools();
  } else {
    win.loadURL('app://bundle/index.html');
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null); // no default menu bar
  if (!isDev) registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
