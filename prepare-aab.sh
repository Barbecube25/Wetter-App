#!/bin/bash

# Wetter-App: Vorbereitung für AAB-Build
# Dieses Script bereitet das Projekt für den AAB-Build vor

set -e

echo "=========================================="
echo "Wetter-App: AAB-Build Vorbereitung"
echo "=========================================="
echo ""

# Schritt 1: Dependencies installieren
echo "1. Installiere Node.js Dependencies..."
npm install
echo "✓ Dependencies installiert"
echo ""

# Schritt 2: Web-App bauen
echo "2. Baue Web-App..."
npm run build
echo "✓ Web-App gebaut"
echo ""

# Schritt 3: Mit Android synchronisieren
echo "3. Synchronisiere mit Android..."
npx cap sync android
echo "✓ Android-Projekt synchronisiert"
echo ""

# Schritt 4: Gradle Wrapper ausführbar machen (falls nötig)
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
    echo "✓ Gradle Wrapper ist ausführbar"
fi
echo ""

echo "=========================================="
echo "Vorbereitung abgeschlossen!"
echo "=========================================="
echo ""
echo "Nächste Schritte:"
echo "1. Öffnen Sie Android Studio: npm run android:open"
echo "2. Oder öffnen Sie manuell: Android Studio → Open → android Ordner"
echo "3. Folgen Sie der Anleitung in BUILD_AAB_ANLEITUNG.md"
echo "4. Für Keystore-Setup siehe: android/KEYSTORE_SETUP.md"
echo ""
echo "Oder bauen Sie die AAB direkt mit:"
echo "  cd android && ./gradlew bundleRelease"
echo "  (Erfordert konfigurierte Keystore-Datei)"
echo ""
