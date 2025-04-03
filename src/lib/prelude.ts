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

export type AstroTypstConfig = {
    /** The options for the typst renderer */
    options?: AstroTypstRenderOption;
}
