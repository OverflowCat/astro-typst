import { NodeCompiler, type CompileDocArgs } from "@myriaddreamin/typst-ts-node-compiler/index.js";
import { load } from "cheerio";

/**
 * Either a string or an object for multiple files.
*/
export type TypstDocInput = CompileDocArgs | string;

let compilerIns: NodeCompiler | undefined;

/**
 *
 * @param source The source code of the .typ file.
 * @param options Options for rendering the SVG.
 * @returns The SVG string.
 */
export async function renderToSVGString(source: TypstDocInput, options: any) {
    const $typst = (compilerIns ||= NodeCompiler.create({
        workspace: "./", // default
    }));
    if (typeof source === "string") {
        const width = options.width || "auto";
        const height = options.height || "auto";
        const mainFileContent = `#set page(height: ${height}, width: ${width}, margin: 0pt)\n${source}`;
        source = { mainFileContent };
    }
    const res = renderToSVGString_($typst, source);
    $typst.evictCache(10);
    const { svg } = await res;
    const $ = load(svg);
    const remPx = options.remPx || 16;
    const width = $("svg").attr("width");
    const height = $("svg").attr("height");
    if (!width || !height) {
        return svg;
    }

    const remWidth = parseFloat(width) * 2 / remPx;
    const remHeight = parseFloat(height) * 2 / remPx;
    $("svg").attr("width", `${remWidth}rem`);
    $("svg").attr("height", `${remHeight}rem`);

    if (options.style === false) {
        $("style").remove();
    }
    return $.html();
}

async function renderToSVGString_(
    $typst: NodeCompiler,
    source: CompileDocArgs,
) {
    const docRes = $typst.compile(source);
    if (!docRes.result) {
        const diags = $typst.fetchDiagnostics(docRes.takeDiagnostics()!);
        console.error(diags);
        return { svg: "" };
    }
    const doc = docRes.result;

    const svg = $typst.svg(doc);
    return { svg };
}
