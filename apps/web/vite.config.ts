import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Local-first SPA. Workspace source packages (@pc-manager/engine and
// @pc-manager/content-srd) are imported as TypeScript and transpiled by Vite —
// no separate build step for them.
export default defineConfig({
  plugins: [react()],
});
