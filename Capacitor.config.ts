import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenmanager.app',
  appName: 'GreenManager',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'ionic'
  },
  ios: {
    scheme: 'App',
    contentInset: 'always',
    preferredContentMode: 'mobile',
    minVersion: '13.0',
    backgroundColor: '#4CAF50'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4CAF50",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersiveSetting: true
    }
  }
};

export default config;
