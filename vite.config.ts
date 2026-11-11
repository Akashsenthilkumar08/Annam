import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          register: path.resolve(__dirname, 'register.html'),
          donor: path.resolve(__dirname, 'donor.html'),
          volunteer: path.resolve(__dirname, 'volunteer.html'),
          recipient: path.resolve(__dirname, 'recipient.html'),
          tracking: path.resolve(__dirname, 'tracking.html'),
          impact: path.resolve(__dirname, 'impact.html'),
        },
      },
    },
  };
});
