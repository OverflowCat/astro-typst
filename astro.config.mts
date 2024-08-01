import { defineConfig } from "astro/config";
import typst from "./src/lib/integration.js";

// https://astro.build/config
export default defineConfig({
    integrations: [typst()],
});
