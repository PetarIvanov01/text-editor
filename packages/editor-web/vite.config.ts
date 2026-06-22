import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@learning-editor/editor-core": fileURLToPath(
        new URL("../editor-core/src/index.ts", import.meta.url)
      )
    }
  }
});
