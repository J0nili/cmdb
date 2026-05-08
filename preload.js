'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Abrir archivo/carpeta con programa predeterminado del sistema
  openPath:        (p)    => ipcRenderer.invoke('open-path', p),
  // Abrir URL en browser externo
  openExternal:    (url)  => ipcRenderer.invoke('open-external', url),
  // Toggle fullscreen
  toggleFullscreen: ()    => ipcRenderer.invoke('toggle-fullscreen'),
  // Guardar archivo Excel en disco y devolver la ruta guardada
  saveFile:        (opts) => ipcRenderer.invoke('save-file', opts),
  // Diálogo guardar (solo ruta, sin escribir)
  saveDialog:      (opts) => ipcRenderer.invoke('save-dialog', opts),
  // Versión de la app
  getVersion:      ()     => ipcRenderer.invoke('get-version'),

  // Eventos del proceso principal → renderer
  onOpenFile:         (cb) => ipcRenderer.on('open-file',   (_, d) => cb(d)),
  onFullscreenChange: (cb) => ipcRenderer.on('fullscreen',  (_, v) => cb(v)),

  // Window controls (macOS-style traffic lights)
  winMinimize:    () => ipcRenderer.invoke('win-minimize'),
  winMaximize:    () => ipcRenderer.invoke('win-maximize'),
  winClose:       () => ipcRenderer.invoke('win-close'),
  winIsMaximized: () => ipcRenderer.invoke('win-is-maximized'),

  // Limpiar listeners
  off: (channel) => ipcRenderer.removeAllListeners(channel),
});
