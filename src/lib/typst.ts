import { NodeCompiler, DynLayoutCompiler, type CompileDocArgs, type NodeTypstDocument, type CompileArgs } from "@myriaddreamin/typst-ts-node-compiler";
// import TypstTsCompiler from "@myriaddreamin/typst-ts-node-compiler";
// console.log({TypstTsCompiler});
// const { NodeCompiler, DynLayoutCompiler, } = TypstTsCompiler;
// type CompileArgs = any;
// type NodeTypstDocument = any;
// type CompileDocArgs = any;
// type NodeCompiler = any;
// type DynLayoutCompiler = any;

import { load } from "cheerio";
import type { AstroTypstRenderOption, TypstDocInput } from "./prelude";
import logger from "./logger.js";
import { getConfig } from "./store.js";

/** The cached compiler instance */
let compilerIns: NodeCompiler | undefined;

/** The cached dynamic layout compiler instance */
let dynCompilerIns: DynLayoutCompiler | undefined;

function prepareSource(source: TypstDocInput, _options: any) {
    if (typeof source === "string") {
        source = { mainFileContent: source };
    }
    return source;
}

function getInitOptions(): CompileArgs {
    const config = getConfig();
    const initOptions: CompileArgs = {
        workspace: "./", // default
    }
    if (config.fontArgs) {
        initOptions.fontArgs = config.fontArgs;
    }
    return initOptions;
}

function initCompiler(): NodeCompiler {
    return NodeCompiler.create(getInitOptions());
}

export function getOrInitCompiler(): NodeCompiler {
    return (compilerIns ||= initCompiler());
}

export function getOrInitDynCompiler(): DynLayoutCompiler {
    return (dynCompilerIns ||= DynLayoutCompiler.fromBoxed(
        NodeCompiler.create(getInitOptions()).intoBoxed())
    );
}

export function getFrontmatter($typst: NodeCompiler, source: NodeTypstDocument | CompileDocArgs) {
    var frontmatter: Record<string, any> = {};
    try {
        const data = $typst.query(source, { selector: "<frontmatter>" })
        if (data?.length > 0) {
            frontmatter = data[0].value;
        }
    } catch (error) {
        logger.compileError("Querying frontmatter but got", error);
        if (JSON.stringify(error).includes("unknown variable: html")) {
            logger.compileError("You may be rendering a Typst file that is intended to be using html export, but you are using SVG export. Please check if the file path matches the result of the `mode.detect` in your configuration.");
        }
    }
    return frontmatter;
}

/**
 * @param source The source code of the .typ file.
 * @param options Options for rendering the SVG.
 * @returns The SVG string.
 */
export async function renderToSVGString(source: TypstDocInput, options: AstroTypstRenderOption) {
    source = prepareSource(source, options);
    const $typst = source.mainFileContent ? getOrInitCompiler() : initCompiler();
    const svg = await renderToSVGString_($typst, source);
    $typst.evictCache(60);
    let $ = load(svg, {
        xml: true,
    });
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
        docRes.printDiagnostics();
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
    if (!options["x-target"]) {
        options["x-target"] = "web";
    }
    source = prepareSource(source, options);
    const $dyn = getOrInitDynCompiler();
    const res = $dyn.vector(source);
    return res;
}

/**
 * @param source The source code of the .typ file.
 * @param options Options for rendering the HTML.
 * @returns The HTML string.
 */
export async function renderToHTML(
    source: TypstDocInput & { body?: boolean | "hast" },
    options: any,
) {
    const onlyBody = source.body;
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const docRes = $typst.compileHtml(source);
    if (!docRes.result) {
        logger.error("Error compiling typst to HTML");
        docRes.printDiagnostics();
        return { html: "" };
    }
    const doc = docRes.result;
    const html = $typst.tryHtml(doc);
    if (!html.result) {
        html.printDiagnostics();
        return { html: "" };
    }
    return {
        html:
            onlyBody === "hast" ?
                html.result.hast() :
                onlyBody !== false ?
                    html.result.body() :
                    html.result.html(),
        frontmatter: () => getFrontmatter($typst, doc),
    };
}

/** 
 * @deprecated Need to be removed
 */
export async function renderToHast(
    source: TypstDocInput & { body?: boolean },
    options: any,
) {
    const onlyBody = source.body !== false;
    source = prepareSource(source, options);
    const $typst = getOrInitCompiler();
    const docRes = $typst.compileHtml(source);
    if (!docRes.result) {
        logger.error("Error compiling typst to HTML");
        docRes.printDiagnostics();
        return { html: "" };
    }
    const doc = docRes.result;
    const html = $typst.tryHtml(doc);
    if (!html.result) {
        html.printDiagnostics();
        return { html: "" };
    }
    return {
        html: html.result.hast(),
        frontmatter: () => getFrontmatter($typst, doc),
    };
}


export async function renderToHTMLish(
    source: TypstDocInput & { body?: boolean | "hast" },
    options: any,
    isHtml: boolean = true,
) {
    var html: string;
    var getFrontmatter = () => ({});
    if (isHtml) {
        let { html: htmlRes, frontmatter } = await renderToHTML(
            source, options
        );
        html = htmlRes;
        getFrontmatter = frontmatter || (() => ({}));
    } else /* svg */ {
        let { svg, frontmatter } = await renderToSVGString(
            source, options
        );
        html = svg;
        getFrontmatter = frontmatter || (() => ({}));
    }
    return {
        html,
        getFrontmatter,
    };
}
