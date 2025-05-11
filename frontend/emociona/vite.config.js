import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["validator"], // Asegúrate de incluir validator en las dependencias optimizadas
  },
  build: {
    rollupOptions: {
      external: [], // Asegúrate de que validator no esté marcado como externo
    },
  },
});