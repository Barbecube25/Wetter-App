#!/bin/bash
# Build script for Wear OS enabled AAB
# This script builds an Android App Bundle that includes both the mobile app and Wear OS module

set -e
set -u

echo "🏗️  Building Wetter Scout AI with Wear OS support..."
echo ""

# Step 1: Build the web app
echo "📦 Step 1/4: Building web application..."
npm run build

# Step 2: Sync with Android
echo "🔄 Step 2/4: Syncing with Android project..."
npx cap sync android

# Step 3: Navigate to Android directory
echo "📂 Step 3/4: Navigating to Android project..."
cd android

# Step 4: Build the AAB with both modules
echo "🎯 Step 4/4: Building Android App Bundle with Wear OS..."
echo "  - This will include both the mobile app (:app) and Wear OS module (:wear)"
echo "  - The Play Store will automatically show your app as compatible with watches"
echo ""

# Build release bundle
./gradlew bundleRelease

echo ""
echo "✅ Build complete!"
echo ""
echo "📍 Your AAB file location:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📱 The AAB includes:"
echo "   - Mobile app for smartphones"
echo "   - Wear OS app for smartwatches"
echo ""
echo "🚀 Next steps:"
echo "   1. Sign the AAB with your release keystore (if not configured in build.gradle)"
echo "   2. Upload to Google Play Console"
echo "   3. The Play Store will automatically display your app for both phones and watches"
echo ""
