import { defineConfig } from "astro/config";
import typst from "./src/lib/integration.js";
import { type AstroIntegration } from "astro";

import react from "@astrojs/react";

import expressiveCode from "astro-expressive-code";

/**
 * This is only for the demo site.
 * It has no effect when you are importing the package.
 */
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
    outDir: "dist-demo",
    integrations: [
        debug,
        typst({
            options: {
                remPx: 14
            },
            target: (id: string) => {
                console.debug(`Detecting ${id}`);
                if (id.endsWith('.html.typ') || id.includes('/html/'))
                    return "html";
                return "svg";
            },
            emitSvg: true,
            emitSvgDir: ".astro/typst",
        }),
        react(),
        expressiveCode({
            themes: ['gruvbox-light-hard'],
        }),
    ]
});
