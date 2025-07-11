import { type Plugin, type ViteDevServer } from "vite";
import { setCheerio as compilerSetCheerio } from "./typst.js";
import { detectTarget, type AstroTypstConfig } from "./prelude.js";
import type { AstroConfig } from "astro";
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

export default function (config: AstroTypstConfig, options: AstroConfig): Plugin {
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
        },

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
                            path: '*',
                        });
                    }
                }
            });
        },


        async transform(_: string, id: string) {
            if (!isTypstFile(id)) return;
            const { path: mainFilePath, opts } = extractOpts(id);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const isBody = opts.includes('body');
            let isHtml = false;
            if (opts.includes('svg') || opts.includes("img")) {
                isHtml = false;
            } else if (opts.includes('html')) {
                isHtml = true;
            } else {
                isHtml = await detectTarget(mainFilePath, config.target) === "html";
            }
            let emitSvg = opts.includes('img') || config?.emitSvg === true;

            const docArgs = JSON.stringify({ mainFilePath, body: emitSvg ? true : isBody });
            const code = `
import { createComponent, render, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
import { pathToFileURL } from "node:url";
import * as path from "node:path";
import crypto from "node:crypto";
import { readFileSync } from "fs";
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

export const frontmatter = getFrontmatter();
export const file = docArgs.mainFilePath;
export const url = pathToFileURL(file);

export function rawContent() {
    return readFileSync(file, 'utf-8');
}
export function getHeadings() {
    return undefined;
}

export const Content = createComponent((result, props, slots) => {
    const { layout, ...content } = frontmatter;
    content.file = file;
    content.url = url;
    let toRender = ${isHtml ? "getHtml(props?.body || docArgs.body)" : "svg"};

    if (${emitSvg && !isHtml}) {
        let imgSvg = "";
        const contentHash = crypto.randomUUID().slice(0, 8);
        const fileName = \`typst-\${contentHash}.svg\`;

        const emitSvgDir = ${JSON.stringify(config.emitSvgDir ?? "typst")};
        const base = ${JSON.stringify(options.base ?? "/")};
        let publicUrl = path.join(base, emitSvgDir, fileName);

        if (import.meta.env.PROD) { // 'build' mode
            const emitName = path.join(emitSvgDir, fileName);
            const respId = this.emitFile({
                type: 'asset',
                fileName: emitName,
                source: Buffer.from(toRender, 'utf-8'),
            });
            imgSvg = \`<img src='\${publicUrl}' />\`;
        } else { // 'serve' mode inlines svg as base64
            imgSvg = \`<img src="data:image/svg+xml;base64,\${Buffer.from(toRender, 'utf-8').toString('base64')}" />\`;
        }
        toRender = imgSvg;
    }

    return render(toRender);
});

export default Content;
`

            return {
                code,
                map: null,
            }
        }
    }

    return plugin;
}
