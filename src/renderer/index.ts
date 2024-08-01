import type { NamedSSRLoadedRendererValue, SSRResult } from "astro";
type RendererContext = {
    result: SSRResult;
};

async function check(t: RendererContext,
    Component: any,
    props: Record<string, any>,
    children: any
) {
    console.log('check', t, Component, props, children)
    return true;
}
async function renderToStaticMarkup(html: string, attrs: {}) {
    console.log('renderToStaticMarkup', attrs, html)
    return { attrs: {}, html }
}

const renderer: NamedSSRLoadedRendererValue = {
    name: 'astro-typst',
    check,
    renderToStaticMarkup,
    supportsAstroStaticSlot: true,
}

export default renderer;
