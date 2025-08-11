const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Audio processing
  processAudio: (filePath) => ipcRenderer.invoke('process-audio', filePath),
  searchSimilar: (features, database) => ipcRenderer.invoke('search-similar', features, database),
  
  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  
  // Events
  onAudioProcessed: (callback) => ipcRenderer.on('audio-processed', callback),
  onSearchComplete: (callback) => ipcRenderer.on('search-complete', callback),
  onError: (callback) => ipcRenderer.on('error', callback)
});