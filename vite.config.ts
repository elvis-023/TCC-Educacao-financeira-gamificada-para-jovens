/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: {
    rolldownOptions: {
      output: {
        // Bibliotecas grandes ficam em arquivos próprios: o navegador guarda cada uma em cache e o arquivo do app encolhe.
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules[/]@supabase/ },
            { name: 'react', test: /node_modules[/](react|react-dom|react-router|scheduler)[/]/ },
            { name: 'consultas', test: /node_modules[/]@tanstack/ },
          ],
        },
      },
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
});
