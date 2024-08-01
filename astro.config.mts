import { defineConfig } from 'astro/config';
import type { AstroIntegration, AstroRenderer, ContentEntryType, HookParameters } from "astro";
import { renderToSVGString } from './src/lib/typst.js';

const PACKAGE_NAME = 'astro-typst'
function getRenderer(): AstroRenderer {
    return {
        name: PACKAGE_NAME,
        serverEntrypoint: 'src/lib/renderer.js',
    };
}

declare function renderTyp(code: string): string;

function vitePluginTyp() {
    return {
        name: 'vite-plugin-typ',
        async transform(code: string, id: string) {
            if (id.endsWith('.typ')) {
                try {
                    const result = await renderToSVGString(code, {});
                    code = `const code = ${JSON.stringify(result)}; export default code;`;
                    return {
                        code,
                    };
                } catch (error) {
                    console.log(error)
                }
            }
        }
    };
}

export const getContainerRenderer = getRenderer;

type SetupHookParams = HookParameters<'astro:config:setup'> & {
    // `addPageExtension` and `contentEntryType` are not a public APIs
    // Add type defs here
    addPageExtension: (extension: string) => void;
    addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

const typst: AstroIntegration = {
    name: 'typst',
    hooks: {
        "astro:config:setup": (options) => {
            const { addRenderer, addPageExtension, updateConfig } = (options as SetupHookParams);
            addRenderer(getRenderer());
            addPageExtension('.typ');
            updateConfig({
                vite: {
                    plugins: [vitePluginTyp()],
                },
            });
        },
        // "astro:config:done": (options) => {
        //     console.log(options.config.vite)
        // }
    }
}

// https://astro.build/config
export default defineConfig({
    integrations: [typst],
});
