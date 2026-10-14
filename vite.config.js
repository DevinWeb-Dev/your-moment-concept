import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],

  // LOCAL DEVELOPMENT:
  // http://localhost:5173/
  //
  // GITHUB PAGES:
  // /your-moment-concept/

  base:
    process.env.GITHUB_ACTIONS === "true"
      ? "/your-moment-concept/"
      : "/",

  build: {
    outDir: "dist",

    sourcemap: false,

    emptyOutDir: true,
  },
});