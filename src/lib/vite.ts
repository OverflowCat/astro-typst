import { type Plugin, type ViteDevServer } from "vite";
import { renderToSVGString } from "./typst.js";
import fs from "fs/promises";
import { pathToFileURL } from "node:url";

export type TypstComponent = {
    name: "TypstComponent";
    frontmatter: Record<string, any>;
    file: string;
    svg: string;
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
        async transform(_code: string, id: string) {
            if (id.endsWith('.typ')) {
                // if (/test/.test(id)) {
                //     console.log("this.addWatchFile")
                //     // transform dependencies
                //     this.addWatchFile('D:\\astro-typst\\src\\pages\\_included.typ');
                //     console.info(this.getWatchFiles());
                // }
                const { svg, frontmatter } = await renderToSVGString(
                    {
                        mainFilePath: id
                    },
                    config.options
                );
                const fileId = id.split('?')[0];
                // const runtime = "astro/runtime/server/index.js";
                return {
                    code: `
import { createComponent, render, renderComponent, unescapeHTML } from "astro/runtime/server/index.js";
export const name = "TypstComponent";
export const svg = ${JSON.stringify(svg)};
export const frontmatter = ${JSON.stringify(frontmatter())};
export const file = ${JSON.stringify(fileId)};
export const url = ${JSON.stringify(pathToFileURL(fileId))};
export function rawContent() {
    return ${JSON.stringify(await fs.readFile(fileId, 'utf-8'))};
}
export function compiledContent() {
    return svg;
}
export function getHeadings() {
    return undefined;
}

export const Content = createComponent((result, _props, slots) => {
    const { layout, ...content } = frontmatter;
    content.file = file;
    content.url = url;
    return render\`\${unescapeHTML(svg)}\`;
});
export default Content;
`,
                    map: null,
                }
            }
        }
        // async load(id, options) {
        // }
    }

    return plugin;
}
