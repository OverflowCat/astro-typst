import type { AstroIntegration, AstroRenderer, ContentEntryType, HookParameters } from "astro";
import vitePluginTypst from "./vite.js"
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { renderToSVGString } from "./typst.js";
import { fileURLToPath } from "url";

const PACKAGE_NAME = 'astro-typst';
const isDebug = false;

function getRenderer(): AstroRenderer {
    // const serverEntrypoint = fileURLToPath(new URL('../renderer/index.js', import.meta.url));
    const serverEntrypoint = (isDebug ? "" : "astro-typst/") + "src/renderer/index.js";
    return {
        name: PACKAGE_NAME,
        serverEntrypoint,
    };
}

export const getContainerRenderer = getRenderer;

type SetupHookParams = HookParameters<'astro:config:setup'> & {
    // `addPageExtension` and `contentEntryType` are not a public APIs
    // Add type defs here
    addPageExtension: (extension: string) => void;
    addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

export default function typstIntegration(
    config = {
        options: {
            remPx: 16
        }
    }
): AstroIntegration {
    return {
        name: 'typst',
        hooks: {
            "astro:config:setup": (options) => {
                const { addRenderer, addContentEntryType, addPageExtension, updateConfig } = (options as SetupHookParams);
                addRenderer(getRenderer());
                addPageExtension('.typ');
                addContentEntryType({
                    extensions: ['.typ'],
                    async getEntryInfo({ fileUrl, contents }) {
                        const mainFilePath = fileURLToPath(fileUrl);
                        let { frontmatter } = await renderToSVGString(
                            {
                                mainFilePath
                            },
                            config?.options);
                        return {
                            data: frontmatter(),
                            body: contents,
                            // @ts-ignore
                            slug: frontmatter()?.slug as any,
                            rawData: contents,
                        };
                    },
                    // Typ cannot import scripts and styles
                    handlePropagation: false,
                    contentModuleTypes: `
declare module 'astro:content' {
  interface Render {
    '.typ': Promise<{
      Content: import('astro').MarkdownInstance<{}>['Content'];
    }>;
  }
}
`
                });
                updateConfig({
                    vite: {
                        build: {
                            rollupOptions: {
                                external: [
                                    "@myriaddreamin/typst-ts-node-compiler",
                                ],
                            }
                        },
                        plugins: [nodeResolve(), vitePluginTypst(config)],
                    },
                });
            },
            // "astro:config:done": (options) => {
            //     console.log(options.config.vite)
            // }
        }
    }
}