import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import { load } from "cheerio";

let compilerIns: NodeCompiler | undefined;

export async function renderToSVGString(code: string, options: any) {
    const $typst = (compilerIns ||= NodeCompiler.create());
    const res = renderToSVGString_($typst, code, options);
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
    code: string,
    options: any,
) {
    const width = options.width || "auto";
    const height = options.height || "auto";
    const template = `#set page(height: ${height}, width: ${width}, margin: 0pt)\n${code}`;
    const mainFileContent = template;
    const docRes = $typst.compile({ mainFileContent });
    if (!docRes.result) {
        const diags = $typst.fetchDiagnostics(docRes.takeDiagnostics()!);
        console.error(diags);
        return { svg: "" };
    }
    const doc = docRes.result;

    const svg = $typst.svg(doc);
    return { svg };
}
