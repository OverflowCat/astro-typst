import fs from "fs/promises";
import { type Plugin, type ViteDevServer } from "vite";
import { renderToHTMLish } from "./typst.js";
import { pathToFileURL } from "node:url";
import { detectTarget, type AstroTypstConfig } from "./prelude.js";
import logger from "./logger.js";
import path from "node:path/posix";
import type { AstroConfig } from "astro";

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
        console.debug(...args);
    }
}

export default function (config: AstroTypstConfig, options: AstroConfig): Plugin {
    let server: ViteDevServer;
    const plugin: Plugin = {
        name: 'vite-plugin-astro-typ',
        enforce: 'pre',

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
                        for (const mod of modules) {
                            debug(`[vite-plugin-astro-typ] Invalidating module: ${mod.id}`);
                            server.moduleGraph.invalidateModule(mod);
                        }
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

            let { html, getFrontmatter } = await renderToHTMLish(
                {
                    mainFilePath,
                    // TODO: remove body; autodetect after the render process is delayed
                    body: emitSvg ? true : isBody,
                },
                config.options,
                isHtml
            );

            if (emitSvg && !isHtml) {
                let imgSvg = "";
                const contentHash = crypto.randomUUID().slice(0, 8);
                const fileName = `typst-${contentHash}.svg`;

                const emitSvgDir = config.emitSvgDir ?? "typst";
                const base = options.base ?? "/";
                let publicUrl = path.join(base, emitSvgDir, fileName);
                logger.debug({
                    base,
                    emitSvgDir,
                    fileName,
                    publicUrl,
                })

                if (import.meta.env.PROD) { // 'build' mode
                    const emitName = path.join(emitSvgDir, fileName);
                    const respId = this.emitFile({
                        type: 'asset',
                        fileName: emitName,
                        source: Buffer.from(html, 'utf-8'),
                    });
                    logger.debug("emitFile", respId)
                    imgSvg = `<img src='${publicUrl}' />`;
                } else { // 'serve' mode inlines svg as base64
                    imgSvg = `<img src="data:image/svg+xml;base64,${Buffer.from(html, 'utf-8').toString('base64')}" />`;
                }
                html = imgSvg;
            }

            const code = `
import { createComponent, render, renderJSX, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
import { AstroJSX, jsx } from 'astro/jsx-runtime';
import { readFileSync } from "node:fs";
export const name = "TypstComponent";
export const html = ${JSON.stringify(html)};
export const frontmatter = ${JSON.stringify(getFrontmatter())};
export const file = ${JSON.stringify(mainFilePath)};
export const url = ${JSON.stringify(pathToFileURL(mainFilePath))};
export function rawContent() {
    return readFileSync(${
        JSON.stringify(mainFilePath) // SSR?
    }, 'utf-8');
}
export function compiledContent() {
    return ${
        // since Astro v5, function `compiledContent` is an async function
        JSON.stringify(html)
    };
}
export function getHeadings() {
    return undefined;
}

export const Content = createComponent(async (result, _props, slots) => {
    const { layout, ...content } = frontmatter;
    const slot = await slots?.default?.();
    content.file = file;
    content.url = url;
    const html = await renderJSX(result, jsx("div", { ..._props, ...slots,  }));
    console.log("========={content}==========");
    console.log( {
        result,
        _props,
        slot,
        html,
        //        ex: await slot?.expressions?.at(0)?.render()
    })
    // return render\`\${compiledContent()}\`;
    return render\`\${unescapeHTML(compiledContent())}\`;
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
