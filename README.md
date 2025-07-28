# Frame Markercleaner 🎯

**One-Click YAML Marker Cleaner GUI** - Professional Dashboard für automatische Marker-Reparatur

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Electron](https://img.shields.io/badge/electron-27.0.0-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

## 🚀 Features

- **🎨 Professional Dashboard** - 5 farbkodierte Karten für Ergebnisse
- **📊 Live Progress-Tracking** - Animierte Progress-Bar mit Step-Updates  
- **🔄 Drag & Drop Interface** - Einfacher Ordner-Drop
- **⚡ One-Click Fixing** - Automatische YAML-Reparatur
- **📂 Smart Kategorisierung** - Clean, ID-Fix, Example-Fix, Structure-Fix, Review
- **🎯 Real-time Processing** - Echte YAML-Analyse und Reparatur

## 📦 Installation

\`\`\`bash
# Repository klonen
git clone https://github.com/DYAI2025/Frame_cleaner.git
cd Frame_cleaner

# Dependencies installieren
npm install

# App starten
npm run dev
\`\`\`

## 🎯 Usage

1. **App starten** - `npm run dev`
2. **Ordner droppen** - YAML-Marker Ordner in die Drop-Zone ziehen
3. **"Analyse & Fix" klicken** - Automatische Verarbeitung startet
4. **Dashboard betrachten** - 5 Karten zeigen Ergebnisse
5. **Ordner öffnen** - Reparierte Dateien direkt öffnen

## 🏗️ Architektur

\`\`\`
Frame_markercleaner/
├── main.js                    # Electron Main Process
├── preload.js                 # IPC Bridge (sicher)
├── index.html                 # UI (Vanilla JS)
├── drag-drop.js              # Frontend Logic
├── simple-yaml-processor.js  # YAML Processing
└── package.json              # Dependencies
\`\`\`

## 🔧 Development Status

- ✅ **Iteration 0-5 COMPLETE** - UI, Progress, Dashboard
- 🔄 **Iteration 7 IN PROGRESS** - Python Marker-Cleaner Core
- ⏳ **Iteration 8-10 PLANNED** - Settings, Packaging, Testing

## 📊 Dashboard Features

- 🟢 **Clean** - Bereits korrekte Marker
- 🔵 **ID-Fix** - Automatische ID-Reparaturen  
- 🟠 **Example-Fix** - Beispiel-Korrekturen
- 🟣 **Structure-Fix** - YAML-Struktur-Reparaturen
- 🔴 **Review** - Manuelle Überprüfung erforderlich

## 🤝 Contributing

1. Fork das Repository
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Changes committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 License

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🎯 Roadmap

- [ ] **Python Marker-Cleaner Core** - Echte YAML-Reparatur
- [ ] **Settings UI** - Konfigurierbare Auto-Fix-Modi
- [ ] **Change-Viewer** - Diff-Anzeige für Reparaturen
- [ ] **Cross-Platform Builds** - macOS/Windows/Linux
- [ ] **Auto-Updater** - Automatische Updates

---

**Made with ❤️ by the Frame Team**
