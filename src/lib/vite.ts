import { type Plugin, type ViteDevServer } from "vite";
import { renderToHTML, renderToSVGString } from "./typst.js";
import fs from "fs/promises";
import { pathToFileURL } from "node:url";

export type TypstComponent = {
    name: "TypstComponent";
    frontmatter: Record<string, any>;
    file: string;
    html: string;
}

export default function (config: Record<string, any> = {}): Plugin {
    let server: ViteDevServer;
    const plugin: Plugin = {
        name: 'vite-plugin-typ',
        configureServer(_server) {
            // _server.watcher.on('change', (event) => console.log({ event }));
            server = _server;
        },
        handleHotUpdate({ modules }) {
            for (const mod of modules) {
                server.moduleGraph.invalidateModule(mod);
            }
            // console.log(server.moduleGraph.fileToModulesMap)
        },
        async transform(code: string, id: string) {
            id.includes('.typ') && console.debug({ id });
            let isHtml = false;
            if (id.endsWith('?html')) {
                id = id.slice(0, -5);
                isHtml = true;
            }
            if (!id.endsWith('.typ')) {
                return;
            }
            // if (/test/.test(id)) {
            //     console.log("this.addWatchFile")
            //     // transform dependencies
            //     this.addWatchFile('D:\\astro-typst\\src\\pages\\_included.typ');
            //     console.info(this.getWatchFiles());
            // }
            // const isHtml = code.startsWith("/* htmlOutput */");
            var html: string;
            var getFrontmatter = () => ({});
            if (isHtml) {
                html = (await renderToHTML(
                    {
                        mainFilePath: id
                    },
                    config.options
                )).html;
            } else {
                const { svg, frontmatter } = await renderToSVGString(
                    {
                        mainFilePath: id
                    },
                    config.options
                );
                html = svg;
                getFrontmatter = frontmatter;
            }
            const fileId = id.split('?')[0];
            return {
                code: `
import { createComponent, render, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
export const name = "TypstComponent";
export const html = ${JSON.stringify(html)};
export const frontmatter = ${JSON.stringify(getFrontmatter())};
export const file = ${JSON.stringify(fileId)};
export const url = ${JSON.stringify(pathToFileURL(fileId))};
export function rawContent() {
    return ${JSON.stringify(await fs.readFile(fileId, 'utf-8'))};
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
