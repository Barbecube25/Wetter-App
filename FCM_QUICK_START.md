# 🚀 Quick Start: Android Push Notifications Setup

## Was wurde implementiert? / What was implemented?

✅ **Notification Channel** für Android 8.0+ (API 26+)  
✅ **Firebase Cloud Messaging (FCM)** Service  
✅ **AndroidManifest.xml** konfiguriert  
✅ **Firebase Dependencies** hinzugefügt  
✅ **Local Notifications** mit Channel ID aktualisiert  

---

## ⚡ Schnellstart für Entwickler / Quick Start for Developers

### 1️⃣ Firebase Projekt erstellen / Create Firebase Project

1. Gehe zu → [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf **"Projekt hinzufügen"** / **"Add project"**
3. Folge dem Setup-Assistenten

### 2️⃣ Android App hinzufügen / Add Android App

1. Im Firebase Projekt: Klicke auf das **Android-Symbol** ⚙️
2. **Android-Paketname eingeben** / **Enter package name**:
   ```
   com.barbecubewetterscoutai.app
   ```
3. Optional: App-Spitzname eingeben: `WetterScoutAI`
4. Klicke auf **"App registrieren"** / **"Register app"**

### 3️⃣ google-services.json herunterladen / Download google-services.json

1. Lade die `google-services.json` Datei herunter
2. **Speicherort** / **Location**:
   ```
   Wetter-App/android/app/google-services.json
   ```
3. ⚠️ **WICHTIG**: Diese Datei wird **NICHT** ins Git committed (steht in `.gitignore`)

### 4️⃣ Build & Test

```bash
# 1. Webseite bauen / Build web app
npm run build

# 2. Mit Android synchronisieren / Sync with Android
npx cap sync android

# 3. In Android Studio öffnen / Open in Android Studio
npx cap open android

# 4. App auf Gerät/Emulator starten / Run on device/emulator
# Drücke "Run" in Android Studio oder:
# Press "Run" in Android Studio or:
npm run android:run
```

### 5️⃣ FCM Token abrufen / Get FCM Token

Der FCM Token wird automatisch in den Logs angezeigt:

```bash
# Android Studio LogCat:
# Filter: "FCMService"
# Suche nach: "Refreshed token:"
```

Oder füge temporär diesen Code in deine App ein:

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// Im useEffect beim App-Start
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', (token) => {
  console.log('📱 FCM Token:', token.value);
  alert('Token: ' + token.value); // Für schnelles Kopieren
});
```

### 6️⃣ Test-Nachricht senden / Send Test Message

#### Option A: Firebase Console (Einfach / Easy)

1. Firebase Console → **Cloud Messaging**
2. **"Erste Nachricht senden"** / **"Send your first message"**
3. **Benachrichtigungstext** / **Notification text**:
   - Titel: `WetterScoutAI Test`
   - Text: `Push Notifications funktionieren! 🎉`
4. **Ziel** / **Target**: Wähle dein Gerät oder Token
5. **Zusätzliche Optionen** / **Additional options**:
   - Android-Benachrichtigungskanal: `default_channel`
6. **Überprüfen** und **Veröffentlichen**

#### Option B: curl (Fortgeschritten / Advanced)

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=DEIN_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEIN_DEVICE_TOKEN",
    "notification": {
      "title": "WetterScoutAI Test",
      "body": "Dies ist eine Test-Benachrichtigung!",
      "android_channel_id": "default_channel"
    }
  }'
```

**Server Key finden** / **Find Server Key**:  
Firebase Console → Projekteinstellungen → Cloud Messaging → Server-Schlüssel

---

## ✅ Checkliste / Checklist

- [ ] Firebase Projekt erstellt / Firebase project created
- [ ] Android App hinzugefügt / Android app added
- [ ] `google-services.json` heruntergeladen / downloaded
- [ ] `google-services.json` nach `android/app/` kopiert / copied to `android/app/`
- [ ] `npm run build && npx cap sync android` ausgeführt / executed
- [ ] App in Android Studio geöffnet / opened in Android Studio
- [ ] App auf Gerät/Emulator gestartet / run on device/emulator
- [ ] FCM Token in Logs gefunden / found in logs
- [ ] Test-Nachricht gesendet / sent test message
- [ ] Benachrichtigung empfangen ✅ / notification received ✅

---

## 🐛 Probleme? / Trouble?

### Benachrichtigungen kommen nicht an / Notifications not arriving?

1. **Überprüfe LogCat** / **Check LogCat**:
   ```bash
   adb logcat | grep -E "FCMService|MainActivity"
   ```

2. **Notification Channel prüfen** / **Check notification channel**:
   - Einstellungen → Apps → WetterScoutAI → Benachrichtigungen
   - Settings → Apps → WetterScoutAI → Notifications

3. **Google Play Services** aktuell? / **up to date?**
   - Einstellungen → Apps → Google Play Services
   - Settings → Apps → Google Play Services

4. **Energiesparmodus** / **Battery saver**:
   - Einstellungen → Apps → WetterScoutAI → Akku
   - Setze auf "Keine Einschränkungen" / Set to "No restrictions"

5. **Test im Vordergrund** / **Test in foreground**:
   - Öffne die App / Open the app
   - Sende Test-Nachricht / Send test message
   - Funktioniert es jetzt? → Energiespareinstellungen prüfen
   - Does it work now? → Check battery settings

---

## 📚 Weitere Infos / More Info

Siehe ausführliche Dokumentation / See detailed documentation:
- [ANDROID_NOTIFICATION_SETUP.md](./ANDROID_NOTIFICATION_SETUP.md)

---

## 🆘 Support

Bei Problemen / For issues:
1. Überprüfe die Logs / Check logs
2. Siehe Troubleshooting in [ANDROID_NOTIFICATION_SETUP.md](./ANDROID_NOTIFICATION_SETUP.md)
3. Erstelle ein Issue auf GitHub

---

**Version**: 1.0  
**Erstellt für** / **Created for**: WetterScoutAI v15.0  
**Stand** / **Last Updated**: Januar 2026
