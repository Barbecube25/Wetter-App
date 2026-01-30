import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barbecubewetterscoutai.app',
  appName: 'WetterScoutAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      // Required for Geolocation plugin initialization
    },
    StatusBar: {
      // Enable fullscreen mode - hide status bar
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
