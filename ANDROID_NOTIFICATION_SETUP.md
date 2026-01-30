# Android Benachrichtigungs-Setup / Android Notification Setup

## 🇩🇪 Deutsch

### Übersicht

Die WetterScoutAI App nutzt sowohl **Local Notifications** (für geplante tägliche Benachrichtigungen) als auch **Firebase Cloud Messaging (FCM)** für Push-Benachrichtigungen.

### ✅ Implementierte Funktionen

#### 1. Notification Channel (Android 8.0+ / API 26+)

**Problem gelöst**: Ohne einen gültigen Notification Channel werden Benachrichtigungen auf Android 8.0+ vom System verworfen.

**Lösung**:
- Notification Channel wird beim App-Start in `MainActivity.java` erstellt
- Channel ID: `default_channel`
- Channel Name: `Default Notifications`
- Importance: `IMPORTANCE_DEFAULT`

#### 2. Firebase Cloud Messaging Service

**Datei**: `MyFirebaseMessagingService.java`

**Funktionen**:
- Empfängt Push-Nachrichten von FCM
- Erstellt automatisch Notification Channel beim Service-Start
- Verarbeitet Notification Payload und Data Payload
- Loggt FCM-Token für Debugging

**Service registriert in**: `AndroidManifest.xml`

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

#### 3. AndroidManifest.xml Konfiguration

**Hinzugefügte Elemente**:
- Firebase Messaging Service
- Default Notification Channel Meta-Data
- POST_NOTIFICATIONS Berechtigung (bereits vorhanden)

#### 4. Firebase Dependencies

**Hinzugefügt in** `app/build.gradle`:
```gradle
implementation platform('com.google.firebase:firebase-bom:33.7.0')
implementation 'com.google.firebase:firebase-messaging'
implementation 'com.google.firebase:firebase-analytics'
```

#### 5. Local Notifications mit Channel ID

**Aktualisiert**: `src/App.jsx`
- Alle geplanten Benachrichtigungen nutzen jetzt `channelId: 'default_channel'`
- SmallIcon konfiguriert: `ic_stat_icon_config_sample`

### 🔧 Setup für Entwickler

#### Schritt 1: Google Services JSON hinzufügen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus
3. Füge eine Android-App hinzu:
   - Package Name: `com.barbecubewetterscoutai.app`
4. Lade die `google-services.json` herunter
5. Platziere sie in: `android/app/google-services.json`

#### Schritt 2: Build und Deploy

```bash
# Build die App
npm run build

# Sync mit Android
npx cap sync android

# Öffne in Android Studio
npx cap open android
```

#### Schritt 3: FCM Token abrufen

Um den FCM Token in der Konsole anzuzeigen, kannst du temporär diesen Code hinzufügen:

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// In useEffect oder beim App-Start
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', (token) => {
  console.log('FCM Token:', token.value);
});
```

### 📱 Push-Nachricht manuell testen

#### Mit curl:

```bash
curl -X POST -H "Authorization: key=DEIN_SERVER_KEY" \
   -H "Content-Type: application/json" \
   -d '{
  "to": "DEIN_DEVICE_TOKEN",
  "notification": {
    "title": "WetterScoutAI Test",
    "body": "Dies ist eine Test-Benachrichtigung!",
    "android_channel_id": "default_channel"
  }
}' https://fcm.googleapis.com/fcm/send
```

#### Mit Firebase Console:

1. Gehe zu Firebase Console → Cloud Messaging
2. Klicke auf "Send your first message"
3. Gib Titel und Text ein
4. Wähle deine App aus
5. Erweiterte Optionen → Android Notification Channel: `default_channel`
6. Sende die Nachricht

### ⚠️ Wichtige Hinweise

#### Google Play Services erforderlich

FCM benötigt Google Play Services auf dem Gerät:
- **Emulator**: Nutze einen Emulator mit "Google Play Store" Support
- **Physisches Gerät**: Stelle sicher, dass Google Play Services installiert und aktualisiert sind

#### Energiesparmodus / Background-Killer

Einige Hersteller (Xiaomi, Samsung, Huawei) schließen Apps aggressiv im Hintergrund:
- Gehe zu: App-Info → Akku / Energiesparen
- Setze auf: "Keine Einschränkungen"

#### Android 13+ Berechtigung

Ab Android 13 (API 33) ist die `POST_NOTIFICATIONS` Berechtigung erforderlich:
- Wird automatisch beim ersten App-Start angefragt
- Kann in den Systemeinstellungen nachträglich erteilt werden

### 🐛 Debugging

#### Benachrichtigungen kommen nicht an?

1. **Überprüfe den Notification Channel**:
   ```bash
   adb shell dumpsys notification_listener
   ```

2. **Logge das FCM Token**:
   - Suche in LogCat nach "FCM Token" oder "Refreshed token"

3. **Überprüfe Google Play Services**:
   - Gehe zu: Einstellungen → Apps → Google Play Services
   - Stelle sicher, dass es aktuell ist

4. **Teste im Vordergrund**:
   - Öffne die App
   - Sende eine Test-Nachricht
   - Wenn sie im Vordergrund ankommt, aber nicht im Hintergrund, prüfe Energiespareinstellungen

5. **LogCat Ausgabe**:
   ```bash
   adb logcat | grep -E "FCMService|MainActivity|LocalNotifications"
   ```

### 📋 Checkliste

- [x] Notification Channel erstellt
- [x] FirebaseMessagingService implementiert
- [x] AndroidManifest.xml konfiguriert
- [x] Firebase Dependencies hinzugefügt
- [x] Local Notifications mit Channel ID aktualisiert
- [ ] google-services.json hinzugefügt (muss vom Entwickler gemacht werden)
- [ ] FCM Token in Logs verifiziert
- [ ] Test-Nachricht erfolgreich gesendet

---

## 🇬🇧 English

### Overview

The WetterScoutAI app uses both **Local Notifications** (for scheduled daily notifications) and **Firebase Cloud Messaging (FCM)** for push notifications.

### ✅ Implemented Features

#### 1. Notification Channel (Android 8.0+ / API 26+)

**Problem solved**: Without a valid Notification Channel, notifications are discarded by the system on Android 8.0+.

**Solution**:
- Notification Channel is created at app startup in `MainActivity.java`
- Channel ID: `default_channel`
- Channel Name: `Default Notifications`
- Importance: `IMPORTANCE_DEFAULT`

#### 2. Firebase Cloud Messaging Service

**File**: `MyFirebaseMessagingService.java`

**Functions**:
- Receives push messages from FCM
- Automatically creates Notification Channel on service start
- Processes Notification Payload and Data Payload
- Logs FCM token for debugging

**Service registered in**: `AndroidManifest.xml`

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

#### 3. AndroidManifest.xml Configuration

**Added elements**:
- Firebase Messaging Service
- Default Notification Channel Meta-Data
- POST_NOTIFICATIONS permission (already present)

#### 4. Firebase Dependencies

**Added in** `app/build.gradle`:
```gradle
implementation platform('com.google.firebase:firebase-bom:33.7.0')
implementation 'com.google.firebase:firebase-messaging'
implementation 'com.google.firebase:firebase-analytics'
```

#### 5. Local Notifications with Channel ID

**Updated**: `src/App.jsx`
- All scheduled notifications now use `channelId: 'default_channel'`
- SmallIcon configured: `ic_stat_icon_config_sample`

### 🔧 Setup for Developers

#### Step 1: Add Google Services JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add an Android app:
   - Package Name: `com.barbecubewetterscoutai.app`
4. Download the `google-services.json`
5. Place it in: `android/app/google-services.json`

#### Step 2: Build and Deploy

```bash
# Build the app
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### Step 3: Get FCM Token

To display the FCM token in the console, you can temporarily add this code:

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

// In useEffect or at app startup
PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', (token) => {
  console.log('FCM Token:', token.value);
});
```

### 📱 Test Push Message Manually

#### With curl:

```bash
curl -X POST -H "Authorization: key=YOUR_SERVER_KEY" \
   -H "Content-Type: application/json" \
   -d '{
  "to": "YOUR_DEVICE_TOKEN",
  "notification": {
    "title": "WetterScoutAI Test",
    "body": "This is a test notification!",
    "android_channel_id": "default_channel"
  }
}' https://fcm.googleapis.com/fcm/send
```

#### With Firebase Console:

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and text
4. Select your app
5. Advanced options → Android Notification Channel: `default_channel`
6. Send the message

### ⚠️ Important Notes

#### Google Play Services Required

FCM requires Google Play Services on the device:
- **Emulator**: Use an emulator with "Google Play Store" support
- **Physical Device**: Ensure Google Play Services is installed and updated

#### Battery Saver / Background Killer

Some manufacturers (Xiaomi, Samsung, Huawei) aggressively close apps in the background:
- Go to: App Info → Battery / Power saving
- Set to: "No restrictions"

#### Android 13+ Permission

From Android 13 (API 33), the `POST_NOTIFICATIONS` permission is required:
- Automatically requested on first app launch
- Can be granted later in system settings

### 🐛 Debugging

#### Notifications not arriving?

1. **Check the Notification Channel**:
   ```bash
   adb shell dumpsys notification_listener
   ```

2. **Log the FCM Token**:
   - Look in LogCat for "FCM Token" or "Refreshed token"

3. **Check Google Play Services**:
   - Go to: Settings → Apps → Google Play Services
   - Ensure it's up to date

4. **Test in Foreground**:
   - Open the app
   - Send a test message
   - If it arrives in foreground but not background, check power settings

5. **LogCat Output**:
   ```bash
   adb logcat | grep -E "FCMService|MainActivity|LocalNotifications"
   ```

### 📋 Checklist

- [x] Notification Channel created
- [x] FirebaseMessagingService implemented
- [x] AndroidManifest.xml configured
- [x] Firebase Dependencies added
- [x] Local Notifications updated with Channel ID
- [ ] google-services.json added (must be done by developer)
- [ ] FCM Token verified in logs
- [ ] Test message successfully sent

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Created for**: WetterScoutAI v15.0
