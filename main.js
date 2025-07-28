const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

// Hauptfenster-Referenz behalten
let mainWindow;

function createWindow() {
  // Browser-Fenster erstellen
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Frame Markercleaner',
    show: false // Erst zeigen wenn bereit
  });

  // index.html laden
  mainWindow.loadFile('index.html');

  // Fenster zeigen wenn bereit
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('🚀 Frame Markercleaner started successfully!');
  });

  // DevTools in Development-Modus öffnen
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Fenster geschlossen
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ist bereit
app.whenReady().then(createWindow);

// Alle Fenster geschlossen
app.on('window-all-closed', () => {
  // Auf macOS apps bleiben aktiv bis explizit beendet
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// App aktiviert (macOS)
app.on('activate', () => {
  // Fenster neu erstellen wenn keines vorhanden
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC-Handler für Marker-Cleaning
ipcMain.handle('start-clean', async (event, { folderPath, options }) => {
  console.log('🎯 Main: start-clean received:', { folderPath, options });
  
  try {
    console.log('🔄 Main: Starting REAL YAML processing...');
    
    // Progress-Updates senden
    event.sender.send('progress', {
      step: 'scanning',
      message: 'Scanning YAML files...',
      percent: 25
    });
    
    // Echte YAML-Verarbeitung
    const SimpleYAMLProcessor = require('./simple-yaml-processor');
    const processor = new SimpleYAMLProcessor(folderPath);
    
    setTimeout(() => {
      event.sender.send('progress', {
        step: 'validating',
        message: 'Validating markers...',
        percent: 50
      });
    }, 500);
    
    // Echte Verarbeitung
    const results = await processor.processFolder();
    
    setTimeout(() => {
      event.sender.send('progress', {
        step: 'fixing',
        message: 'Categorizing results...',
        percent: 75
      });
    }, 1000);
    
    // Finish-Event mit echten Daten
    setTimeout(() => {
      event.sender.send('finish', {
        summary: {
          total: results.total,
          clean: results.clean,
          fixId: results.fixId,
          fixExample: results.fixExample,
          fixStructure: results.fixStructure,
          review: results.review
        },
        folderPath: folderPath,
        reportPath: path.join(folderPath, 'marker-report.md'),
        details: results.files
      });
    }, 1500);
    
    // Sofortige Antwort
    return {
      success: true,
      message: 'Real YAML processing started',
      jobId: 'real-job-' + Date.now()
    };
    
  } catch (error) {
    console.error('❌ Main: Error in start-clean:', error);
    event.sender.send('error', {
      message: error.message,
      details: error.stack
    });
    
    return {
      success: false,
      error: error.message
    };
  }
});

// Ordner öffnen
ipcMain.handle('open-folder', async (event, folderPath) => {
  console.log('📂 Main: Opening folder:', folderPath);
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    console.error('❌ Main: Error opening folder:', error);
    return { success: false, error: error.message };
  }
});

// App-Info
ipcMain.handle('get-app-info', () => {
  return {
    version: '0.1.0',
    iteration: 2,
    name: 'Frame Markercleaner'
  };
});
