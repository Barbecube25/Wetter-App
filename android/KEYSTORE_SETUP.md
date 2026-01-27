# Keystore Setup für App-Signierung

Diese Datei erklärt, wie Sie einen Keystore für die Signierung Ihrer Android App erstellen und verwenden.

## Option 1: Keystore über Android Studio erstellen (Empfohlen)

Dies ist der einfachste Weg:

1. Öffnen Sie Android Studio mit dem Projekt
2. Gehen Sie zu **Build** → **Generate Signed Bundle / APK**
3. Wählen Sie **Android App Bundle**
4. Klicken Sie auf **Create new...** unter "Key store path"
5. Füllen Sie das Formular aus:
   - **Key store path**: Wählen Sie einen sicheren Ort (z.B. `~/wetter-app-keystore.jks`)
   - **Password**: Starkes Passwort für den Keystore
   - **Key Alias**: `wetter-app-key` (oder einen anderen Namen)
   - **Key Password**: Starkes Passwort für den Key
   - **Validity (years)**: Mindestens 25 Jahre
   - **Certificate**: Ihre persönlichen Daten

## Option 2: Keystore über Kommandozeile erstellen

```bash
keytool -genkey -v -keystore ~/wetter-app-keystore.jks \
  -alias wetter-app-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass IhrKeystorePasswort \
  -keypass IhrKeyPasswort
```

Sie werden aufgefordert, Informationen einzugeben:
- Name und Nachname
- Organisationseinheit
- Organisation
- Stadt
- Bundesland
- Ländercode (z.B. DE)

## Keystore-Datei sicher aufbewahren

⚠️ **SEHR WICHTIG**: 
- Bewahren Sie die Keystore-Datei (`.jks`) an einem **sicheren Ort** auf
- Notieren Sie sich die Passwörter **sicher** (z.B. in einem Passwort-Manager)
- **Niemals** die Keystore-Datei in Git committen
- Machen Sie **Backups** der Keystore-Datei an mehreren Orten

Wenn Sie die Keystore-Datei oder die Passwörter verlieren, können Sie **keine Updates** mehr für Ihre App im Play Store veröffentlichen!

## Keystore in build.gradle einbinden

### Methode 1: Umgebungsvariablen (Empfohlen für CI/CD)

Setzen Sie diese Umgebungsvariablen:
```bash
export KEYSTORE_FILE=/pfad/zu/wetter-app-keystore.jks
export KEYSTORE_PASSWORD=IhrKeystorePasswort
export KEY_ALIAS=wetter-app-key
export KEY_PASSWORD=IhrKeyPasswort
```

Dann kommentieren Sie in `app/build.gradle` die Signing-Konfiguration aus:
```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_FILE") ?: "release-keystore.jks")
        storePassword System.getenv("KEYSTORE_PASSWORD") ?: "your-keystore-password"
        keyAlias System.getenv("KEY_ALIAS") ?: "wetter-app-key"
        keyPassword System.getenv("KEY_PASSWORD") ?: "your-key-password"
    }
}
```

Und aktivieren Sie die Signierung im release-Build:
```gradle
buildTypes {
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release  // Diese Zeile auskommentieren
    }
}
```

### Methode 2: keystore.properties Datei (Empfohlen für lokale Entwicklung)

1. Erstellen Sie eine Datei `android/keystore.properties`:
```properties
storeFile=/absolute/pfad/zu/wetter-app-keystore.jks
storePassword=IhrKeystorePasswort
keyAlias=wetter-app-key
keyPassword=IhrKeyPasswort
```

2. Fügen Sie `keystore.properties` zur `.gitignore` hinzu (bereits vorhanden)

3. Erweitern Sie `app/build.gradle`:
```gradle
// Keystore properties laden
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            }
        }
    }
}
```

## AAB mit Kommandozeile bauen

Sobald die Keystore-Konfiguration aktiv ist, können Sie die AAB-Datei auch über die Kommandozeile bauen:

```bash
cd android
./gradlew bundleRelease
```

Die AAB-Datei finden Sie dann unter:
`android/app/build/outputs/bundle/release/app-release.aab`

## Keystore-Informationen anzeigen

Um Informationen über Ihren Keystore anzuzeigen:

```bash
keytool -list -v -keystore ~/wetter-app-keystore.jks -alias wetter-app-key
```

## Troubleshooting

### "Failed to read key": Falsches Passwort
Überprüfen Sie, dass Sie das richtige Passwort verwenden.

### "Keystore not found": Falscher Pfad
Stellen Sie sicher, dass der Pfad zur Keystore-Datei korrekt ist (absoluter Pfad empfohlen).

### "Alias not found": Falscher Alias
Verwenden Sie den korrekten Key-Alias (überprüfen Sie mit `keytool -list`).
