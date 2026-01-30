# Quick Start Guide - Vollbildmodus

## ✅ Was wurde implementiert?

### 1. Vollbildmodus (Fullscreen Mode)
- Die Statusleiste (oben) und Navigationsleiste (unten) werden automatisch ausgeblendet
- **Immersive Sticky Mode:** Wenn der Nutzer wischt, erscheinen die Leisten kurz und verschwinden automatisch wieder
- Funktioniert auf allen Android-Versionen (10+)

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

2. **Vollbildmodus überprüfen:**
   - App sollte ohne Statusleiste starten
   - Von oben oder unten wischen → Leisten erscheinen kurz
   - Leisten verschwinden nach ca. 3 Sekunden automatisch wieder

## 🔍 Fehlerbehebung

### Vollbildmodus funktioniert nicht
- Prüfe Android-Version (mindestens Android 10 erforderlich)
- Neustart der App versuchen
- Cache leeren: Einstellungen → Apps → WetterScoutAI → Speicher → Cache leeren

### Logcat-Debugging
```bash
# Vollbildmodus debuggen
adb logcat | grep -i "statusbar\|windowinsets"
```

## 📝 Änderungen im Code

Falls du die Änderungen verstehen oder anpassen möchtest:

1. **MainActivity.java** - Vollbildmodus-Implementierung
2. **styles.xml** - Theme-Anpassungen
3. **capacitor.config.ts** - StatusBar-Konfiguration

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

## ✨ Das war's!

Die Implementierung ist abgeschlossen. Die App sollte jetzt:
- ✅ Im Vollbildmodus laufen (keine störende Statusleiste)
- ✅ Bereit für den Play Store Upload sein

Bei Fragen oder Problemen, siehe die vollständige Dokumentation in `FULLSCREEN_AND_NOTIFICATIONS.md`.
