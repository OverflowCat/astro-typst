import type { AstroComponentMetadata, NamedSSRLoadedRendererValue, SSRResult } from "astro";
type RendererContext = {
    result: SSRResult;
};

async function check(t: RendererContext,
    Component: any,
    props: Record<string, any>,
    children: any) {
    return true;
}
async function renderToStaticMarkup(t: RendererContext,
    Component: any,
    props: Record<string, any>,
    { default: children, ...slotted }: Record<string, any>,
    metadata?: AstroComponentMetadata) {
    const attrs = {};
    const html = t;
    return {
        attrs, html
    }
}

const renderer: NamedSSRLoadedRendererValue = {
    name: 'astro-typst',
    check,
    renderToStaticMarkup,
}

export default renderer;