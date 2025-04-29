import { defineConfig } from "astro/config";
import typst from "./src/lib/integration.js";
import { type AstroIntegration } from "astro";

const debug: AstroIntegration = {
    name: "astro-typst-debug-dont-use-or-you-will-be-fired",
    hooks: {
        "astro:config:setup": () => {
            process.env.ASTRO_TYPST = "true";
        }
    },
}

// https://astro.build/config
export default defineConfig({
    integrations: [
        debug,
        typst({
            options: {
                remPx: 14
            }
        })],
});
