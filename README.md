# WetterScoutAI 🌦️

Eine moderne Wetter-App mit React, Vite und Capacitor.

## Features

- 📍 GPS-basierte Standorterkennung
- 🌡️ Lokale Wettervorhersagen
- ⚠️ DWD Wetterwarnungen
- 📊 Wetter-Charts und Visualisierungen
- 🤖 KI-generierte Wetterberichte
- 🌧️ Niederschlagsradar
- 📱 Progressive Web App (PWA) und native Android App

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

## Android App Bundle (.aab) erstellen

Siehe detaillierte Anleitungen:
- 🇩🇪 [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) (Deutsch)
- 🇬🇧 [BUILD_AAB_GUIDE.md](./BUILD_AAB_GUIDE.md) (English)

### Quick Start

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
- `npm run android:sync` - Web-App bauen und mit Android synchronisieren
- `npm run android:open` - Android Studio öffnen
- `npm run android:run` - App auf verbundenem Gerät ausführen

## Android Berechtigungen

Die App benötigt folgende Berechtigungen:
- `INTERNET` - Zugriff auf Wetter-APIs
- `ACCESS_FINE_LOCATION` - Genauer GPS-Standort
- `ACCESS_COARSE_LOCATION` - Ungefährer Standort

## Datenschutz

Siehe [DATENSCHUTZ.md](./DATENSCHUTZ.md) für Details zur Datenverarbeitung und Privatsphäre.

## Projekt-Struktur

```
.
├── src/                    # React Quellcode
├── public/                 # Statische Assets
├── android/                # Native Android Projekt (Capacitor)
├── dist/                   # Build-Ausgabe (wird ignoriert)
├── capacitor.config.ts     # Capacitor Konfiguration
├── vite.config.js          # Vite Konfiguration
├── tailwind.config.js      # Tailwind CSS Konfiguration
└── package.json            # NPM Dependencies und Scripte
```

## Veröffentlichung

### Google Play Store

1. App Bundle erstellen (siehe BUILD_AAB_ANLEITUNG.md)
2. Zur [Google Play Console](https://play.google.com/console) gehen
3. Neues Release erstellen und .aab Datei hochladen
4. Release Notes ausfüllen und veröffentlichen

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
