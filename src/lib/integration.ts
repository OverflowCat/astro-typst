import type { AstroIntegration, AstroRenderer, ContentEntryType, HookParameters } from "astro";
import vitePluginTypst from "./vite"

const PACKAGE_NAME = 'astro-typst'

function getRenderer(): AstroRenderer {
    return {
        name: PACKAGE_NAME,
        serverEntrypoint: 'src/renderer/index.js',
    };
}

export const getContainerRenderer = getRenderer;

type SetupHookParams = HookParameters<'astro:config:setup'> & {
    // `addPageExtension` and `contentEntryType` are not a public APIs
    // Add type defs here
    addPageExtension: (extension: string) => void;
    addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

const typstIntegration: AstroIntegration = {
    name: 'typst',
    hooks: {
        "astro:config:setup": (options) => {
            const { addRenderer, addPageExtension, updateConfig } = (options as SetupHookParams);
            addRenderer(getRenderer());
            addPageExtension('.typ');
            updateConfig({
                vite: {
                    plugins: [vitePluginTypst()],
                },
            });
        },
        // "astro:config:done": (options) => {
        //     console.log(options.config.vite)
        // }
    }
}

export default () => typstIntegration;
