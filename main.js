'use strict';

const { app, BrowserWindow, ipcMain, Menu, dialog, shell, session, protocol } = require('electron');
const path = require('path');
const fs   = require('fs');

// ── Registrar protocolo custom ANTES de app.whenReady ─────────────
// Necesario para que localStorage, IndexedDB, etc. funcionen
protocol.registerSchemesAsPrivileged([{
  scheme:     'app',
  privileges: {
    standard:        true,   // permite localStorage, sessionStorage, cookies
    secure:          true,   // trata como origen seguro (https-like)
    supportFetchAPI: true,   // fetch() desde la app
    corsEnabled:     true,   // CORS habilitado
    stream:          true,   // streaming responses
  }
}]);

// ── Instancia única — ANTES de whenReady ──────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

// ── Estado de ventana ─────────────────────────────────────────────
let win = null;
const STATE_PATH = path.join(app.getPath('userData'), 'winstate.json');

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { w: 1440, h: 880, maximized: false }; }
}
function saveState() {
  if (!win || win.isDestroyed()) return;
  try {
    const b = win.getBounds();
    fs.writeFileSync(STATE_PATH, JSON.stringify({
      w: b.width, h: b.height, x: b.x, y: b.y,
      maximized: win.isMaximized()
    }));
  } catch {}
}

// ── Crear ventana ─────────────────────────────────────────────────
function createWindow() {
  const s = loadState();

  win = new BrowserWindow({
    width:           s.w || 1440,
    height:          s.h || 880,
    x:               s.x,
    y:               s.y,
    minWidth:        960,
    minHeight:       620,
    title:           'CMDB',
    backgroundColor: '#1C1917',
    show:            false,
    autoHideMenuBar: true,
    frame:           false,        // frameless → custom macOS traffic lights
    titleBarStyle:   'hidden',     // needed on some platforms
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      nodeIntegration:  false,
      contextIsolation: true,
      sandbox:          false,
      webSecurity:      true,
    }
  });

  win.maximize();
  win.loadURL('app://cmdb/index.html');

  win.once('ready-to-show', () => { win.show(); win.focus(); });
  win.on('close', saveState);
  win.on('enter-full-screen', () => win.webContents.send('fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('fullscreen', false));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  buildMenu();
}

// ── Menú ──────────────────────────────────────────────────────────
function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Archivo', submenu: [
        { label: 'Abrir CMDB...', accelerator: 'CmdOrCtrl+O', click: openFile },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
    ]},
    { label: 'Ver', submenu: [
        { role: 'reload',           label: 'Recargar',         accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload',      label: 'Forzar recarga',   accelerator: 'CmdOrCtrl+Shift+R' },
        { type: 'separator' },
        { role: 'resetZoom',        label: 'Zoom 100%',        accelerator: 'CmdOrCtrl+0' },
        { role: 'zoomIn',           label: 'Acercar',          accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut',          label: 'Alejar',           accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa', accelerator: 'F11' }
    ]},
    { label: 'Ayuda', submenu: [
        { label: 'DevTools', accelerator: 'F12', click: () => win?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: 'Acerca de CMDB', click: () => dialog.showMessageBox(win, {
            type: 'info', title: 'CMDB',
            message: 'CMDB — Configuration Management Database',
            detail: `Versión: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
            buttons: ['OK']
        })}
    ]}
  ]));
}

// ── Abrir archivo desde menú ──────────────────────────────────────
async function openFile() {
  if (!win) return;
  const r = await dialog.showOpenDialog(win, {
    title: 'Abrir archivo CMDB',
    filters: [
      { name: 'Excel / CSV', extensions: ['xlsx','xls','xlsm','csv'] },
      { name: 'Todos',       extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  if (r.canceled || !r.filePaths.length) return;
  try {
    const buf = fs.readFileSync(r.filePaths[0]);
    win.webContents.send('open-file', {
      name:   path.basename(r.filePaths[0]),
      buffer: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    });
  } catch (e) { dialog.showErrorBox('Error', e.message); }
}

// ── IPC ───────────────────────────────────────────────────────────
ipcMain.handle('open-path',         async (_, p)   => { try { await shell.openPath(p); } catch {} });
ipcMain.handle('open-external',     async (_, url) => shell.openExternal(url));
ipcMain.handle('toggle-fullscreen',  ()            => win?.setFullScreen(!win.isFullScreen()));
ipcMain.handle('get-version',        ()            => app.getVersion());
ipcMain.handle('save-dialog', async (_, { name, filters }) => {
  if (!win) return null;
  const r = await dialog.showSaveDialog(win, { defaultPath: name, filters: filters || [{ name: 'Todos', extensions: ['*'] }] });
  return r.canceled ? null : r.filePath;
});
// Window control IPC (used by custom macOS traffic lights)
ipcMain.handle('win-minimize',  () => win?.minimize());
ipcMain.handle('win-maximize',  () => { if(!win) return; win.isMaximized() ? win.unmaximize() : win.maximize(); });
ipcMain.handle('win-close',     () => { saveState(); win?.close(); });
ipcMain.handle('win-is-maximized', () => win?.isMaximized() ?? false);

ipcMain.handle('save-file', async (_, { name, arrayBuffer, filters }) => {
  if (!win) return null;
  const r = await dialog.showSaveDialog(win, {
    defaultPath: name,
    filters: filters || [{ name: 'Excel', extensions: ['xlsx'] }, { name: 'Todos', extensions: ['*'] }]
  });
  if (r.canceled || !r.filePath) return null;
  try {
    fs.writeFileSync(r.filePath, Buffer.from(arrayBuffer));
    return r.filePath;
  } catch(e) {
    dialog.showErrorBox('Error al guardar', e.message);
    return null;
  }
});

// ── Protocolo app:// — mapea a __dirname ──────────────────────────
// Registrado ANTES de whenReady con registerSchemesAsPrivileged
// Esto permite localStorage, IndexedDB sin restricciones de file://
app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const url   = new URL(request.url);
    const rel   = url.pathname.replace(/^\//, '');
    const fpath = path.join(__dirname, rel);

    if (!fpath.startsWith(__dirname)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const data = fs.readFileSync(fpath);
      const ext  = path.extname(fpath).toLowerCase();
      const mime = {
        '.html': 'text/html', '.js': 'application/javascript',
        '.css':  'text/css',  '.json': 'application/json',
        '.woff2':'font/woff2', '.woff': 'font/woff',
        '.ttf':  'font/ttf',  '.png': 'image/png',
        '.svg':  'image/svg+xml', '.ico': 'image/x-icon',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }[ext] || 'application/octet-stream';
      return new Response(data, { headers: { 'Content-Type': mime } });
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  });

  // Bloquear Google Fonts si hay fuentes locales
  const fontDir = path.join(__dirname, 'fonts');
  const hasLocalFonts = fs.existsSync(fontDir) &&
    fs.readdirSync(fontDir).some(f => f.endsWith('.woff2'));
  if (hasLocalFonts) {
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*'] },
      (_, cb) => cb({ cancel: true })
    );
  }

  createWindow();
});

app.on('window-all-closed', () => app.quit());
app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});
