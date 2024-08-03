import { NodeCompiler, type CompileDocArgs } from "@myriaddreamin/typst-ts-node-compiler/index.js";
import { load } from "cheerio";

/**
 * Either a string or an object for multiple files.
*/
export type TypstDocInput = CompileDocArgs | string;

let compilerIns: NodeCompiler | undefined;

function prepareSource(source: TypstDocInput, _options: any) {
    if (typeof source === "string") {
        source = { mainFileContent: source };
    }
    return source;
}

function getOrInitCompiler(): NodeCompiler {
    return (compilerIns ||= NodeCompiler.create({
        workspace: "./", // default
    }));
}


/**
 *
 * @param source The source code of the .typ file.
 * @param options Options for rendering the SVG.
 * @returns The SVG string.
 */
export async function renderToSVGString(source: TypstDocInput, options: any) {
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const res = renderToSVGString_($typst, source);
    $typst.evictCache(10);
    const { svg } = await res;
    const $ = load(svg);
    const remPx = options.remPx || 16;

    const width = $("svg").attr("width");
    if (options.width === undefined && width !== undefined) {
        const remWidth = parseFloat(width) * 2 / remPx;
        $("svg").attr("width", `${remWidth}rem`);
    } else {
        $("svg").attr("width", options.width);
    }
    const height = $("svg").attr("height");
    if (options.height === undefined && height !== undefined) {
        const remHeight = parseFloat(height) * 2 / remPx;
        $("svg").attr("height", `${remHeight}rem`);
    } else {
        $("svg").attr("height", options.height);
    }

    if (options.style === false) {
        $("style").remove();
    }
    if (options.props) {
        for (const [key, value] of Object.entries(options.props)) {
            $("svg").attr(key, value as any);
        }
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

export async function renderToVectorFormat(
    source: TypstDocInput,
    options: any,
) {
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const vector = $typst.vector(source);
    return vector;
}
