# WetterScoutAI 🌦️

Eine moderne Wetter-App mit React, Vite und Capacitor.

## Features

- 📍 GPS-basierte Standorterkennung
- 🌡️ Lokale Wettervorhersagen
- ⚠️ DWD Wetterwarnungen
- 📊 Wetter-Charts und Visualisierungen
- 🤖 KI-generierte Wetterberichte (verbessert und detaillierter)
- 🌧️ Niederschlagsradar
- 📱 Progressive Web App (PWA) und native Android App
- ⌚ **Wear OS Support** - Jetzt auch für Smartwatches verfügbar!

## Technologie-Stack

- **Frontend**: React 18.2, Vite 5.2
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.12
- **Icons**: Lucide React
- **Mobile**: Capacitor 8.0
- **Wetter-APIs**: Open-Meteo, Windy, DWD Brightsky

## Entwicklung

### Installation

```bash
npm install
```

### Development Server starten

```bash
npm run dev
```

Die App ist dann unter `http://localhost:5173` verfügbar.

### Production Build

```bash
npm run build
```

Die gebauten Dateien befinden sich im `dist/` Ordner.

## Android Studio Setup und App erstellen

**Neu:** Vollständige Schritt-für-Schritt Anleitung für Android Studio:
- 📱 [ANDROID_STUDIO_ANLEITUNG.md](./ANDROID_STUDIO_ANLEITUNG.md) - **Komplette Android Studio Setup-Anleitung (Deutsch)**
  - Installation und Voraussetzungen
  - Projekt in Android Studio öffnen
  - App auf Gerät/Emulator testen
  - Wear OS Informationen

### Android App Bundle (.aab) erstellen

Siehe detaillierte Anleitungen:
- 🇩🇪 [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) (Deutsch)
- 🇬🇧 [BUILD_AAB_GUIDE.md](./BUILD_AAB_GUIDE.md) (English)
- ✅ [AAB_CHECKLIST.md](./AAB_CHECKLIST.md) - Schritt-für-Schritt Checkliste
- 🔐 [android/KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md) - Keystore Konfiguration

### Quick Start (Automatisch)

```bash
# Alles automatisch vorbereiten
./prepare-aab.sh

# Oder mit npm script
npm run prepare:aab
```

### Quick Start (Manuell)

```bash
# 1. Dependencies installieren
npm install

# 2. Web-App bauen und mit Android synchronisieren
npm run android:sync

# 3. Android Studio öffnen
npm run android:open

# 4. In Android Studio: Build → Generate Signed Bundle / APK
```

## Verfügbare NPM Scripte

- `npm run dev` - Development Server starten
- `npm run build` - Production Build erstellen
- `npm run preview` - Production Build lokal testen
- `npm run prepare:aab` - Projekt für AAB-Build vorbereiten
- `npm run android:sync` - Web-App bauen und mit Android synchronisieren
- `npm run android:open` - Android Studio öffnen
- `npm run android:run` - App auf verbundenem Gerät ausführen
- `npm run build:wear` - Wear OS App bauen (inkl. Web-Build)

## Wear OS Support ⌚

Die App unterstützt jetzt Wear OS (Smartwatches)! Siehe [WEAR_OS_INTEGRATION.md](./WEAR_OS_INTEGRATION.md) für:
- Detaillierte Informationen zur Wear OS Integration
- Build-Anweisungen für die Wear OS Version
- Hinweise zur Play Store Veröffentlichung
- Zukünftige Erweiterungsmöglichkeiten

Wenn Sie ein AAB erstellen, wird automatisch auch die Wear OS Version eingeschlossen, und der Play Store zeigt die App sowohl für Smartphones als auch für Smartwatches an.

## Android Berechtigungen

Die App benötigt folgende Berechtigungen:
- `INTERNET` - Zugriff auf Wetter-APIs
- `ACCESS_FINE_LOCATION` - Genauer GPS-Standort
- `ACCESS_COARSE_LOCATION` - Ungefährer Standort

## Firebase/Benachrichtigungen

Die App enthält keine Firebase/FCM-Integration und keine lokalen Benachrichtigungen.

## Neue Funktionen

### Verbesserter KI-Bericht

Die KI-generierten Wetterberichte sind jetzt:
- Ausführlicher und detaillierter
- Natürlicher formuliert
- Mit mehr Kontext zu Temperaturverläufen
- Besser strukturiert für verschiedene Wetterbedingungen

## Datenschutz

Siehe [DATENSCHUTZ.md](./DATENSCHUTZ.md) für Details zur Datenverarbeitung und Privatsphäre.

## Projekt-Struktur

```
.
├── src/                    # React Quellcode
├── public/                 # Statische Assets
├── android/                # Native Android Projekt (Capacitor)
│   ├── app/                # Hauptapp für Smartphones
│   └── wear/               # 🆕 Wear OS Modul für Smartwatches
├── play-store-screenshots/ # 🆕 Google Play Store Screenshots & Dokumentation
├── dist/                   # Build-Ausgabe (wird ignoriert)
├── capacitor.config.ts     # Capacitor Konfiguration
├── vite.config.js          # Vite Konfiguration
├── tailwind.config.js      # Tailwind CSS Konfiguration
└── package.json            # NPM Dependencies und Scripte
```

## Google Play Store Screenshots

Professionelle Screenshots für den Play Store sind verfügbar in [`play-store-screenshots/`](./play-store-screenshots/):
- ✅ 9 hochwertige Screenshots (412x915px)
- ✅ Zeigt alle Hauptfunktionen der App
- ✅ Umfassende Dokumentation (DE/EN)
- ✅ Schritt-für-Schritt Upload-Anleitung
- ✅ Priorisierung und Empfehlungen

Siehe [play-store-screenshots/README.md](./play-store-screenshots/README.md) für Details.

## Veröffentlichung

### Google Play Store

1. App Bundle erstellen (siehe BUILD_AAB_ANLEITUNG.md)
2. Zur [Google Play Console](https://play.google.com/console) gehen
3. Neues Release erstellen und .aab Datei hochladen
4. **Screenshots hochladen** (siehe [play-store-screenshots/](./play-store-screenshots/))
   - 9 professionelle Screenshots verfügbar
   - Umfassende Dokumentation und Upload-Anleitung enthalten
   - Optimiert für Android-Geräte (412x915px)
5. Release Notes ausfüllen und veröffentlichen

### Web (PWA)

Die App kann auch als Progressive Web App bereitgestellt werden:

```bash
npm run build
# Inhalte des dist/ Ordners auf Webserver deployen
```

## Lizenz

Siehe LICENSE für Details.

## Kontakt

Bei Fragen oder Problemen: michael.pannitz@gmail.com
