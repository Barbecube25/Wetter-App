# 🧪 Testing Checklist for Android Notifications

## ✅ Pre-Testing Setup / Vorbereitungs-Setup

### 1. Firebase Configuration
- [ ] Firebase project created at https://console.firebase.google.com/
- [ ] Android app added with package: `com.barbecubewetterscoutai.app`
- [ ] `google-services.json` downloaded
- [ ] `google-services.json` placed in `android/app/` directory
- [ ] File not committed to git (check with `git status`)

### 2. Build Setup
- [ ] Dependencies installed: `npm install`
- [ ] Web app built: `npm run build`
- [ ] Android synced: `npx cap sync android`
- [ ] No build errors shown
- [ ] Android Studio opened: `npx cap open android`

### 3. Device/Emulator Setup
- [ ] Using Android 8.0+ (API 26+) device or emulator
- [ ] Google Play Services installed (for physical device/Play Store emulator)
- [ ] Device/emulator connected: `adb devices` shows device
- [ ] USB debugging enabled (for physical device)

---

## 📱 Test 1: App Installation & Permissions

### Steps:
1. [ ] Build and run app from Android Studio
2. [ ] App launches successfully
3. [ ] App requests notification permission (Android 13+)
4. [ ] Grant notification permission
5. [ ] App doesn't crash on startup

### Verify:
- [ ] No crash logs in LogCat
- [ ] MainActivity logs show: "Notification channels created successfully"
- [ ] Settings → Apps → WetterScoutAI → Notifications shows "Enabled"

---

## 🔔 Test 2: Notification Channel Creation

### Check in Android Settings:
1. [ ] Open Settings → Apps → WetterScoutAI
2. [ ] Tap "Notifications"
3. [ ] Verify "Default Notifications" channel exists
4. [ ] Channel is enabled by default

### Check in LogCat:
```bash
adb logcat | grep "Notification channels created"
```
- [ ] Log appears: "Notification channels created successfully"

---

## 📋 Test 3: Local Notifications (Existing Feature)

### Setup:
1. [ ] Open WetterScoutAI app
2. [ ] Go to Settings (⚙️)
3. [ ] Enable "Tägliche Wettervorhersage" / "Daily weather forecast"
4. [ ] Enable "Ausblick auf morgen" / "Next day outlook"
5. [ ] Set notification time to 1-2 minutes from now

### Verify:
- [ ] Wait for notification time
- [ ] Notification appears with weather information
- [ ] Notification has proper icon
- [ ] Tapping notification opens app
- [ ] No crash when notification appears

### Check Notification Details:
- [ ] Has title and body
- [ ] Shows in notification tray
- [ ] Can be expanded
- [ ] Has default sound/vibration
- [ ] Auto-dismisses when tapped

---

## 🔥 Test 4: Firebase Cloud Messaging Token

### Get Token:
1. [ ] Open Android Studio LogCat
2. [ ] Filter by "FCMService"
3. [ ] Look for "Refreshed token:" in logs
4. [ ] Token appears (long string starting with something like "d...")

### Alternative Method (if not in logs):
Add temporary code to get token:
```javascript
import { PushNotifications } from '@capacitor/push-notifications';

PushNotifications.requestPermissions().then(result => {
  if (result.receive === 'granted') {
    PushNotifications.register();
  }
});

PushNotifications.addListener('registration', (token) => {
  console.log('📱 FCM Token:', token.value);
});
```
- [ ] Token appears in browser console or LogCat
- [ ] Copy token for next test

---

## 📤 Test 5: Send Test Push Notification

### Option A: Firebase Console (Recommended)
1. [ ] Go to Firebase Console → Cloud Messaging
2. [ ] Click "Send your first message"
3. [ ] Enter title: "Test Notification"
4. [ ] Enter body: "This is a test from Firebase! 🎉"
5. [ ] Click "Send test message"
6. [ ] Paste your FCM token
7. [ ] Click "Test"

### Option B: curl Command
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_DEVICE_TOKEN",
    "notification": {
      "title": "WetterScoutAI Test",
      "body": "Push notification working! 🎉",
      "android_channel_id": "default_channel"
    }
  }'
```
- [ ] Replace YOUR_SERVER_KEY with server key from Firebase
- [ ] Replace YOUR_DEVICE_TOKEN with token from previous test

### Verify:
- [ ] Notification received on device
- [ ] Has correct title and body
- [ ] Shows proper icon
- [ ] Appears in notification tray
- [ ] Tapping opens app

---

## 🎯 Test 6: Foreground vs Background

### Foreground Test:
1. [ ] Open WetterScoutAI app
2. [ ] Keep app in foreground
3. [ ] Send test notification (Firebase Console or curl)
4. [ ] Notification appears

### Background Test:
1. [ ] Open WetterScoutAI app
2. [ ] Press Home button (app goes to background)
3. [ ] Send test notification
4. [ ] Notification appears

### Locked Screen Test:
1. [ ] Lock device screen
2. [ ] Send test notification
3. [ ] Notification appears on lock screen

### Verify All Scenarios:
- [ ] Foreground: Notification appears ✅
- [ ] Background: Notification appears ✅
- [ ] Locked: Notification appears ✅

---

## 🔍 Test 7: Multiple Notifications

### Send Multiple:
1. [ ] Send 3-5 test notifications in quick succession
2. [ ] Each should appear separately
3. [ ] Notification IDs should be unique

### Verify:
- [ ] All notifications appear in notification tray
- [ ] They don't replace each other
- [ ] Each can be individually dismissed
- [ ] Each opens app when tapped

---

## ⚙️ Test 8: Notification Settings

### Disable/Enable:
1. [ ] Settings → Apps → WetterScoutAI → Notifications
2. [ ] Disable "Default Notifications"
3. [ ] Send test notification
4. [ ] Notification should NOT appear ❌
5. [ ] Re-enable "Default Notifications"
6. [ ] Send test notification
7. [ ] Notification SHOULD appear ✅

### Sound/Vibration:
1. [ ] In channel settings, enable/disable sound
2. [ ] Send test notification
3. [ ] Verify sound respects setting
4. [ ] Test vibration setting similarly

---

## 🔋 Test 9: Battery Optimization

### Check Battery Settings:
1. [ ] Settings → Apps → WetterScoutAI → Battery
2. [ ] Should show "No restrictions" or "Unrestricted"
3. [ ] If restricted, change to unrestricted

### Test with Restrictions (Optional):
1. [ ] Set battery to "Restricted"
2. [ ] Lock device for 5+ minutes
3. [ ] Send test notification
4. [ ] May not appear immediately (this is expected behavior)
5. [ ] Restore to "No restrictions"

---

## 📊 Test 10: LogCat Verification

### Check Logs:
```bash
# All notification-related logs
adb logcat | grep -E "FCMService|MainActivity|LocalNotifications"

# Only FCM logs
adb logcat | grep FCMService

# Only errors
adb logcat | grep -E "ERROR|Exception"
```

### Verify Log Messages:
- [ ] "Notification channels created successfully" appears on app start
- [ ] "Refreshed token:" appears with FCM token
- [ ] "Message Notification Title:" appears when notification received
- [ ] "Notification sent:" appears when notification displayed
- [ ] No error messages related to notifications

---

## ✅ Final Verification Checklist

### Code Implementation:
- [✅] Notification Channel created (in code)
- [✅] Firebase Messaging Service implemented
- [✅] AndroidManifest.xml configured
- [✅] Firebase dependencies added
- [✅] Local notifications use channel ID

### Configuration:
- [ ] google-services.json in place
- [ ] Build succeeds
- [ ] No build warnings about notifications
- [ ] No runtime errors

### Functionality:
- [ ] Local notifications work
- [ ] Push notifications work
- [ ] Notifications appear in foreground
- [ ] Notifications appear in background
- [ ] Notifications appear on lock screen
- [ ] Multiple notifications don't replace each other
- [ ] Tapping notification opens app

### Settings:
- [ ] Notification permission granted
- [ ] Channel visible in settings
- [ ] Channel can be disabled/enabled
- [ ] Battery optimization set to unrestricted

---

## 🐛 Troubleshooting

### Notifications Not Appearing?

#### 1. Check Permissions
```bash
adb shell dumpsys package com.barbecubewetterscoutai.app | grep "permission"
```
Look for: `android.permission.POST_NOTIFICATIONS: granted=true`

#### 2. Check Channel
```bash
adb shell dumpsys notification
```
Look for: `default_channel` in output

#### 3. Check Google Play Services
- Settings → Apps → Google Play Services
- Should be up to date
- Not disabled

#### 4. Check LogCat for Errors
```bash
adb logcat | grep -E "ERROR|Exception" | grep -i notification
```

#### 5. Verify FCM Token
- Token should start appearing in logs
- If null, check google-services.json placement

### Common Issues:

| Problem | Solution |
|---------|----------|
| No token in logs | Check google-services.json in android/app/ |
| Build fails | Run `npx cap sync android` again |
| Permission denied | Grant notification permission manually |
| No sound | Check Do Not Disturb mode |
| Battery kill | Set to "No restrictions" |

---

## 📝 Test Report Template

After completing tests, document results:

```markdown
## Test Report

**Date**: [Date]
**Tester**: [Your Name]
**Device**: [Model and Android Version]
**Build**: [Git commit hash]

### Results:
- [ ] Local Notifications: PASS / FAIL
- [ ] Push Notifications: PASS / FAIL
- [ ] Foreground: PASS / FAIL
- [ ] Background: PASS / FAIL
- [ ] Lock Screen: PASS / FAIL
- [ ] Multiple Notifications: PASS / FAIL
- [ ] Settings Integration: PASS / FAIL

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Any additional observations]
```

---

## 🎉 Success Criteria

All tests PASS when:
- ✅ No crashes or errors
- ✅ Notifications appear in all scenarios
- ✅ FCM token successfully retrieved
- ✅ Test push notifications received
- ✅ Local scheduled notifications work
- ✅ Settings integration works
- ✅ No build warnings

---

**Version**: 1.0  
**Created**: January 2026  
**For**: WetterScoutAI v15.0

See also:
- [ANDROID_NOTIFICATION_SETUP.md](./ANDROID_NOTIFICATION_SETUP.md) - Setup guide
- [FCM_QUICK_START.md](./FCM_QUICK_START.md) - Quick start
