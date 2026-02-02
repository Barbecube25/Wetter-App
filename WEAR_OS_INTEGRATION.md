# Wear OS Integration

Diese App unterstützt jetzt Wear OS (Smartwatches)! Die Integration ermöglicht es, dass die App im Google Play Store sowohl für Smartphones als auch für Smartwatches angezeigt wird.

## Was wurde hinzugefügt?

### 1. Wear OS Modul (`android/wear/`)
Ein separates Android-Modul wurde erstellt für die Wear OS Version der App:
- **MainActivity.kt**: Eine einfache Wear OS Activity mit Jetpack Compose
- **AndroidManifest.xml**: Wear OS spezifische Manifest-Konfiguration
- **build.gradle**: Wear OS Abhängigkeiten und Konfiguration

### 2. Hauptapp Manifest Update
Die Hauptapp (`android/app/src/main/AndroidManifest.xml`) wurde aktualisiert mit:
```xml
<uses-feature android:name="android.hardware.type.watch" android:required="false" />
```
Dies signalisiert dem Play Store, dass die App auf Wear OS laufen kann, aber es nicht zwingend erforderlich ist.

### 3. Projekt-Struktur Update
Die `settings.gradle` wurde aktualisiert um das Wear OS Modul einzuschließen:
```gradle
include ':wear'
```

## Play Store Integration

Wenn Sie eine AAB-Datei (Android App Bundle) erstellen, die sowohl das `:app` als auch das `:wear` Modul enthält, wird der Google Play Store automatisch:

1. Die App sowohl für Smartphones als auch für Smartwatches anzeigen
2. Die richtige Version auf dem jeweiligen Gerät installieren
3. Beide Versionen über eine einzige Play Store Listung verwalten

## Build Anweisungen

### Wear OS Modul einzeln bauen:
```bash
cd android
./gradlew :wear:assembleDebug
```

### AAB mit Wear OS Support erstellen:
```bash
cd android
./gradlew bundleRelease
```

Das resultierende AAB enthält beide Module (App + Wear) und der Play Store wird automatisch die richtige Version auf dem jeweiligen Gerät bereitstellen.

## Funktionen der Wear OS App

Die Wear OS Version zeigt derzeit:
- App-Name ("Wetter Scout AI")
- "Wear OS" Label
- Zeitanzeige oben (TimeText)
- Material Design für Wear OS

## Zukünftige Erweiterungen

Die Wear OS App kann erweitert werden um:
- Wetterdaten von der Hauptapp zu synchronisieren
- Komplikationen (Complications) für Watch Faces
- Tiles für schnellen Zugriff auf Wetterdaten
- Notifications für Wetterwarnungen

## Wichtige Hinweise

1. **Wear OS API Level**: Das Wear OS Modul benötigt mindestens Android API Level 30 (Android 11)
2. **Standalone App**: Die Wear OS App ist als standalone markiert (`com.google.android.wearable.standalone = true`), was bedeutet, dass sie unabhängig von einem gekoppelten Smartphone funktionieren kann
3. **Play Store Sichtbarkeit**: Nach dem Upload des AAB wird die App automatisch in der Wear OS Kategorie des Play Store erscheinen

## Testen

Zum Testen der Wear OS Version:
1. Verwenden Sie einen Wear OS Emulator in Android Studio
2. Oder testen Sie auf einem echten Wear OS Gerät
3. Installieren Sie die Debug-APK mit: `./gradlew :wear:installDebug`
