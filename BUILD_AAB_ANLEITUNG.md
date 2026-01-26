# Android App Bundle (.aab) Build Anleitung

Diese Anleitung beschreibt, wie Sie aus dieser Wetter-App eine Android App Bundle (.aab) Datei für die Veröffentlichung im Google Play Store erstellen.

## Voraussetzungen

- Node.js und npm installiert
- Android Studio installiert
- Java Development Kit (JDK) 17 oder höher

## Schritt 1: Dependencies installieren

```bash
npm install
```

## Schritt 2: Web-App bauen und mit Android synchronisieren

```bash
npm run android:sync
```

Dieser Befehl führt folgende Aktionen aus:
1. Baut die Web-App mit Vite (`npm run build`)
2. Synchronisiert die gebauten Dateien mit dem Android-Projekt (`npx cap sync android`)

## Schritt 3: Android Studio öffnen

```bash
npm run android:open
```

Oder manuell:
1. Android Studio öffnen
2. "Open an Existing Project" wählen
3. Den Ordner `android` in diesem Projekt auswählen

## Schritt 4: App Bundle (.aab) in Android Studio erstellen

### 4.1 Signing Key erstellen (nur beim ersten Mal)

Falls Sie noch keinen Signing Key haben:

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Wählen Sie **Android App Bundle**
3. Klicken Sie auf **Create new...** unter Key store path
4. Füllen Sie die Felder aus:
   - **Key store path**: Wählen Sie einen Speicherort (z.B. `~/wetter-app-keystore.jks`)
   - **Password**: Wählen Sie ein sicheres Passwort
   - **Alias**: z.B. `wetter-app-key`
   - **Password**: Passwort für den Key
   - **Validity**: 25 Jahre oder mehr
   - **Certificate**: Geben Sie Ihre Daten ein

⚠️ **WICHTIG**: Bewahren Sie den Keystore und die Passwörter sicher auf! Sie benötigen diese für alle zukünftigen Updates der App.

### 4.2 App Bundle erstellen

1. **Build** → **Generate Signed Bundle / APK**
2. Wählen Sie **Android App Bundle**
3. Klicken Sie auf **Next**
4. Wählen Sie Ihren Keystore aus oder erstellen Sie einen neuen (siehe 4.1)
5. Geben Sie die Passwörter ein
6. Klicken Sie auf **Next**
7. Wählen Sie **release** als Build Variant
8. Optional: Aktivieren Sie die beiden Checkboxen für V1 und V2 Signature
9. Klicken Sie auf **Create**

Die .aab Datei wird erstellt und der Pfad wird angezeigt (normalerweise in `android/app/release/app-release.aab`).

## Schritt 5: App Bundle testen (optional)

Sie können die App Bundle lokal testen mit dem `bundletool`:

```bash
# Bundletool herunterladen (einmalig)
# Von https://github.com/google/bundletool/releases

# APK-Set aus AAB generieren
java -jar bundletool.jar build-apks \
  --bundle=android/app/release/app-release.aab \
  --output=app.apks \
  --ks=~/wetter-app-keystore.jks \
  --ks-key-alias=wetter-app-key

# APK auf verbundenem Gerät installieren
java -jar bundletool.jar install-apks --apks=app.apks
```

## Schritt 6: Im Google Play Store hochladen

1. Gehen Sie zur [Google Play Console](https://play.google.com/console)
2. Erstellen Sie eine neue App oder wählen Sie eine bestehende aus
3. Navigieren Sie zu **Release** → **Production** (oder Testing)
4. Klicken Sie auf **Create new release**
5. Laden Sie die .aab Datei hoch
6. Füllen Sie die Release Notes aus
7. Folgen Sie den weiteren Schritten zur Veröffentlichung

## Version erhöhen

Bevor Sie ein Update veröffentlichen, müssen Sie die Version erhöhen:

1. Öffnen Sie `android/app/build.gradle`
2. Erhöhen Sie `versionCode` (z.B. von 1 auf 2)
3. Optional: Aktualisieren Sie `versionName` (z.B. von "1.0" auf "1.1")

Beispiel:
```gradle
defaultConfig {
    applicationId "com.barbecubewetterscoutai.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 16  // <- Erhöhen
    versionName "16.0"  // <- Optional aktualisieren
    ...
}
```

## Nützliche Befehle

- `npm run dev` - Entwicklungsserver für die Web-App starten
- `npm run build` - Web-App für Produktion bauen
- `npm run android:sync` - Web-App bauen und mit Android synchronisieren
- `npm run android:open` - Android Studio mit dem Projekt öffnen
- `npm run android:run` - App auf einem verbundenen Gerät/Emulator ausführen

## Berechtigungen

Die App verwendet folgende Android-Berechtigungen:
- `INTERNET` - Für den Zugriff auf Wetter-APIs
- `ACCESS_FINE_LOCATION` - Für genauen GPS-Standort
- `ACCESS_COARSE_LOCATION` - Für ungefähren Standort

Diese sind bereits in `android/app/src/main/AndroidManifest.xml` konfiguriert.

## Troubleshooting

### Gradle Build Fehler
Wenn der Build fehlschlägt:
```bash
cd android
./gradlew clean
cd ..
npm run android:sync
```

### Android Studio kann Projekt nicht öffnen
Stellen Sie sicher, dass Sie den `android` Ordner öffnen, nicht den Root-Ordner.

### App zeigt leeren Bildschirm
Überprüfen Sie, ob `npm run build` erfolgreich war und führen Sie `npx cap sync android` erneut aus.

## Weitere Informationen

- [Capacitor Dokumentation](https://capacitorjs.com/docs)
- [Android App Bundle Dokumentation](https://developer.android.com/guide/app-bundle)
- [Google Play Console](https://play.google.com/console)
