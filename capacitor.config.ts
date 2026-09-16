import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.toddlerjoy.learning',
  appName: '宝贝启蒙乐园',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
