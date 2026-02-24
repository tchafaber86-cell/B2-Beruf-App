import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.berufsdeutsch.app',
  appName: 'BerufsDeutsch',
  server: {
  url: "https://b2-beruf-app.vercel.app",
  cleartext: false
}
};

export default config;
