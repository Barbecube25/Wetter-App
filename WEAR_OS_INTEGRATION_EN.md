# Wear OS Integration

This app now supports Wear OS (smartwatches)! The integration enables the app to be displayed in the Google Play Store for both smartphones and smartwatches.

## What was added?

### 1. Wear OS Module (`android/wear/`)
A separate Android module was created for the Wear OS version of the app:
- **MainActivity.kt**: A simple Wear OS activity with Jetpack Compose
- **AndroidManifest.xml**: Wear OS specific manifest configuration
- **build.gradle**: Wear OS dependencies and configuration

### 2. Main App Manifest Update
The main app (`android/app/src/main/AndroidManifest.xml`) was updated with:
```xml
<uses-feature android:name="android.hardware.type.watch" android:required="false" />
```
This signals to the Play Store that the app can run on Wear OS, but it's not mandatory.

### 3. Project Structure Update
The `settings.gradle` was updated to include the Wear OS module:
```gradle
include ':wear'
```

## Play Store Integration

When you create an AAB (Android App Bundle) that includes both the `:app` and `:wear` modules, Google Play Store will automatically:

1. Display the app for both smartphones and smartwatches
2. Install the correct version on each device type
3. Manage both versions through a single Play Store listing

## Build Instructions

### Build Wear OS module individually:
```bash
cd android
./gradlew :wear:assembleDebug
```

### Create AAB with Wear OS support:
```bash
# Option 1: Use the helper script
npm run build:wear

# Option 2: Manual build
cd android
./gradlew bundleRelease
```

The resulting AAB contains both modules (App + Wear) and the Play Store will automatically deliver the correct version on each device.

## Features of the Wear OS App

The Wear OS version currently displays:
- App name ("Wetter Scout AI")
- "Wear OS" label
- Time display at the top (TimeText)
- Material Design for Wear OS

## Future Extensions

The Wear OS app can be extended to:
- Sync weather data from the main app
- Complications for watch faces
- Tiles for quick access to weather data
- Notifications for weather alerts

## Important Notes

1. **Wear OS API Level**: The Wear OS module requires at least Android API Level 30 (Android 11)
2. **Standalone App**: The Wear OS app is marked as standalone (`com.google.android.wearable.standalone = true`), meaning it can work independently of a paired smartphone
3. **Play Store Visibility**: After uploading the AAB, the app will automatically appear in the Wear OS category of the Play Store

## Testing

To test the Wear OS version:
1. Use a Wear OS emulator in Android Studio
2. Or test on a real Wear OS device
3. Install the debug APK with: `./gradlew :wear:installDebug`

## Available Scripts

- `npm run build:wear` - Build AAB with both mobile and Wear OS versions
- See `build-with-wear.sh` for the complete build process
