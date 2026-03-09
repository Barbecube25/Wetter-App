# Android Studio Setup und Build Anleitung

Diese ausführliche Anleitung zeigt Ihnen Schritt für Schritt, wie Sie die WetterScoutAI App in Android Studio öffnen, bearbeiten und als Android App generieren.

## 📱 Aktueller Projektstand

**Wichtiger Hinweis:** Dieses Projekt enthält:
- ✅ **Mobile Android App** (für Smartphones und Tablets)

## 📋 Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software installiert ist:

### 1. Java Development Kit (JDK)
- **Version:** JDK 17 oder höher
- **Download:** [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) oder [OpenJDK](https://openjdk.org/)
- **Prüfen:** Öffnen Sie ein Terminal und führen Sie aus:
  ```bash
  java -version
  ```
  Sie sollten eine Version ≥ 17 sehen.

### 2. Node.js und npm
- **Version:** Node.js 18 oder höher
- **Download:** [nodejs.org](https://nodejs.org/)
- **Prüfen:**
  ```bash
  node --version
  npm --version
  ```

### 3. Android Studio
- **Download:** [developer.android.com/studio](https://developer.android.com/studio)
- **Installation:** Folgen Sie dem Installationsassistenten
- **SDK Installation:** Stellen Sie sicher, dass Android SDK installiert ist (wird normalerweise automatisch mitinstalliert)

## 🚀 Schritt-für-Schritt Anleitung

### Schritt 1: Projekt herunterladen/klonen

Falls noch nicht geschehen, laden Sie das Projekt herunter oder klonen Sie es:

```bash
git clone https://github.com/Barbecube25/Wetter-App.git
cd Wetter-App
```

### Schritt 2: Node.js Dependencies installieren

Öffnen Sie ein Terminal im Projektverzeichnis und führen Sie aus:

```bash
npm install
```

Dies installiert alle benötigten JavaScript-Bibliotheken.

**Erwartete Ausgabe:**
```
added 345 packages in 15s
```

### Schritt 3: Web-App bauen

Die App basiert auf Capacitor, das eine Web-App in eine native Android App verpackt. Zuerst müssen wir die Web-App bauen:

```bash
npm run build
```

**Was passiert hier?**
- Vite baut Ihre React-App
- Erstellt optimierte JavaScript- und CSS-Dateien
- Speichert alles im `dist/` Ordner

**Erwartete Ausgabe:**
```
✓ 345 modules transformed.
dist/index.html                   1.25 kB
dist/assets/index-abc123.css     52.34 kB
dist/assets/index-def456.js     234.56 kB
✓ built in 3.45s
```

### Schritt 4: Mit Android synchronisieren

Synchronisieren Sie die gebaute Web-App mit dem Android-Projekt:

```bash
npx cap sync android
```

**Was passiert hier?**
- Kopiert die Web-App aus `dist/` nach `android/app/src/main/assets/public/`
- Aktualisiert die Android-Konfiguration
- Installiert Capacitor-Plugins

**Erwartete Ausgabe:**
```
✔ Copying web assets from dist to android/app/src/main/assets/public in 234ms
✔ Updating Android plugins in 123ms
✔ copy android in 356ms
✔ Updating Android native dependencies in 1.23s
✔ update android in 1.45s
```

**💡 Tipp:** Sie können Schritt 3 und 4 kombinieren mit:
```bash
npm run android:sync
```

### Schritt 5: Android Studio öffnen

Es gibt zwei Möglichkeiten:

#### Option A: Über Kommandozeile (empfohlen)
```bash
npm run android:open
```
oder
```bash
npx cap open android
```

#### Option B: Manuell
1. Starten Sie Android Studio
2. Klicken Sie auf **"Open"** oder **"Open an Existing Project"**
3. Navigieren Sie zum Projektordner
4. Wählen Sie den **`android`** Ordner (NICHT den Root-Ordner!)
5. Klicken Sie auf **"Open"**

### Schritt 6: Projekt in Android Studio laden lassen

Beim ersten Öffnen:
1. Android Studio lädt das Projekt und synchronisiert Gradle (kann 1-5 Minuten dauern)
2. Sie sehen unten eine Statusleiste: "Gradle build running..."
3. Warten Sie, bis "Gradle sync finished" erscheint

**Falls Fehler auftreten:**
- Klicken Sie auf **"File"** → **"Invalidate Caches / Restart"**
- Oder führen Sie aus:
  ```bash
  cd android
  ./gradlew clean
  cd ..
  npm run android:sync
  ```

### Schritt 7: App auf einem Gerät/Emulator testen

#### Option A: Auf einem physischen Gerät
1. Aktivieren Sie auf Ihrem Android-Gerät die **Entwickleroptionen**:
   - Gehen Sie zu **Einstellungen** → **Über das Telefon**
   - Tippen Sie 7x auf **Build-Nummer**
   - Gehen Sie zurück zu **Einstellungen** → **Entwickleroptionen**
   - Aktivieren Sie **USB-Debugging**
2. Verbinden Sie Ihr Gerät per USB mit dem Computer
3. Bestätigen Sie auf dem Gerät die USB-Debugging-Berechtigung
4. In Android Studio sollte Ihr Gerät nun in der Geräte-Liste erscheinen (oben in der Toolbar)
5. Klicken Sie auf den **grünen Play-Button** (▶) oder drücken Sie **Shift + F10**

#### Option B: Auf einem Emulator
1. In Android Studio: Klicken Sie auf **"Device Manager"** (Smartphone-Symbol in der Toolbar)
2. Falls kein Emulator existiert, klicken Sie auf **"Create Device"**
3. Wählen Sie ein Gerät (z.B. "Pixel 6") und klicken Sie auf **"Next"**
4. Wählen Sie ein System Image (z.B. "Android 14 - API 34") und klicken Sie auf **"Next"** und **"Finish"**
5. Starten Sie den Emulator durch Klick auf den **Play-Button** neben dem Emulator-Namen
6. Wählen Sie den Emulator in der Geräte-Liste aus
7. Klicken Sie auf den **grünen Play-Button** (▶)

**Die App sollte nun auf Ihrem Gerät/Emulator starten!** 🎉

## 📦 Android App Bundle (.aab) für den Play Store erstellen

Wenn Sie die App im Google Play Store veröffentlichen möchten, benötigen Sie eine signierte App Bundle (.aab) Datei.

### Methode 1: Über Android Studio (Empfohlen für Anfänger)

Siehe die detaillierte Anleitung in:
- 📄 [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) - Vollständige deutsche Anleitung
- 📄 [KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md) - Keystore-Konfiguration

**Kurzversion:**
1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Wählen Sie **Android App Bundle**
3. Erstellen Sie einen neuen Keystore (oder wählen Sie einen bestehenden)
4. Folgen Sie dem Assistenten
5. Die .aab-Datei wird in `android/app/release/` erstellt

### Methode 2: Über Kommandozeile (Schneller für erfahrene Nutzer)

**Voraussetzung:** Keystore muss konfiguriert sein (siehe [KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md))

```bash
cd android
./gradlew bundleRelease
```

Die .aab-Datei finden Sie unter:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 🔄 Workflow für App-Entwicklung

Wenn Sie Änderungen am Code vornehmen, folgen Sie diesem Workflow:

1. **Änderungen am React-Code vornehmen** (Dateien in `src/`)
2. **Web-App neu bauen und synchronisieren:**
   ```bash
   npm run android:sync
   ```
3. **App in Android Studio neu ausführen** (▶ Button)

**Für schnelle Tests während der Entwicklung:**
```bash
# Development Server für Web-Version (schnellere Iteration)
npm run dev
# Öffnen Sie http://localhost:5173 im Browser
```

## 🔧 Wichtige Dateien und Ordner

```
Wetter-App/
├── src/                          # React Quellcode (Web-App)
├── public/                       # Statische Assets
├── android/                      # Native Android Projekt
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/            # Java/Kotlin Code
│   │   │   └── res/             # Android Ressourcen (Icons, etc.)
│   │   └── build.gradle         # App-Konfiguration
│   ├── build.gradle             # Projekt-Konfiguration
│   └── settings.gradle
├── capacitor.config.ts          # Capacitor-Konfiguration
├── package.json                 # Node.js Dependencies
└── vite.config.js               # Vite Build-Konfiguration
```

## ❓ Häufige Probleme und Lösungen

### Problem: "SDK location not found"
**Lösung:**
1. Erstellen Sie `android/local.properties`
2. Fügen Sie hinzu:
   ```properties
   sdk.dir=/Pfad/zu/Android/SDK
   ```
   - **Windows:** `C:\\Users\\IhrName\\AppData\\Local\\Android\\Sdk`
   - **macOS:** `/Users/IhrName/Library/Android/sdk`
   - **Linux:** `/home/IhrName/Android/Sdk`

### Problem: "Gradle sync failed"
**Lösung:**
```bash
cd android
./gradlew clean
cd ..
npm run android:sync
```

### Problem: App zeigt leeren/weißen Bildschirm
**Lösung:**
1. Prüfen Sie, ob `npm run build` erfolgreich war
2. Führen Sie `npx cap sync android` erneut aus
3. In Android Studio: **Build** → **Clean Project** → **Rebuild Project**

### Problem: "Unable to locate adb"
**Lösung:**
1. Fügen Sie das Android SDK Platform-Tools zum PATH hinzu
2. Oder setzen Sie `ANDROID_HOME` Umgebungsvariable:
   ```bash
   export ANDROID_HOME=/Pfad/zu/Android/SDK
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### Problem: Änderungen werden in der App nicht angezeigt
**Lösung:**
- Nach jeder Änderung am React-Code: `npm run android:sync` ausführen
- In Android Studio: App neu starten (Stop → Play)
- Falls immer noch nicht sichtbar: **Build** → **Clean Project**

## 🔐 Vor der Veröffentlichung

Bevor Sie die App veröffentlichen:

1. **Versionsnummer erhöhen** in `android/app/build.gradle`:
   ```gradle
   defaultConfig {
       versionCode 16  // Erhöhen (aktuell: 15)
       versionName "16.0"
   }
   ```

2. **App-Details überprüfen:**
   - App-Name in `android/app/src/main/res/values/strings.xml`
   - App-Icon in `android/app/src/main/res/mipmap-*/`
   - Package-Name: `com.barbecubewetterscoutai.app`

3. **Berechtigungen prüfen** in `android/app/src/main/AndroidManifest.xml`:
   - ✅ `INTERNET` - Für API-Zugriff
   - ✅ `ACCESS_FINE_LOCATION` - Für GPS
   - ✅ `ACCESS_COARSE_LOCATION` - Für ungefähren Standort

## 📚 Zusätzliche Ressourcen

- 📄 [README.md](./README.md) - Projekt-Übersicht
- 📄 [BUILD_AAB_ANLEITUNG.md](./BUILD_AAB_ANLEITUNG.md) - AAB Build Anleitung
- 📄 [BUILD_AAB_GUIDE.md](./BUILD_AAB_GUIDE.md) - English version
- 📄 [KEYSTORE_SETUP.md](./android/KEYSTORE_SETUP.md) - Keystore Konfiguration
- 📄 [QUICK_START.md](./QUICK_START.md) - Schnellstart-Guide
- 🌐 [Capacitor Documentation](https://capacitorjs.com/docs)
- 🌐 [Android Studio Guide](https://developer.android.com/studio/intro)

## 📞 Hilfe und Support

Bei Fragen oder Problemen:
- 📧 E-Mail: michael.pannitz@gmail.com
- 📋 GitHub Issues: [github.com/Barbecube25/Wetter-App/issues](https://github.com/Barbecube25/Wetter-App/issues)

---

**Viel Erfolg mit Ihrer App-Entwicklung!** 🚀
