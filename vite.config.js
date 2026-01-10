import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercelではルート、GitHub Pagesでは/todo_app/
const base = process.env.GITHUB_PAGES ? '/todo_app/' : '/';

export default defineConfig({
  plugins: [react()],
  base: base,
  server: {
    port: 3000,
    open: true
  }
});
