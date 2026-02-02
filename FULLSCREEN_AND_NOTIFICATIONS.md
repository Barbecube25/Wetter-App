# Vollbildmodus - Implementierung

## Übersicht

Diese Dokumentation beschreibt die Implementierung des Vollbildmodus für die Wetter-App mit Android 15 (SDK 35) Edge-to-Edge Kompatibilität.

## Probleme behoben

### 1. ✅ Vollbildmodus implementiert
**Problem:** Statusleiste oben war im Weg  
**Lösung:** Echter Vollbildmodus mit immersive sticky mode

### 2. ✅ Android 15 (SDK 35) Edge-to-Edge Kompatibilität
**Problem:** Ab Android 15 werden Apps mit SDK 35 standardmäßig randlos angezeigt  
**Lösung:** EdgeToEdge.enable() für Abwärtskompatibilität implementiert

## Änderungen im Detail

### 1. MainActivity.java
**Datei:** `android/app/src/main/java/com/barbecubewetterscoutai/app/MainActivity.java`

**Was wurde geändert:**
- **NEU:** EdgeToEdge.enable() für Android 15 (SDK 35) Kompatibilität
- Implementierung des Vollbildmodus mit `WindowInsetsController` (Android 11+)
- Fallback auf Legacy-Flags für ältere Android-Versionen (Android 10 und früher)
- Immersive Sticky Mode: Statusleiste und Navigationsleiste werden ausgeblendet
- Automatisches Wiederherstellen des Vollbildmodus bei Fokuswechsel

**Wichtige Features:**
```java
// Android 15+ (SDK 35) Kompatibilität
- EdgeToEdge.enable() sorgt für korrekte Edge-to-Edge Anzeige
- Gewährleistet Abwärtskompatibilität mit älteren Android-Versionen

// Android 11+ (API 30+)
- WindowInsetsController mit BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
- Versteckt Statusleiste und Navigationsleiste
- Bars erscheinen bei Wischgeste und verschwinden automatisch wieder

// Android 10 und älter
- SYSTEM_UI_FLAG_IMMERSIVE_STICKY
- SYSTEM_UI_FLAG_FULLSCREEN
- SYSTEM_UI_FLAG_HIDE_NAVIGATION
```

### 2. build.gradle
**Datei:** `android/app/build.gradle`

**Was wurde geändert:**
```gradle
implementation "androidx.activity:activity:$androidxActivityVersion"
```

Diese Abhängigkeit ist erforderlich für:
- EdgeToEdge API Support
- Android 15 (SDK 35) Kompatibilität
- Moderne Activity-Funktionen

### 3. styles.xml
**Datei:** `android/app/src/main/res/values/styles.xml`

**Was wurde geändert:**
```xml
<item name="android:windowFullscreen">true</item>
<item name="android:windowDrawsSystemBarBackgrounds">true</item>
<item name="android:statusBarColor">@android:color/transparent</item>
<item name="android:navigationBarColor">@android:color/transparent</item>
```

Diese Einstellungen sorgen für:
- Vollbildmodus im Theme
- Transparente Systemleisten
- App-Inhalt zeichnet hinter den Systemleisten

### 4. capacitor.config.ts
**Datei:** `capacitor.config.ts`

**Was wurde geändert:**
```typescript
StatusBar: {
  style: 'dark',
  backgroundColor: '#000000',
  overlaysWebView: true
}
```

Konfiguriert:
- StatusBar Overlay-Modus
- Keine Benachrichtigungs-Plugins

## Wie es funktioniert

### Edge-to-Edge Kompatibilität (Android 15+)
1. `EdgeToEdge.enable(this)` wird beim App-Start aufgerufen
2. Konfiguriert automatisch:
   - Transparente System-Bars
   - Korrekte Inset-Behandlung
   - Abwärtskompatibilität mit älteren Android-Versionen
3. Ermöglicht nahtlose Integration mit Vollbildmodus

### Vollbildmodus
1. App startet und `MainActivity.onCreate()` wird aufgerufen
2. `enableFullscreenMode()` wird ausgeführt
3. Prüfung der Android-Version:
   - **Android 11+**: Verwendet `WindowInsetsController`
   - **Android 10-**: Verwendet Legacy System UI Flags
4. Bei Fokuswechsel wird Vollbildmodus automatisch wiederhergestellt

## Testen

### Edge-to-Edge Kompatibilität testen:
1. App auf Android 15 (SDK 35) Gerät oder Emulator testen
2. Überprüfen, dass keine Layout-Probleme auftreten
3. System-Bars sollten korrekt behandelt werden
4. Content sollte nicht von System-Bars verdeckt werden (außer im Vollbildmodus)

### Vollbildmodus testen:
1. App starten
2. Statusleiste und Navigationsleiste sollten verschwinden
3. Von oben/unten wischen → Leisten erscheinen kurz und verschwinden wieder automatisch
4. App erneut fokussieren → Vollbildmodus wird wiederhergestellt

## Build-Prozess

Nach den Änderungen:
```bash
# 1. Dependencies installieren (falls noch nicht geschehen)
npm install

# 2. React-App bauen
npm run build

# 3. Mit Android synchronisieren
npx cap sync android

# 4. AAB erstellen (über Android Studio oder Kommandozeile)
cd android
./gradlew bundleRelease
```

Die AAB-Datei befindet sich dann unter:
`android/app/build/outputs/bundle/release/app-release.aab`

## Wichtige Hinweise

1. **Edge-to-Edge (Android 15)**: Ab Android 15 (SDK 35) ist Edge-to-Edge standardmäßig aktiviert. Die Implementierung mit `EdgeToEdge.enable()` gewährleistet Kompatibilität über alle Android-Versionen hinweg.

2. **Immersive Sticky Mode**: Die Systemleisten können vom Nutzer durch Wischen eingeblendet werden, verschwinden aber automatisch wieder. Das ist das gewünschte Verhalten für eine Wetter-App.

3. **Testing**: Teste die App auf verschiedenen Android-Versionen (mindestens Android 10, 11, 12, 13, 14 und 15), um sicherzustellen, dass sowohl Edge-to-Edge als auch Vollbildmodus überall funktioniert.

## Nächste Schritte

1. ✅ Änderungen wurden implementiert
2. ✅ Code wurde gebaut und synchronisiert
3. 📝 AAB erstellen und im Play Store hochladen
4. 🧪 Auf echtem Gerät testen
5. 👍 Im Play Store veröffentlichen

## Support

Falls Probleme auftreten:
- Logcat-Output prüfen: `adb logcat | grep -i "statusbar"`
- App-Berechtigungen in Android-Einstellungen prüfen
