import type { RehypePlugins } from "astro";
import { unified, type Parser } from "unified";
import stringify from "rehype-stringify";
// @ts-ignore
import { createProcessor } from "typstx";
import { getOrInitCompiler } from "./typst.js";

export async function rehypeIt(hast: any, rehypePipe: RehypePlugins) {
  function typParse() {
    // @ts-ignore
    this.parser = parser as Parser;

    function parser(_doc: string, _file: unknown) {
      return hast;
    }
  }
  let processor = unified().use(typParse);
  for (const plugin of rehypePipe) {
    if (Array.isArray(plugin)) processor = processor.use(...plugin);
    // @ts-ignore
    else processor = processor.use(plugin);
  }
  // @ts-ignore
  processor = processor.use(stringify);
  const html = (await processor.process()).toString();
  return html;
}

export async function rehypeTypstx(hast: any, rehypePipe: RehypePlugins) {
  const processor = createProcessor({
    jsxImportSource: "astro",
    rehypePlugins: rehypePipe,
  }, getOrInitCompiler);
  processor.__setHast(hast);
  const html = await processor.process(hast);
  return html.value;
}
