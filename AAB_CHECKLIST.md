# AAB-Build Checkliste - Schritt für Schritt

Diese Checkliste hilft Ihnen, eine Android App Bundle (.aab) Datei für den Google Play Store zu erstellen.

## ✅ Vorbereitungs-Checkliste

### 1. Software-Voraussetzungen prüfen

- [ ] Node.js (Version 16 oder höher) installiert
- [ ] npm installiert
- [ ] Android Studio installiert
- [ ] JDK 17 oder höher installiert

**Installation prüfen:**
```bash
node --version    # Sollte v16+ sein
npm --version     # Sollte 8+ sein
java -version     # Sollte 17+ sein
```

### 2. Projekt vorbereiten

- [ ] Repository geklont
- [ ] Im Projekt-Verzeichnis navigiert

```bash
cd Wetter-App
```

## ✅ Schnellstart (Automatisch)

Verwenden Sie das bereitgestellte Script:

```bash
./prepare-aab.sh
```

Oder führen Sie die Schritte manuell aus:

```bash
npm install
npm run prepare:aab
```

## ✅ Manuelle Schritte für AAB-Erstellung

### Schritt 1: Dependencies installieren

```bash
npm install
```

**Erwartetes Ergebnis:** Alle Dependencies werden installiert, `node_modules` Ordner wird erstellt.

### Schritt 2: Web-App bauen

```bash
npm run build
```

**Erwartetes Ergebnis:** `dist` Ordner wird mit den gebauten Dateien erstellt.

### Schritt 3: Mit Android synchronisieren

```bash
npx cap sync android
```

**Erwartetes Ergebnis:** Die Web-Assets werden in `android/app/src/main/assets/public/` kopiert.

### Schritt 4: Android Studio öffnen

**Option A - Über npm:**
```bash
npm run android:open
```

**Option B - Manuell:**
1. Android Studio öffnen
2. "Open an Existing Project" wählen
3. Den `android` Ordner im Projekt auswählen
4. Warten, bis GradleSync abgeschlossen ist

### Schritt 5: Keystore erstellen (nur beim ersten Mal)

- [ ] Keystore-Datei erstellt

**In Android Studio:**
1. **Build** → **Generate Signed Bundle / APK**
2. **Android App Bundle** wählen → **Next**
3. **Create new...** klicken
4. Formular ausfüllen:
   - Key store path: `~/wetter-app-keystore.jks`
   - Passwords: Sicheres Passwort wählen
   - Alias: `wetter-app-key`
   - Validity: 25+ Jahre
   - Certificate: Ihre Daten eingeben

⚠️ **WICHTIG:** Keystore und Passwörter sicher aufbewahren! Siehe `android/KEYSTORE_SETUP.md` für Details.

### Schritt 6: App Bundle erstellen

**In Android Studio:**

1. **Build** → **Generate Signed Bundle / APK**
2. **Android App Bundle** wählen
3. **Next** klicken
4. Keystore auswählen und Passwörter eingeben
5. **Next** klicken
6. **release** als Build Variant wählen
7. **Create** klicken

**Erwartetes Ergebnis:** 
- AAB-Datei wird erstellt
- Pfad wird angezeigt: `android/app/release/app-release.aab`

**Oder über Kommandozeile** (erfordert konfigurierte Keystore):
```bash
cd android
./gradlew bundleRelease
```

Datei-Ausgabe: `android/app/build/outputs/bundle/release/app-release.aab`

## ✅ Vor dem Upload zum Play Store

### Version erhöhen

- [ ] Version in `android/app/build.gradle` erhöht

```gradle
versionCode 16      // Von 15 auf 16 erhöhen (muss immer größer werden)
versionName "16.0"  // Optional: Lesbarer Name
```

### App Bundle testen (optional)

```bash
# Bundletool herunterladen von:
# https://github.com/google/bundletool/releases

# APKs aus AAB generieren
java -jar bundletool.jar build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=app.apks \
  --ks=~/wetter-app-keystore.jks \
  --ks-key-alias=wetter-app-key

# Auf Gerät installieren
java -jar bundletool.jar install-apks --apks=app.apks
```

## ✅ Play Store Upload

1. [ ] [Google Play Console](https://play.google.com/console) öffnen
2. [ ] App auswählen oder neue erstellen
3. [ ] **Release** → **Production** (oder Testing) navigieren
4. [ ] **Create new release** klicken
5. [ ] AAB-Datei hochladen
6. [ ] Release Notes ausfüllen
7. [ ] Review und Publish durchführen

## 📋 Wichtige Dateien und Ordner

- `android/app/build.gradle` - Version, Signing Config
- `android/app/build/outputs/bundle/release/` - Generierte AAB
- `BUILD_AAB_ANLEITUNG.md` - Detaillierte deutsche Anleitung
- `BUILD_AAB_GUIDE.md` - Detaillierte englische Anleitung
- `android/KEYSTORE_SETUP.md` - Keystore-Konfiguration
- `prepare-aab.sh` - Automatisches Vorbereitungs-Script

## 🔧 Troubleshooting

### Gradle Build Fehler

```bash
cd android
./gradlew clean
cd ..
npm run prepare:aab
```

### Android Studio kann Projekt nicht öffnen

- Stellen Sie sicher, dass Sie den `android` Ordner öffnen, nicht den Root-Ordner

### App zeigt leeren Bildschirm

- Prüfen Sie, ob `npm run build` erfolgreich war
- Führen Sie `npx cap sync android` erneut aus

### Signing-Fehler

- Überprüfen Sie Keystore-Pfad und Passwörter
- Siehe `android/KEYSTORE_SETUP.md` für Details

## 📚 Weitere Ressourcen

- [Capacitor Dokumentation](https://capacitorjs.com/docs)
- [Android App Bundle Dokumentation](https://developer.android.com/guide/app-bundle)
- [Google Play Console](https://play.google.com/console)
- [Android Studio Download](https://developer.android.com/studio)

## 🎉 Erfolg!

Nach erfolgreichem Upload:
- [ ] AAB im Play Store hochgeladen
- [ ] Release Notes ausgefüllt
- [ ] App-Review durchgeführt
- [ ] App veröffentlicht oder für Testing freigegeben

**Gratulation! Ihre App ist im Play Store! 🚀**
