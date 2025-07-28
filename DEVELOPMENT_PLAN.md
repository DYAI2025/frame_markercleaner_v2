# Frame Markercleaner - Agiler Entwicklungsplan

## Gesamtziel
**One-Click Marker-Cleaner GUI**: Drag & Drop → Button → Fertige, sortierte Marker

## Iterativer Vorgehensplan (Klein → Groß)

### Iteration 0: Electron-Grundgerüst (Fundament)
**Ziel**: Minimale Electron-App die startet
**Test-Kriterium**: App öffnet sich, zeigt "Hello World"

1. package.json mit Electron-Dependencies erstellen
2. main.js (Hauptprozess) - minimales Fenster
3. index.html - leere Seite
4. Erste App starten und testen
5. **STOPP & TEST**: App startet ohne Fehler

### Iteration 1: Drag & Drop Basis
**Ziel**: Dateien/Ordner können erkannt werden
**Test-Kriterium**: Drag & Drop zeigt Pfad in Konsole

1. HTML Drag-Drop Zone erstellen
2. JavaScript Event-Handler für Drop
3. Pfad-Erkennung implementieren
4. Konsolen-Ausgabe des Pfads
5. **STOPP & TEST**: Drop funktioniert, Pfad wird angezeigt

### Iteration 2: IPC-Kommunikation (Frontend ↔ Backend)
**Ziel**: Sichere Kommunikation zwischen Renderer und Main
**Test-Kriterium**: Button-Klick sendet Daten an Main-Process

1. preload.js für contextBridge erstellen
2. IPC-Channel 'start-clean' implementieren
3. Button im Frontend hinzufügen
4. Main-Process empfängt und bestätigt
5. **STOPP & TEST**: IPC funktioniert bidirektional

### Iteration 3: Python-Core Integration (Mock)
**Ziel**: Python-Script wird vom Main-Process aufgerufen
**Test-Kriterium**: Dummy-Python-Script läuft und gibt Ergebnis zurück

1. Einfaches Python-Script erstellen (marker_cleaner_mock.py)
2. Node.js child_process für Python-Aufruf
3. JSON-Kommunikation zwischen Node und Python
4. Error-Handling für Python-Fehler
5. **STOPP & TEST**: Python wird erfolgreich aufgerufen

### Iteration 4: Progress-Tracking
**Ziel**: Live-Updates während der Verarbeitung
**Test-Kriterium**: Progress-Bar zeigt echten Fortschritt

1. Progress-Event von Python an Node
2. IPC-Channel 'progress' implementieren
3. Progress-Bar im Frontend
4. Live-Updates der UI
5. **STOPP & TEST**: Progress wird korrekt angezeigt

### Iteration 5: React-Migration
**Ziel**: Von Vanilla JS zu React wechseln
**Test-Kriterium**: Gleiche Funktionalität in React

1. React + TypeScript Setup
2. Dropzone-Komponente erstellen
3. Progress-Komponente erstellen
4. State-Management implementieren
5. **STOPP & TEST**: Alle bisherigen Features funktionieren

### Iteration 6: Result-Dashboard
**Ziel**: Ergebnisse werden in Karten angezeigt
**Test-Kriterium**: 5 Karten zeigen Mock-Daten korrekt

1. Dashboard-Layout erstellen
2. 5 Status-Karten implementieren
3. Mock-Daten für Ergebnisse
4. "Open Folder"-Buttons
5. **STOPP & TEST**: Dashboard zeigt Daten korrekt

### Iteration 7: Echter Python Marker-Cleaner
**Ziel**: Echte YAML-Verarbeitung
**Test-Kriterium**: Echte YAML-Dateien werden verarbeitet

1. Python marker-cleaner-core implementieren
2. YAML-Parsing und Validation
3. Auto-Fix-Logik für ID/Structure/Examples
4. Kategorisierung der Ergebnisse
5. **STOPP & TEST**: Echte Marker werden verarbeitet

### Iteration 8: Settings & Config
**Ziel**: Benutzer kann Einstellungen anpassen
**Test-Kriterium**: Settings werden gespeichert und geladen

1. Settings-Drawer UI erstellen
2. Config-JSON persistieren
3. Settings an Python-Core weiterleiten
4. Dry-Run Mode implementieren
5. **STOPP & TEST**: Settings funktionieren

### Iteration 9: Packaging & Build
**Ziel**: Ausführbare App für alle Plattformen
**Test-Kriterium**: .dmg/.exe/.AppImage funktionieren

1. electron-builder konfigurieren
2. Python-Dependencies bundeln
3. Icons und App-Metadaten
4. Build-Scripts erstellen
5. **STOPP & TEST**: Installer funktioniert

### Iteration 10: Polish & E2E Tests
**Ziel**: Production-ready App
**Test-Kriterium**: Alle Akzeptanztests bestehen

1. UI-Polish (Animationen, Toasts)
2. Error-Handling verbessern
3. E2E-Tests mit Cypress
4. Performance-Optimierung
5. **STOPP & TEST**: Alles funktioniert smooth

## Agile Prinzipien
- Nach jeder Iteration: **STOPP & TEST**
- Jede Iteration ist funktionsfähig
- Bei Problemen: Zurück zur letzten funktionierenden Version
- Kleine, testbare Schritte
- Continuous Integration

## Nächster Schritt
**Iteration 0**: Electron-Grundgerüst erstellen
