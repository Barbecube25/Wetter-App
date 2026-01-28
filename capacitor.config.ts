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
    }
  }
};

export default config;
