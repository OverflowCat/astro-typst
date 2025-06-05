import { type Plugin, type ViteDevServer } from "vite";
import { setCheerio as compilerSetCheerio } from "./typst.js";
import { detectTarget, type AstroTypstConfig } from "./prelude.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isTypstFile(id: string) {
    return /\.typ(\?(html|svg|html&body|body&html))?$/.test(id);
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

export default function (config: AstroTypstConfig): Plugin {
    let server: ViteDevServer;

    // Extracts `cheerio` which is not serializable.
    const compileConfig = { ...config.options };
    if (compileConfig?.cheerio) {
        compilerSetCheerio(compileConfig.cheerio);
        delete compileConfig.cheerio;
    }
    // Serialize the compileConfig to JSON.
    const compileConfigString = JSON.stringify(compileConfig);

    const plugin: Plugin = {
        name: 'vite-plugin-astro-typ',
        enforce: 'pre',

        // Resolves `astro-typst/runtime` statically, so that we 
        // can use it in typst components reliably.
        config(config, env) {

            config.resolve ||= {};
            config.resolve.alias ||= {};

            if (config.resolve.alias instanceof Array) {
                config.resolve.alias = [
                    ...config.resolve.alias,
                    {
                        find: 'astro-typst/runtime',
                        replacement: resolve(__dirname, 'typst.js'),
                    },
                ];
            } else {
                config.resolve.alias['astro-typst/runtime'] = resolve(__dirname, 'typst.js');
            }

        },

        // resolveId(source, importer, options) {
        //     if (!isTypstFile(source)) return null;
        //     const { path, opts } = extractOpts(source);
        //     console.log(`'${path}' is imported by '${importer}'`);
        // },

        load(id) {
            if (!isTypstFile(id)) return;
            debug(`[vite-plugin-astro-typ] Loading id: ${id}`);
            // const { path, opts } = extractOpts(id);
            // this.addWatchFile(path);
        },

        // handleHotUpdate(ctx: HmrContext) {
        //     // ctx.file: 发生变化的文件路径
        //     // ctx.modules: 受影响的 ModuleNode 数组
        //     if (!isTypstFile(ctx.file)) return;
        //     console.log(`File changed: ${ctx.file}`);
        //     // const importersToUpdate = new Set<any>(); // Use a Set to avoid duplicates
        //     ctx.modules.forEach((moduleNode: any) => {
        //         console.log(`  Module affected: ${moduleNode.id || moduleNode.file}`);
        //         if (moduleNode.importers.size > 0) {
        //             console.log(`    Imported by:`);
        //             // @ts-ignore
        //             moduleNode.importers.forEach((importerNode) => {
        //                 console.log(`     - ${importerNode.id || importerNode.file}`);
        //                 // importersToUpdate.add(importerNode);
        //                 server.moduleGraph.invalidateModule(importerNode);
        //                 console.log(`    Invalidating module: ${importerNode.id || importerNode.file}`);
        //             });
        //         } else {
        //             console.log(`    Not imported by any other loaded module.`);
        //         }
        //     });

        // 返回需要 HMR 的模块，或空数组执行自定义处理/全页面重载
        // @ts-ignore
        /*             if (importersToUpdate.size > 0) {
                        for (const importer of importersToUpdate) {
                            // const module = server.moduleGraph.getModuleById(importer.id || importer.file);
                            // if (module) server.moduleGraph.invalidateModule(module);
                            // else console.log(`  No module found for importer: ${importer.id || importer.file}`);
                        }
                        console.log(`  Importers to update: ${Array.from(importersToUpdate).map((m) => m.id || m.file).join(', ')}`);
                        return Array.from(importersToUpdate);
                    } */
        //     ctx.server.hot.send({ type: 'full-reload' });
        //     return [];
        // },

        configureServer(_server) {
            server = _server;
            // listen for .typ file changes
            server.watcher.on('change', async (filePath) => {
                if (isTypstFile(filePath)) {
                    const modules = server.moduleGraph.getModulesByFile(filePath);
                    if (modules) {
                        modules.forEach(mod => {
                            debug(`[vite-plugin-astro-typ] Invalidating module: ${mod.id}`);
                            server.moduleGraph.invalidateModule(mod);
                        })
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
            const { path, opts } = extractOpts(id);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const isBody = opts.includes('body');
            let isHtml = false;
            if (opts.includes('svg')) {
                isHtml = false;
            } else if (opts.includes('html')) {
                isHtml = true;
            } else {
                isHtml = await detectTarget(path, config.target) === "html";
            }

            const docArgs = JSON.stringify({ mainFilePath: path, body: isBody });

            return {
                code: `
import { createComponent, render, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
import { pathToFileURL } from "node:url";
import fs from "fs/promises";
import { renderToHTML, renderToSVGString } from "astro-typst/runtime";

const docArgs = ${docArgs};
// todo: will getFrontmatter be always used in most cases?
const { html: htmlDoc, svg, frontmatter: getFrontmatter } = await ${isHtml ? "renderToHTML" : "renderToSVGString"}(
    docArgs,
    ${compileConfigString},
);
export const name = "TypstComponent";
let bodyCache = undefined;
let htmlCache = undefined;
const getHtml = (body) => {
  if (!htmlDoc) { return ""; }
  return body ?
    (bodyCache === undefined ? (bodyCache = htmlDoc.body()) : bodyCache) :
    (htmlCache === undefined ? (htmlCache = htmlDoc.html()) : htmlCache);
}

// todo: html are always rendered...
export const html = ${isHtml ? "getHtml(docArgs.body)" : "svg"};
export const frontmatter = getFrontmatter();
export const file = docArgs.mainFilePath;
export const url = pathToFileURL(file);

// todo: content are always read from disk, but is it really used in most cases?
const content = await fs.readFile(file, 'utf-8');
export function rawContent() {
    return content;
}
export function compiledContent() {
    return html;
}
export function getHeadings() {
    return undefined;
}

export const Content = createComponent((result, props, slots) => {
    const { layout, ...content } = frontmatter;
    content.file = file;
    content.url = url;
    const toRender = ${isHtml ? "getHtml(props?.body || docArgs.body)" : "svg"};
    return render(toRender);
});
export default Content;
`,
                map: null,
            }
        }
    }

    return plugin;
}
