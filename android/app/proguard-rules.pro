# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor WebView JavaScript Bridge - Keep all classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Capacitor Bridge classes
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Keep WebView related classes
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Keep Cordova classes (used by Capacitor plugins)
-keep class org.apache.cordova.** { *; }

# Keep attributes for proper stack traces
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*

# Geolocation Plugin
-keep class com.capacitorjs.plugins.geolocation.** { *; }

# Status Bar Plugin  
-keep class com.capacitorjs.plugins.statusbar.** { *; }

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
