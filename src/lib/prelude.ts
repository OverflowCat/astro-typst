import type { CompileDocArgs } from "@myriaddreamin/typst-ts-node-compiler";
import type { CheerioAPI } from "cheerio";


/**
 * Either a string or an object for multiple files.
*/
export type TypstDocInput = CompileDocArgs | string;


export type TypstComponent = {
    name: "TypstComponent";
    frontmatter: Record<string, any>;
    file: string;
    html: string;
}

export type AstroTypstRenderOption = {
    /** The rem size to use for the typst renderer */
    remPx?: number;
    cheerio?: {
        preprocess?: ($: CheerioAPI, input: TypstDocInput) => CheerioAPI;
        postprocess?: ($: CheerioAPI, input: TypstDocInput) => CheerioAPI;
        stringify?: ($: CheerioAPI, input: TypstDocInput) => string;
    }
    [key: string]: any;
}


export type TypstTargetFormat = "html" | "svg";

export type AstroTypstConfig = {
    /** The options for the typst renderer */
    options?: AstroTypstRenderOption;
    /** The target format detector */
    target?:
    | TypstTargetFormat
    | ((path: string) => TypstTargetFormat | Promise<TypstTargetFormat>);
};


export function defaultTarget(path: string) {
    if (path.endsWith('.html.typ') || path.includes('/html/'))
        return "html";
    else if (path.endsWith('.svg.typ') || path.includes('/svg/'))
        return "svg";
    return "html";
}


export async function detectTarget(path: string, target: AstroTypstConfig['target']) {
    if (typeof target === 'function') {
        const result = target(path);
        if (result instanceof Promise)
            return await result;
        return result;
    }
    return target;
}
