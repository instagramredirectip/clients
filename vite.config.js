import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function removeCrossOriginPlugin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html) {
      return html
        .replace(/<link rel="stylesheet" crossorigin href=/g, '<link rel="stylesheet" href=')
        .replace(/<link rel="stylesheet" crossorigin="[^"]*" href=/g, '<link rel="stylesheet" href=');
    }
  };
}

export default defineConfig({
  plugins: [react(), removeCrossOriginPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
