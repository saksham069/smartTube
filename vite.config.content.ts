import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, "src/content.tsx"),
      output: {
        entryFileNames: "content.js",
        format: "iife",
      },
    },
    outDir: "dist",
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
    lib: {
      entry: resolve(__dirname, "src/content.tsx"),
      formats: ["iife"],
      name: "ContentScript",
      fileName: () => "content.js",
    },
  },
});
