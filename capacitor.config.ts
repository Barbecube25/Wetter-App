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
      // Enable geolocation plugin
    }
  }
};

export default config;
