import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wetter.daubenrath',
  appName: 'Wetter Daubenrath',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
