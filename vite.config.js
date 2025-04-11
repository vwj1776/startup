import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src', // Change this to the folder containing index.html
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // match your Express server port
    }
  },
});
