import { NodeCompiler, DynLayoutCompiler, type CompileDocArgs } from "@myriaddreamin/typst-ts-node-compiler/index.js";
import { load } from "cheerio";
import type { AstroTypstRenderOption, TypstDocInput } from "./prelude";

let compilerIns: NodeCompiler | undefined;
let dynCompilerIns: DynLayoutCompiler | undefined;

function prepareSource(source: TypstDocInput, _options: any) {
    if (typeof source === "string") {
        source = { mainFileContent: source };
    }
    return source;
}

function initCompiler(): NodeCompiler {
    return NodeCompiler.create({
        workspace: "./", // default
    });
}


function getOrInitCompiler(): NodeCompiler {
    return (compilerIns ||= initCompiler());
}

function getOrInitDynCompiler(): DynLayoutCompiler {
    return (dynCompilerIns ||= DynLayoutCompiler.fromBoxed(
        getOrInitCompiler().intoBoxed(),
    ));
}

export function getFrontmatter($typst: NodeCompiler, source: CompileDocArgs) {
    var frontmatter: Record<string, any> = {};
    try {
        const data = $typst.query(source, { selector: "<frontmatter>" })
        if (data?.length > 0) {
            frontmatter = data[0].value;
        }
    } catch (error) {
        console.warn("Error querying frontmatter", error);
    }
    // console.info("Frontmatter", frontmatter);
    return frontmatter;
}

/**
 * @param source The source code of the .typ file.
 * @param options Options for rendering the SVG.
 * @returns The SVG string.
 */
export async function renderToSVGString(source: TypstDocInput, options: AstroTypstRenderOption) {
    source = prepareSource(source, options);
    const $typst = source.mainFileContent? getOrInitCompiler() : initCompiler();
    const svg = await renderToSVGString_($typst, source);
    $typst.evictCache(60);
    let $ = load(svg);
    (options?.cheerio?.preprocess) && ($ = options?.cheerio?.preprocess($, source));
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
    (options.cheerio?.postprocess) && ($ = options?.cheerio?.postprocess($, source));
    const svgString = options.cheerio?.stringify ? options.cheerio.stringify($, source) : $.html();
    // @ts-ignore
    return { svg: svgString, frontmatter: () => getFrontmatter($typst, source) };
}

async function renderToSVGString_(
    $typst: NodeCompiler,
    source: CompileDocArgs,
): Promise<string> {
    const docRes = $typst.compile(source);
    if (!docRes.result) {
        const diags = $typst.fetchDiagnostics(docRes.takeDiagnostics()!);
        console.error(diags);
        return "";
    }
    const doc = docRes.result;
    const svg = $typst.svg(doc);
    return svg;
}

export async function renderToVectorFormat(
    source: TypstDocInput,
    options: any,
) {
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const vector = $typst.vector(source);
    return { vector };
}

export async function renderToDynamicLayout(
    source: TypstDocInput,
    options: any,
) {
    // inputs: { 'x-target': 'web' },
    if (!options["x-target"]) {
        options["x-target"] = "web";
    }
    source = prepareSource(source, options);
    const $dyn = getOrInitDynCompiler();
    const res = $dyn.vector(source);
    return res;
}

export async function renderToHTML(
    source: TypstDocInput,
    options: any,
) {
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const docRes = $typst.compileHtml(source);
    if (!docRes.result) {
        const diags = $typst.fetchDiagnostics(docRes.takeDiagnostics()!);
        console.error(diags);
        return { html: "" };
    }
    const doc = docRes.result;
    const html = $typst.html(doc);
    if (!html) {
        console.error("No HTML generated");
        return { html: "" };
    }
    return { html };
}
