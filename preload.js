// preload.js - Sichere IPC-Bridge zwischen Renderer und Main-Process

const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Preload script loading...');

// Sichere API für Renderer-Process
contextBridge.exposeInMainWorld('electronAPI', {
  // Marker-Cleaning starten
  startClean: (folderPath, options = {}) => {
    console.log('📤 Sending start-clean to main process:', { folderPath, options });
    return ipcRenderer.invoke('start-clean', { folderPath, options });
  },
  
  // Progress-Updates empfangen
  onProgress: (callback) => {
    console.log('👂 Registering progress listener');
    ipcRenderer.on('progress', (event, data) => {
      console.log('📊 Progress received:', data);
      callback(data);
    });
  },
  
  // Finish-Event empfangen
  onFinish: (callback) => {
    console.log('👂 Registering finish listener');
    ipcRenderer.on('finish', (event, data) => {
      console.log('✅ Finish received:', data);
      callback(data);
    });
  },
  
  // Error-Event empfangen
  onError: (callback) => {
    console.log('👂 Registering error listener');
    ipcRenderer.on('error', (event, data) => {
      console.log('❌ Error received:', data);
      callback(data);
    });
  },
  
  // Ordner im OS öffnen
  openFolder: (folderPath) => {
    console.log('📂 Opening folder:', folderPath);
    return ipcRenderer.invoke('open-folder', folderPath);
  },
  
  // App-Informationen
  getAppInfo: () => {
    return ipcRenderer.invoke('get-app-info');
  }
});

console.log('✅ Preload script loaded - electronAPI exposed');
