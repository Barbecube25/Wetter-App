# Android App Bundle (.aab) Build Guide

This guide explains how to build an Android App Bundle (.aab) file from this weather app for publishing on the Google Play Store.

## Prerequisites

- Node.js and npm installed
- Android Studio installed
- Java Development Kit (JDK) 17 or higher

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build Web App and Sync with Android

```bash
npm run android:sync
```

This command performs the following actions:
1. Builds the web app with Vite (`npm run build`)
2. Syncs the built files with the Android project (`npx cap sync android`)

## Step 3: Open Android Studio

```bash
npm run android:open
```

Or manually:
1. Open Android Studio
2. Select "Open an Existing Project"
3. Choose the `android` folder in this project

## Step 4: Create App Bundle (.aab) in Android Studio

### 4.1 Create Signing Key (first time only)

If you don't have a signing key yet:

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Click **Create new...** under Key store path
4. Fill in the fields:
   - **Key store path**: Choose a location (e.g., `~/wetter-app-keystore.jks`)
   - **Password**: Choose a secure password
   - **Alias**: e.g., `wetter-app-key`
   - **Password**: Password for the key
   - **Validity**: 25 years or more
   - **Certificate**: Enter your information

⚠️ **IMPORTANT**: Keep the keystore and passwords safe! You'll need them for all future app updates.

### 4.2 Build the App Bundle

1. **Build** → **Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Click **Next**
4. Select your keystore or create a new one (see 4.1)
5. Enter the passwords
6. Click **Next**
7. Select **release** as Build Variant
8. Optional: Enable both checkboxes for V1 and V2 Signature
9. Click **Create**

The .aab file will be created and the path will be displayed (usually in `android/app/release/app-release.aab`).

## Step 5: Test App Bundle (optional)

You can test the App Bundle locally with `bundletool`:

```bash
# Download bundletool (one-time)
# From https://github.com/google/bundletool/releases

# Generate APK set from AAB
java -jar bundletool.jar build-apks \
  --bundle=android/app/release/app-release.aab \
  --output=app.apks \
  --ks=~/wetter-app-keystore.jks \
  --ks-key-alias=wetter-app-key

# Install APK on connected device
java -jar bundletool.jar install-apks --apks=app.apks
```

## Step 6: Upload to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select an existing one
3. Navigate to **Release** → **Production** (or Testing)
4. Click **Create new release**
5. Upload the .aab file
6. Fill in the release notes
7. Follow the remaining steps to publish

## Increase Version

Before publishing an update, you must increase the version:

1. Open `android/app/build.gradle`
2. Increase `versionCode` (e.g., from 1 to 2)
3. Optional: Update `versionName` (e.g., from "1.0" to "1.1")

Example:
```gradle
defaultConfig {
    applicationId "com.barbecubewetterscoutai.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 16  // <- Increase
    versionName "16.0"  // <- Optional update
    ...
}
```

## Useful Commands

- `npm run dev` - Start development server for web app
- `npm run build` - Build web app for production
- `npm run android:sync` - Build web app and sync with Android
- `npm run android:open` - Open Android Studio with the project
- `npm run android:run` - Run app on a connected device/emulator

## Permissions

The app uses the following Android permissions:
- `INTERNET` - For accessing weather APIs
- `ACCESS_FINE_LOCATION` - For precise GPS location
- `ACCESS_COARSE_LOCATION` - For approximate location

These are already configured in `android/app/src/main/AndroidManifest.xml`.

## Troubleshooting

### Gradle Build Error
If the build fails:
```bash
cd android
./gradlew clean
cd ..
npm run android:sync
```

### Android Studio Cannot Open Project
Make sure to open the `android` folder, not the root folder.

### App Shows Blank Screen
Check if `npm run build` was successful and run `npx cap sync android` again.

## Additional Information

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [Google Play Console](https://play.google.com/console)
