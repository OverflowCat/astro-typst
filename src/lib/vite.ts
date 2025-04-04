import { type Plugin, type ResolvedConfig, type ViteDevServer } from "vite";
import { renderToHTML, renderToSVGString } from "./typst.js";
import fs from "fs/promises";
import { pathToFileURL } from "node:url";
import type { AstroTypstConfig } from "./prelude.js";

function isTypstFile(id: string) {
    return /\.typ(\?(html|svg))?$/.test(id);
}
function extractOpts(id: string) {
    const q = id.lastIndexOf('?');
    if (q === -1) return { path: id, opts: '' };
    const path = id.slice(0, q);
    const opts = id.slice(q + 1);
    return {
        path,
        opts,
    }
}
function debug(...args: any[]) {
    if (process.env.DEBUG) {
        debug(...args);
    }
}

export default function (config: AstroTypstConfig = {}): Plugin {
    let server: ViteDevServer;
    const plugin: Plugin = {
        name: 'vite-plugin-astro-typ',
        enforce: 'pre',


        // resolveId(id) {
        //     if (!id.includes("typ")) return null;
        //     const moduleInfo = this.getModuleInfo(id);
        //     if (!moduleInfo) return null;
        //     debug(`[vite-plugin-astro-typ] Resolving id: ${id}`, { moduleInfo: moduleInfo?.meta?.astro });
        // },

        load(id) {
            if (!isTypstFile(id)) return;
            debug(`[vite-plugin-astro-typ] Loading id: ${id}`);
            const { path, opts } = extractOpts(id);
            this.addWatchFile(path);
        },

        configureServer(_server) {
            server = _server;
            // listen for .typ file changes
            server.watcher.on('change', async (filePath) => {
                if (isTypstFile(filePath)) {
                    const modules = server.moduleGraph.getModulesByFile(filePath);
                    if (modules) {
                        for (const mod of modules) {
                            debug(`[vite-plugin-astro-typ] Invalidating module: ${mod.id}`);
                            server.moduleGraph.invalidateModule(mod);
                        }
                    } else {
                        debug(`[vite-plugin-astro-typ] No modules found for file: ${filePath}`);
                        server.ws.send({
                            type: 'full-reload',
                            path: '*', // 触发全页面刷新
                        });
                    }
                }
            });
        },

        async transform(code: string, id: string) {
            if (!isTypstFile(id)) return;
            debug(`[vite-plugin-astro-typ] Transforming id: ${id}`);
            const { path, opts } = extractOpts(id);
            debug({ path, opts });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const isHtml = opts.includes('html');

            var html: string;
            var getFrontmatter = () => ({});
            if (isHtml) {
                html = (await renderToHTML(
                    {
                        mainFilePath: path
                    },
                    config.options
                )).html;
            } else {
                const { svg, frontmatter } = await renderToSVGString(
                    {
                        mainFilePath: path
                    },
                    config.options ?? {}
                );
                html = svg;
                getFrontmatter = frontmatter;
            }
            debug({
                path
            })
            return {
                code: `
import { createComponent, render, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
export const name = "TypstComponent";
export const html = ${JSON.stringify(html)};
export const frontmatter = ${JSON.stringify(getFrontmatter())};
export const file = ${JSON.stringify(path)};
export const url = ${JSON.stringify(pathToFileURL(path))};
export function rawContent() {
    return ${JSON.stringify(await fs.readFile(path, 'utf-8'))};
}
export function compiledContent() {
    return html;
}
export function getHeadings() {
    return undefined;
}

export const Content = createComponent((result, _props, slots) => {
    const { layout, ...content } = frontmatter;
    content.file = file;
    content.url = url;
    return render\`\${unescapeHTML(html)}\`;
});
export default Content;
`,
                map: null,
            }
        }
    }

    return plugin;
}
