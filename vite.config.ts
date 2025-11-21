import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente (es. da .env o Netlify Environment Variables)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    base: './', // Percorsi relativi per compatibilità massima
    define: {
      // Sostituisce process.env.API_KEY con il valore reale durante la build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Previene crash se altre parti del codice usano process.env
      'process.env': {}
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        // @google/genai è caricato via CDN (importmap) in index.html
        external: ['@google/genai'],
        output: {
          globals: {
            '@google/genai': 'GoogleGenAI'
          }
        }
      }
    }
  }
})