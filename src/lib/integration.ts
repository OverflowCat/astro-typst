import type { AstroIntegration, AstroRenderer, ContentEntryType, HookParameters } from "astro";
import vitePluginTypst from "./vite.js"
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { renderToHTMLish } from "./typst.js";
import { fileURLToPath } from "url";
import type { PluginOption } from "vite";
import { createResolver, watchDirectory } from "astro-integration-kit";
import { defaultTarget, detectTarget, type AstroTypstConfig } from "./prelude.js";

const PACKAGE_NAME = 'astro-typst';

function getRenderer(): AstroRenderer {
    const isDebug = !!process.env.ASTRO_TYPST;
    const serverEntrypoint = (isDebug ? "" : "astro-typst/") + "src/renderer/index.js";
    isDebug && console.debug(`\x1b[42mYou are running the demo of \x1b[33mastro-typst\x1b[42m, not importing the package from elsewhere.\x1b[0m
\x1b[32mThis mode is good for test, debug, and build the demo site.\x1b[0m
Server entry point: ${serverEntrypoint}`);
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

const { resolve: resolver } = createResolver(import.meta.url);

export default function typstIntegration(
    config: AstroTypstConfig = {
        options: {
            remPx: 16
        },
        target: defaultTarget,
    }
): AstroIntegration {
    return {
        name: 'typst',
        hooks: {
            "astro:config:setup": (options) => {
                const {
                    addRenderer, addContentEntryType, addPageExtension, updateConfig
                } = (options as SetupHookParams);
                watchDirectory(options, resolver());
                addRenderer(getRenderer());
                addPageExtension('.typ');
                addContentEntryType({
                    extensions: ['.typ'],
                    async getEntryInfo({ fileUrl, contents }) {
                        const mainFilePath = fileURLToPath(fileUrl);
                        const isHtml = await detectTarget(fileUrl.pathname, config.target) === "html";
                        let { getFrontmatter } = await renderToHTMLish(
                            {
                                mainFilePath,
                                body: true,
                            },
                            config?.options,
                            isHtml
                        )
                        const frontmatterResult = getFrontmatter?.();
                        return {
                            data: frontmatterResult || {},
                            body: contents,
                            // @ts-ignore
                            slug: frontmatterResult?.slug as any,
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
                        // @ts-ignore
                        plugins: [nodeResolve(), vitePluginTypst(config) as PluginOption],
                    },
                });
            },

            "astro:config:done": (params) => {
                params.injectTypes(
                    {
                        filename: "astro-i18n.d.ts",
                        content: `declare module '*.typ' {
    const component: () => any;
    export default component;
}`,
                    }
                )
            }
        }
    }
}
