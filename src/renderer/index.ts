import type { NamedSSRLoadedRendererValue, SSRResult } from "astro";

async function check(
    t: any,
    Component: any,
    props: Record<string, any>,
    children: any
) {
    // console.log('check', { Component: Component.prototype, props, children, t });
    return !children && !Component?.prototype &&
        (
            t?.startsWith('<html><head></head><body><svg class="typst-doc"') ||
            t.startsWith('<svg class="typst-doc"')
        );
}

async function renderToStaticMarkup(html: string, attrs: {}) {
    return { attrs: {}, html }
}

const renderer: NamedSSRLoadedRendererValue = {
    name: 'astro-typst',
    check,
    renderToStaticMarkup,
    supportsAstroStaticSlot: true,
}

export default renderer;
