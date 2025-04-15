import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"],
    },
    server: {
      port: 5173,
      host: true,
      strictPort: true,
      open: true,
      hmr: {
        overlay: false,
      },
      watch: {
        usePolling: true,
      },
    },
    build: {
      sourcemap: mode === "development",
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) {
                return "react-vendor";
              }
              if (id.includes("firebase")) {
                return "firebase-vendor";
              }
              if (
                id.includes("framer-motion") ||
                id.includes("react-hot-toast") ||
                id.includes("lucide-react")
              ) {
                return "ui-vendor";
              }
              return "vendor";
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      target: "esnext",
    },
    esbuild: {
      logOverride: {
        "this-is-undefined-in-esm": "silent",
        "unsupported-jsx-comment": "silent",
      },
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  };
});
