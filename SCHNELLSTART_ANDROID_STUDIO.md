# Schnellstart: App in Android Studio öffnen und ausführen

Diese Kurzanleitung zeigt die wichtigsten Schritte, um die WetterScoutAI App in Android Studio zu öffnen und auszuführen.

> 📚 **Für eine vollständige, detaillierte Anleitung siehe:** [ANDROID_STUDIO_ANLEITUNG.md](./ANDROID_STUDIO_ANLEITUNG.md)

## ⚡ In 5 Schritten zur laufenden App

### 1️⃣ Dependencies installieren
```bash
npm install
```

### 2️⃣ Web-App bauen und mit Android synchronisieren
```bash
npm run android:sync
```
*Dies führt automatisch `npm run build` und `npx cap sync android` aus*

### 3️⃣ Android Studio öffnen
```bash
npm run android:open
```
*Oder manuell: Android Studio öffnen → "Open" → `android` Ordner auswählen*

### 4️⃣ Gradle Sync abwarten
- Beim ersten Öffnen: Gradle synchronisiert automatisch (1-5 Minuten)
- Warten bis "Gradle sync finished" erscheint

### 5️⃣ App ausführen
- **Gerät/Emulator auswählen** (Dropdown oben in der Toolbar)
- **▶ Play-Button klicken** (oder Shift + F10)

**Fertig!** Die App startet auf Ihrem Gerät/Emulator 🎉

## 🔄 Bei Code-Änderungen

Nach jeder Änderung am React-Code:
```bash
npm run android:sync  # Web-App neu bauen und synchronisieren
```
Dann in Android Studio: App neu starten (▶ Button)

## 📦 App Bundle für Play Store erstellen

**Über Android Studio:**
1. **Build** → **Generate Signed Bundle / APK**
2. **Android App Bundle** auswählen
3. Keystore auswählen/erstellen
4. **release** Build Variant wählen
5. **Create** klicken

Die .aab Datei wird in `android/app/release/` erstellt.

**Über Kommandozeile:**
```bash
cd android
./gradlew bundleRelease
```
Datei: `android/app/build/outputs/bundle/release/app-release.aab`

> 📄 Siehe auch: [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) und [KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md)

## 🔧 Nützliche Befehle

```bash
# Development Server für Web-Version (zum schnellen Testen)
npm run dev

# Web-App bauen
npm run build

# Mit Android synchronisieren
npx cap sync android

# Android Studio öffnen
npm run android:open

# App auf verbundenem Gerät ausführen
npm run android:run

# Gradle Clean (bei Problemen)
cd android && ./gradlew clean && cd ..
```

## ❓ Probleme?

| Problem | Lösung |
|---------|---------|
| Gradle sync failed | `cd android && ./gradlew clean && cd .. && npm run android:sync` |
| App zeigt leeren Bildschirm | `npm run android:sync` erneut ausführen |
| Änderungen nicht sichtbar | **Build** → **Clean Project** in Android Studio |
| SDK location not found | `android/local.properties` erstellen mit `sdk.dir=...` |

## 📱 Wear OS App?

**Status:** Dieses Projekt enthält aktuell **keine Wear OS Version**.

Für Informationen, wie eine Wear OS App erstellt werden könnte, siehe:
- [ANDROID_STUDIO_ANLEITUNG.md - Wear OS Abschnitt](./ANDROID_STUDIO_ANLEITUNG.md#-wear-os-app-erstellen-optional)

## 📚 Weitere Ressourcen

- 📄 [ANDROID_STUDIO_ANLEITUNG.md](./ANDROID_STUDIO_ANLEITUNG.md) - Vollständige detaillierte Anleitung
- 📄 [README.md](./README.md) - Projekt-Übersicht
- 📄 [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) - AAB Erstellung
- 📄 [KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md) - Signierung

---

**Bei Fragen:** michael.pannitz@gmail.com
