# WetterScoutAI 🌦️

Eine moderne Wetter-App mit React, Vite und Capacitor.

## Features

- 📍 GPS-basierte Standorterkennung
- 🌡️ Lokale Wettervorhersagen
- ⚠️ DWD Wetterwarnungen
- 📊 Wetter-Charts und Visualisierungen
- 🤖 KI-generierte Wetterberichte (verbessert und detaillierter)
- 🌧️ Niederschlagsradar
- 🔔 Lokale Benachrichtigungen für tägliche Wettervorhersagen
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
- `npm run prepare:aab` - **NEU:** Projekt für AAB-Build vorbereiten
- `npm run android:sync` - Web-App bauen und mit Android synchronisieren
- `npm run android:open` - Android Studio öffnen
- `npm run android:run` - App auf verbundenem Gerät ausführen

## Android Berechtigungen

Die App benötigt folgende Berechtigungen:
- `INTERNET` - Zugriff auf Wetter-APIs
- `ACCESS_FINE_LOCATION` - Genauer GPS-Standort
- `ACCESS_COARSE_LOCATION` - Ungefährer Standort
- `POST_NOTIFICATIONS` - Lokale Benachrichtigungen (Android 13+)

## Neue Funktionen

### Benachrichtigungen

Die App unterstützt jetzt lokale Benachrichtigungen für:
- **Tägliche Wettervorhersage**: Erhalte eine Zusammenfassung wie der Tag wird
- **Ausblick auf morgen**: Erhalte eine Vorschau auf den nächsten Tag

Lokale Benachrichtigungen funktionieren **ohne** Firebase/FCM. Firebase wird nur für **Push Notifications** benötigt.

Benachrichtigungen können in den Einstellungen konfiguriert werden:
1. Öffne die Einstellungen (⚙️ Symbol)
2. Scrolle zu "Benachrichtigungen"
3. Aktiviere die gewünschten Benachrichtigungstypen
4. Wähle die Uhrzeit für deine Benachrichtigungen

Kurze Fehlerhilfe:
- Stelle sicher, dass die Benachrichtigungsberechtigung erteilt wurde (Android 13+: `POST_NOTIFICATIONS`).
- Prüfe die System-Einstellungen → Apps → WetterScoutAI → Benachrichtigungen (aktiv, nicht im Nicht-Stören-Modus).

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
