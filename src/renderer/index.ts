import type { NamedSSRLoadedRendererValue } from "astro";
import { AstroError } from "astro/errors";
import { AstroJSX, jsx } from "astro/jsx-runtime";
import { renderJSX } from "astro/runtime/server/index.js";

const slotName = (str: string) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());

export async function check(
  Component: any,
  props: any,
  { default: children = null, ...slotted } = {},
) {
  if (typeof Component !== 'function')
    return false;
  // console.log('check', { Component: Component, props, children, t, name: t?.name });
  const slots: Record<string, any> = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children })
    return result[AstroJSX];
  } catch (e) {
    throwEnhancedErrorIfTypComponent(e as Error, Component);
    return false;
  }
}

export async function renderToStaticMarkup(Component: any, props: Record<string, any> = {}, { default: children = null, ...slotted } = {}) {
  const slots: Record<string, any> = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  // @ts-ignore
  const { result } = this;
  try {
    // console.log('renderToStaticMarkup', {
    //   result,
    //   component: String(Component),
    //   props,
    //   slots,
    //   children,
    //   jsx: jsx(Component, { ...props, ...slots, children })
    // });
    const html = await renderJSX(result, jsx(Component, { ...props, ...slots, children }));
    return { html };
  }
  catch (e) {
    throwEnhancedErrorIfTypComponent(e as Error, Component);
    throw e;
  }
}
const renderer: NamedSSRLoadedRendererValue = {
  name: 'astro:jsx',
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true,
}

function throwEnhancedErrorIfTypComponent(error: Error, Component: any) {
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
