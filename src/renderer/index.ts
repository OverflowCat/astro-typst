import type { NamedSSRLoadedRendererValue } from "astro";
import type { TypstComponent } from "../lib/prelude";
import { AstroError } from "astro/errors";

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
    return { attrs, html: t.html };
}

const renderer: NamedSSRLoadedRendererValue = {
    name: 'astro-typst',
    check,
    renderToStaticMarkup,
    supportsAstroStaticSlot: true,
}

function throwEnhancedErrorIfOrgComponent(error: Error, Component: any) {
    if (Component[Symbol.for('astro-component')]) {
      // if it's an existing AstroError, we don't need to re-throw, keep the original hint
      if (AstroError.is(error)) return;
      // Provide better title and hint for the error overlay
      (error as any).title = error.name;
      (error as any).hint =
        `This issue often occurs when your Typst component encounters runtime errors.`;
      throw error;
    }
  }

export default renderer;
