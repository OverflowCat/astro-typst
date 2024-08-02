import type { NamedSSRLoadedRendererValue } from "astro";
import type { TypstComponent } from "../lib/vite.js";

async function check(
    t: any,
    _Component: any,
    _props: Record<string, any>,
    children: any
) {
    // console.log('check', { Component: Component.prototype, props, children, t });
    return t?.name == 'TypstComponent' && !children;
}

async function renderToStaticMarkup(t: TypstComponent, attrs: {}) {
    return { attrs, html: t.svg }
}

const renderer: NamedSSRLoadedRendererValue = {
    name: 'astro-typst',
    check,
    renderToStaticMarkup,
    supportsAstroStaticSlot: true,
}

export default renderer;
