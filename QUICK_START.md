# Quick Start Guide - Vollbildmodus und Benachrichtigungen

## ✅ Was wurde implementiert?

### 1. Vollbildmodus (Fullscreen Mode)
- Die Statusleiste (oben) und Navigationsleiste (unten) werden automatisch ausgeblendet
- **Immersive Sticky Mode:** Wenn der Nutzer wischt, erscheinen die Leisten kurz und verschwinden automatisch wieder
- Funktioniert auf allen Android-Versionen (10+)

### 2. Benachrichtigungen
- Die App fordert jetzt automatisch die Benachrichtigungsberechtigung beim ersten Start an
- Funktioniert auf Android 13+ mit der neuen POST_NOTIFICATIONS Berechtigung

## 🚀 Nächste Schritte zum Testen

### Option A: APK für schnelles Testen erstellen
```bash
cd android
./gradlew assembleRelease
```
APK-Datei: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Option B: AAB für Play Store erstellen
```bash
cd android
./gradlew bundleRelease
```
AAB-Datei: `android/app/build/outputs/bundle/release/app-release.aab`

## 📱 Auf dem Gerät testen

1. **Installiere die App** auf deinem Android-Gerät

2. **Erster Start:**
   - Dialog erscheint: "WetterScoutAI möchte Benachrichtigungen senden"
   - Tippe auf "Erlauben"

3. **Vollbildmodus überprüfen:**
   - App sollte ohne Statusleiste starten
   - Von oben oder unten wischen → Leisten erscheinen kurz
   - Leisten verschwinden nach ca. 3 Sekunden automatisch wieder

4. **Benachrichtigungen testen:**
   - Öffne App-Einstellungen (⚙️)
   - Aktiviere "Tägliche Wettervorhersage" oder "Ausblick auf morgen"
   - Stelle eine Zeit ein (z.B. in 2 Minuten)
   - Warte ab → Benachrichtigung sollte zur eingestellten Zeit erscheinen

## 🔍 Fehlerbehebung

### Vollbildmodus funktioniert nicht
- Prüfe Android-Version (mindestens Android 10 erforderlich)
- Neustart der App versuchen
- Cache leeren: Einstellungen → Apps → WetterScoutAI → Speicher → Cache leeren

### Benachrichtigungen kommen nicht an
1. **Berechtigung prüfen:**
   - Einstellungen → Apps → WetterScoutAI → Benachrichtigungen
   - Stelle sicher, dass "Benachrichtigungen" aktiviert ist

2. **Batterieoptimierung deaktivieren:**
   - Einstellungen → Akku → Batterienutzung
   - WetterScoutAI auswählen → "Nicht optimieren"

3. **Benachrichtigungskanäle prüfen:**
   - Einstellungen → Apps → WetterScoutAI → Benachrichtigungen
   - Alle Kanäle sollten aktiviert sein

### Logcat-Debugging
```bash
# Benachrichtigungen debuggen
adb logcat | grep -i "notification"

# Vollbildmodus debuggen
adb logcat | grep -i "statusbar\|windowinsets"
```

## 📝 Änderungen im Code

Falls du die Änderungen verstehen oder anpassen möchtest:

1. **MainActivity.java** - Vollbildmodus-Implementierung
2. **App.jsx** - Benachrichtigungsberechtigungen
3. **styles.xml** - Theme-Anpassungen
4. **capacitor.config.ts** - StatusBar-Konfiguration

Vollständige Dokumentation: `FULLSCREEN_AND_NOTIFICATIONS.md`

## 🎯 Play Store Upload

Wenn alles funktioniert:

1. **Versionsnummer erhöhen** in `android/app/build.gradle`:
   ```gradle
   versionCode 16  // von 15 auf 16
   versionName "16.0"
   ```

2. **AAB erstellen:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

3. **Signieren** (falls noch nicht automatisch):
   - Mit deinem Release Keystore signieren

4. **Hochladen** zur Google Play Console:
   - Production → Create new release
   - Upload AAB
   - Release Notes erwähnen:
     * "Vollbildmodus für bessere Nutzererfahrung"
     * "Verbesserte Benachrichtigungen"

## ✨ Das war's!

Die Implementierung ist abgeschlossen. Die App sollte jetzt:
- ✅ Im Vollbildmodus laufen (keine störende Statusleiste)
- ✅ Benachrichtigungen zuverlässig anzeigen
- ✅ Bereit für den Play Store Upload sein

Bei Fragen oder Problemen, siehe die vollständige Dokumentation in `FULLSCREEN_AND_NOTIFICATIONS.md`.
