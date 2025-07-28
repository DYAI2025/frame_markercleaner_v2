const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

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
    console.log('🔄 Main: Starting Python YAML processing...');
    
    // Progress-Updates senden
    event.sender.send('progress', {
      step: 'scanning',
      message: 'Starting Python marker cleaner...',
      percent: 10
    });
    
    // Python-Integration verwenden
    const results = await runPythonMarkerCleaner(folderPath, event);
    
    // Finish-Event mit echten Python-Daten
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
    
    // Sofortige Antwort
    return {
      success: true,
      message: 'Python YAML processing completed',
      jobId: 'python-job-' + Date.now()
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

// Python Marker Cleaner ausführen
async function runPythonMarkerCleaner(folderPath, event) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'marker_cleaner_integration.py'),
      folderPath
    ]);
    
    let outputData = '';
    let errorData = '';
    
    // Stdout sammeln
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });
    
    // Stderr für Progress-Updates nutzen
    pythonProcess.stderr.on('data', (data) => {
      const stderrLines = data.toString().split('\n');
      for (const line of stderrLines) {
        if (line.startsWith('PROGRESS:')) {
          try {
            const progressData = JSON.parse(line.substring(9));
            event.sender.send('progress', {
              step: 'processing',
              message: progressData.message,
              percent: progressData.percent
            });
          } catch (e) {
            console.log('Progress parse error:', e);
          }
        } else if (line.trim()) {
          errorData += line + '\n';
        }
      }
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        return;
      }
      
      try {
        const result = JSON.parse(outputData);
        if (result.success) {
          resolve(result.results);
        } else {
          reject(new Error(result.error));
        }
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

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
