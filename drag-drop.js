// drag-drop.js - Drag & Drop + IPC Funktionalität

console.log('🔧 Drag & Drop + IPC Script loaded');

// DOM Elemente
const dropZone = document.getElementById('dropZone');
const statusText = document.getElementById('statusText');
const browseBtn = document.getElementById('browseBtn');
const dashboard = document.getElementById('dashboard');

// Progress-Elemente
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressStep = document.getElementById('progressStep');

// Dashboard-Elemente
const totalProcessedEl = document.getElementById('totalProcessed');
const processingTimeEl = document.getElementById('processingTime');
const cleanCountEl = document.getElementById('cleanCount');
const cleanPercentEl = document.getElementById('cleanPercent');
const idFixCountEl = document.getElementById('idFixCount');
const idFixPercentEl = document.getElementById('idFixPercent');
const exampleFixCountEl = document.getElementById('exampleFixCount');
const exampleFixPercentEl = document.getElementById('exampleFixPercent');
const structureFixCountEl = document.getElementById('structureFixCount');
const structureFixPercentEl = document.getElementById('structureFixPercent');
const reviewCountEl = document.getElementById('reviewCount');
const reviewPercentEl = document.getElementById('reviewPercent');

// Progress anzeigen
function showProgress() {
    progressContainer.classList.add('active');
    dropZone.style.opacity = '0.5';
    console.log('📊 Progress container shown');
}

// Progress verstecken
function hideProgress() {
    progressContainer.classList.remove('active');
    dropZone.style.opacity = '1';
    resetProgress();
    console.log('📊 Progress container hidden');
}

// Dashboard anzeigen
function showDashboard(data) {
    console.log('📈 Showing dashboard with data:', data);
    
    // Dashboard-Daten aktualisieren
    updateDashboardData(data);
    
    // Dashboard einblenden
    dashboard.classList.add('active');
    
    // Drop-Zone und andere Elemente ausblenden
    dropZone.style.display = 'none';
    document.getElementById('analyzeBtn')?.remove();
    
    console.log('✨ Dashboard displayed');
}

// Dashboard verstecken
function hideDashboard() {
    dashboard.classList.remove('active');
    dropZone.style.display = 'block';
    console.log('📈 Dashboard hidden');
}

// Dashboard-Daten aktualisieren
function updateDashboardData(data) {
    const summary = data.summary;
    const total = summary.total;
    
    // Zusammenfassung
    totalProcessedEl.textContent = total;
    processingTimeEl.textContent = `${Math.round((Date.now() - startTime) / 1000)}s`;
    
    // Prozentberechnung
    const calculatePercent = (count) => total > 0 ? Math.round((count / total) * 100) : 0;
    
    // Clean Card
    cleanCountEl.textContent = summary.clean;
    cleanPercentEl.textContent = `${calculatePercent(summary.clean)}% der Marker`;
    
    // ID Fix Card
    idFixCountEl.textContent = summary.fixId;
    idFixPercentEl.textContent = `${calculatePercent(summary.fixId)}% der Marker`;
    
    // Example Fix Card
    exampleFixCountEl.textContent = summary.fixExample;
    exampleFixPercentEl.textContent = `${calculatePercent(summary.fixExample)}% der Marker`;
    
    // Structure Fix Card
    structureFixCountEl.textContent = summary.fixStructure;
    structureFixPercentEl.textContent = `${calculatePercent(summary.fixStructure)}% der Marker`;
    
    // Review Card
    reviewCountEl.textContent = summary.review;
    reviewPercentEl.textContent = `${calculatePercent(summary.review)}% der Marker`;
    
    // Karten animieren basierend auf Werten
    animateCards(summary);
}

// Karten-Animationen
function animateCards(summary) {
    // Highlight-Effekt für Karten mit Werten > 0
    const cards = [
        { element: document.querySelector('.card-clean'), count: summary.clean },
        { element: document.querySelector('.card-fix-id'), count: summary.fixId },
        { element: document.querySelector('.card-fix-example'), count: summary.fixExample },
        { element: document.querySelector('.card-fix-structure'), count: summary.fixStructure },
        { element: document.querySelector('.card-review'), count: summary.review }
    ];
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            if (card.count > 0) {
                card.element.style.animation = 'slideInUp 0.5s ease-out';
                // Kurzer Pulse-Effekt für wichtige Karten
                if (card.count > summary.total * 0.1) {
                    setTimeout(() => {
                        card.element.classList.add('pulse-animation');
                        setTimeout(() => card.element.classList.remove('pulse-animation'), 3000);
                    }, 200);
                }
            } else {
                card.element.style.opacity = '0.6';
            }
        }, index * 100);
    });
}

// Progress zurücksetzten
function resetProgress() {
    updateProgress(0, 'Bereit...', 'init');
}

// Progress aktualisieren
function updateProgress(percent, message, step = '') {
    // Sicherstellen dass percent zwischen 0 und 100 ist
    percent = Math.max(0, Math.min(100, percent));
    
    // Visuelle Updates
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${Math.round(percent)}%`;
    progressStep.textContent = message;
    
    // Step-spezifische Icons
    const stepIcons = {
        'init': '🔄',
        'scanning': '🔍',
        'validating': '✅',
        'fixing': '🔧',
        'complete': '🎉'
    };
    
    const icon = stepIcons[step] || '🔄';
    progressStep.textContent = `${icon} ${message}`;
    
    console.log(`📊 Progress: ${percent}% - ${message}`);
}

// Status-Updates
function updateStatus(message, type = 'info') {
    statusText.textContent = message;
    console.log(`📝 Status: ${message}`);
    
    // Visuelles Feedback
    const statusArea = document.getElementById('statusArea');
    statusArea.style.background = type === 'success' 
        ? 'rgba(76, 175, 80, 0.3)' 
        : type === 'error' 
        ? 'rgba(244, 67, 54, 0.3)'
        : type === 'processing'
        ? 'rgba(255, 193, 7, 0.3)'
        : 'rgba(255,255,255,0.2)';
}

// Globaler State
let currentFolderPath = null;
let isProcessing = false;
let startTime = null;

// Analyse-Button erstellen und anzeigen
function showAnalyzeButton(folderPath) {
    // Prüfen ob Button bereits existiert
    let analyzeBtn = document.getElementById('analyzeBtn');
    
    if (!analyzeBtn) {
        // Button erstellen
        analyzeBtn = document.createElement('button');
        analyzeBtn.id = 'analyzeBtn';
        analyzeBtn.innerHTML = '🔍 Analyse & Fix';
        analyzeBtn.style.cssText = `
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 15px 30px;
            font-size: 1.2em;
            border-radius: 8px;
            cursor: pointer;
            margin: 20px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        
        // Hover-Effekt
        analyzeBtn.addEventListener('mouseenter', () => {
            if (!isProcessing) {
                analyzeBtn.style.transform = 'translateY(-2px)';
                analyzeBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
            }
        });
        
        analyzeBtn.addEventListener('mouseleave', () => {
            analyzeBtn.style.transform = 'translateY(0)';
            analyzeBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        });
        
        // Click-Handler
        analyzeBtn.addEventListener('click', () => startAnalysis(folderPath));
        
        // Button nach Drop-Zone einfügen
        dropZone.parentNode.insertBefore(analyzeBtn, dropZone.nextSibling);
    }
    
    // Button aktivieren
    analyzeBtn.style.display = 'block';
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '🔍 Analyse & Fix';
}

// Analyse-Button verstecken
function hideAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.style.display = 'none';
    }
}

// Analyse starten
async function startAnalysis(folderPath) {
    console.log('🚀 Starting analysis for:', folderPath);
    
    if (isProcessing) {
        console.log('⏳ Analysis already in progress');
        return;
    }
    
    isProcessing = true;
    startTime = Date.now(); // Zeit für Dashboard
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    // Button deaktivieren
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '⏳ Analysiere...';
    }
    
    // Progress anzeigen
    showProgress();
    updateProgress(0, 'Analyse wird gestartet...', 'init');
    
    try {
        updateStatus('🔄 Starte Analyse...', 'processing');
        
        // IPC-Call an Main-Process
        const result = await window.electronAPI.startClean(folderPath, {
            fixId: true,
            fixStructure: true,
            fixExamples: true
        });
        
        console.log('📤 IPC Response:', result);
        
        if (result.success) {
            updateStatus(`✅ Analyse gestartet! Job-ID: ${result.jobId}`, 'processing');
            updateProgress(10, 'Verbindung hergestellt...', 'init');
        } else {
            throw new Error(result.error || 'Unbekannter Fehler');
        }
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        updateStatus(`❌ Fehler: ${error.message}`, 'error');
        
        // Progress verstecken bei Fehler
        hideProgress();
        
        isProcessing = false;
        startTime = null;
        
        // Button wieder aktivieren
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '🔍 Analyse & Fix';
        }
    }
}

// Pfad-Verarbeitung
function handleDroppedPath(path) {
    console.log('📂 Dropped path:', path);
    
    // Prüfen ob es ein Ordner ist
    if (path.endsWith('/') || !path.includes('.')) {
        currentFolderPath = path;
        updateStatus(`✅ Ordner erkannt: ${path}`, 'success');
        showAnalyzeButton(path);
        console.log('✅ Folder detected successfully!');
    } else {
        currentFolderPath = null;
        hideAnalyzeButton();
        updateStatus(`⚠️ Datei erkannt: ${path} (Ordner erwartet)`, 'error');
        console.log('⚠️ File detected, but folder expected');
    }
}

// Progress-Updates empfangen
window.electronAPI.onProgress((data) => {
    console.log('📊 Progress update:', data);
    
    // Status aktualisieren
    updateStatus(`${data.message} (${data.percent}%)`, 'processing');
    
    // Progress-Bar aktualisieren
    const stepMap = {
        'scanning': 'scanning',
        'validating': 'validating', 
        'fixing': 'fixing'
    };
    
    const step = stepMap[data.step] || 'init';
    updateProgress(data.percent, data.message, step);
});

// Finish-Event empfangen
window.electronAPI.onFinish((data) => {
    console.log('✅ Process finished:', data);
    
    // Final Progress
    updateProgress(100, 'Verarbeitung abgeschlossen!', 'complete');
    
    // Kurz warten, dann Dashboard zeigen
    setTimeout(() => {
        hideProgress();
        showDashboard(data);
        isProcessing = false;
    }, 1500);
});

// Error-Event empfangen
window.electronAPI.onError((data) => {
    console.error('❌ Process error:', data);
    
    // Progress verstecken
    hideProgress();
    isProcessing = false;
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🔍 Analyse & Fix';
    }
    
    updateStatus(`❌ Fehler: ${data.message}`, 'error');
});

// Drag & Drop Event Handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
    updateStatus('📥 Ordner loslassen zum Laden...');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    if (!currentFolderPath) {
        updateStatus('Bereit für Ordner-Drop! Ziehe einen Ordner hierher...');
    }
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    console.log('🎯 Drop event triggered!');
    
    // Files aus dem Drop-Event holen
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
        updateStatus('❌ Keine Dateien erkannt', 'error');
        return;
    }
    
    // Ersten Eintrag nehmen (sollte ein Ordner sein)
    const firstFile = files[0];
    const path = firstFile.path;
    
    console.log('📁 Processing dropped item:', {
        name: firstFile.name,
        path: path,
        type: firstFile.type,
        size: firstFile.size
    });
    
    handleDroppedPath(path);
});

// Browse Button (für später - Iteration 2)
browseBtn.addEventListener('click', () => {
    updateStatus('🔍 Browse-Funktion kommt in Iteration 3...', 'info');
    console.log('🔍 Browse button clicked (placeholder)');
});

// Click auf Drop-Zone = Browse
dropZone.addEventListener('click', (e) => {
    if (e.target !== browseBtn) {
        browseBtn.click();
    }
});

// Initialisierung
updateStatus('Bereit für Ordner-Drop! Ziehe einen Ordner hierher...');
console.log('✅ Drag & Drop + IPC system initialized');

// App-Info laden (Test)
window.electronAPI.getAppInfo().then(info => {
    console.log('ℹ️ App Info:', info);
});

// Dashboard-Button-Funktionen
function openFolder(category) {
    console.log(`📂 Opening folder for category: ${category}`);
    if (currentFolderPath) {
        // Spezifischen Unterordner öffnen basierend auf Kategorie
        const folderPath = `${currentFolderPath}/${category}`;
        window.electronAPI.openFolder(folderPath).then(result => {
            if (result.success) {
                console.log('✅ Folder opened successfully');
            } else {
                console.error('❌ Error opening folder:', result.error);
                // Fallback: Hauptordner öffnen
                window.electronAPI.openFolder(currentFolderPath);
            }
        });
    }
}

function viewChanges(type) {
    console.log(`🔍 Viewing changes for type: ${type}`);
    // TODO: Implementierung für Change-Viewer
    alert(`🗺️ Change-Viewer für ${type} wird in einer späteren Iteration implementiert!`);
}

function showIssues() {
    console.log('⚠️ Showing issues that need review');
    // TODO: Implementierung für Issue-Viewer
    alert('🗺️ Issue-Viewer wird in einer späteren Iteration implementiert!');
}

function openReport() {
    console.log('📄 Opening full report');
    // TODO: Implementierung für Report-Viewer
    alert('🗺️ Vollständiger Report wird in einer späteren Iteration implementiert!');
}

function runAgain() {
    console.log('🔄 Running analysis again');
    
    // Dashboard verstecken
    hideDashboard();
    
    // State zurücksetzen
    currentFolderPath = null;
    isProcessing = false;
    startTime = null;
    
    // Drop-Zone wieder anzeigen
    dropZone.style.display = 'block';
    
    // Status zurücksetzen
    updateStatus('Bereit für Ordner-Drop! Ziehe einen Ordner hierher...');
    
    console.log('✨ Ready for new analysis');
}
