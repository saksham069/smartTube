import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isContentScript = mode === "content";
  
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: isContentScript 
          ? resolve(__dirname, "src/content.tsx")
          : resolve(__dirname, "popup/index.html"),
        output: {
          entryFileNames: isContentScript ? "content.js" : "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
          format: isContentScript ? "iife" : "es",
        },
      },
      outDir: "dist",
      emptyOutDir: !isContentScript, // Don't empty when building content script
      target: "es2020",
      minify: true,
      sourcemap: false,
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    },
  };
});
