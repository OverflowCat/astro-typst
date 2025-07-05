# `astro-typst`

![NPM Version](https://img.shields.io/npm/v/astro-typst?style=for-the-badge)
<a href='https://typst.app/' target="_blank"><img alt='Supported Typst version: 0.13' src='https://img.shields.io/badge/Typst_0.13-100000?style=for-the-badge&logo=Typst&logoColor=30bdc1&labelColor=FFFFFF&color=30BDB2' />

An Astro [Integration](https://astro.build/integrations/) that lets you render [Typst](https://github.com/typst/typst) within [Astro](https://github.com/withastro/astro) based on [typst.ts](https://github.com/Myriad-Dreamin/typst.ts). We have made you an Astro-ish wrapper that you cannot refuse!

<img src="https://repository-images.githubusercontent.com/836661120/7c4046ff-03be-45dc-a28b-393d23dcd614" alt="Demo" width="500" />

## Features

- [x] Import packages in [Typst Universe](https://typst.app/universe/)
- [x] `import` / `include` / `read` files or resources
- [x] Use system fonts
- [x] Selectable, clickable text layer
- [x] Set scale
- [x] Static SVGs without JavaScript
- [x] Static HTML output without JavaScript
- [x] [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [x] Write frontmatter directly in `.typ`
- [x] Jump between internal links ([client JS](https://github.com/OverflowCat/astro-typst/issues/6) needed)
- [x] Pass JS data to typst using the component ([how](https://github.com/OverflowCat/astro-typst/issues/2))
- [ ] Pass data from typst to JS
- [ ] Render to `<img>` with `src=` emitted SVG assets [WIP]
- [ ] Responsive SVGs
- [ ] [Paged output](https://github.com/OverflowCat/astro-typst/issues/3)
- [ ] Add font files or blobs

## Installation

```bash
npm install astro-typst
# or
pnpm add astro-typst
# or
yarn add astro-typst
```

## Usage

### As an integration

```js
// astro.config.mjs
import { typst } from 'astro-typst';

... // other imports

export default defineConfig({
  integrations: [
    /** other integrations */...,
    typst({
      options: {
        remPx: 14,
      },
      target: (id: string) => {
        console.debug(`Detecting ${id}`);
        if (id.endsWith('.html.typ') || id.includes('/html/'))
          return "html";
        return "svg";
      },
    }),
  ],
});
```

The `detect` function determines which mode a file will render in. The default is:

```
*.html.typ => html export
 *.svg.typ =>  svg export
**/html/** => html export
 **/svg/** =>  svg export
other => use the value of mode.default
```

Then you can use `.typ` files just like anything else in Astro: render directly by router, or import in another file.

Example:

```mdx
import Paper from "./_test.typ";

<Paper />
```

Force HTML output:

```mdx
import Paper from "./_test.typ?html";

<Paper />
```

Force SVG output:
```mdx
import Paper from "./_test.typ?svg";

<Paper />
```

### As a component

To use the component, you need to manually install a dependency to avoid SSR errors:

```
npm install @myriaddreamin/typst-ts-node-compiler
# or
pnpm add @myriaddreamin/typst-ts-node-compiler
# or
yarn add @myriaddreamin/typst-ts-node-compiler
```

and add this to your `/astro.config.(t|j)s/`:

```diff
export default defineConfig({
  ...,
  vite: {
    ssr: {
-      external: [...],
+      external: [..., "@myriaddreamin/typst-ts-node-compiler"],
    },
    ...,
  },
  ...,
});
```

Then, you can pass either one of `code | src | input` to the component:

```astro
---
import { Typst } from "astro-typst/src/components";
const code = `
#set page(margin: 1em)
#let typst  = {
  text(font: "Linux Libertine", weight: "semibold", fill: eastern)[typst]
}
#show "Typst": typst

== Typst: Compose paper faster

$ cases(
dot(x) = A x + B u = mat(delim: "[", 0, 0, dots.h.c, 0, - a_n; 1, 0, dots.h.c, 0, - a_(n - 1); 0, 1, dots.h.c, 0, - a_(n - 2); dots.v, dots.v, dots.down, dots.v, dots.v; 0, 0, dots.h.c, 1, - a_1) x + mat(delim: "[", b_n; b_(n - 1); b_(n - 2); dots.v; b_1) u,

y = C x = mat(delim: "[", 0, 0, dots.h.c, 1) x
) $

#set text(font: ("Garamond", "Noto Serif CJK SC"))

#import "@preview/tablem:0.1.0": tablem

#tablem[
  | *English* | *German* | *Chinese* | *Japanese* |
  | --------- | -------- | --------- | ---------- |
  | Cat       | Katze    | 猫        | 猫         |
  | Fish      | Fisch    | 鱼        | 魚         |
]
`;
---

<Typst code={code} />

<!-- or HTML output: -->

<Typst code={code} target="html" />
```

### In content collections

See [demo](/src/content/).

#### Frontmatter

> [`metadata`](https://typst.app/docs/reference/introspection/metadata/) exposes a value to the query system without producing visible content.

Attach a label `frontmatter` to the metadata declaration:

```typ
#let desc = [$oo$ fun with `math`]
#metadata(
  (
    title: "Test page",
    author: "Neko",
    desc: desc,
    date:  datetime(
      year: 2024,
      month: 8,
      day: 7,
    ),
  )
)<frontmatter>
```

yields

```json
{
  "title": "Test page",
  "author": "Neko",
  "desc": {
    "children": [
      {
        "block": false,
        "body": {
          "func": "text",
          "text": "∞"
        },
        "func": "equation"
      },
      { "func": "space" },
      { "func": "text", "text": "fun with" },
      { "func": "space" },
      {
        "block": false,
        "func": "raw",
        "text": "math"
      }
    ],
    "func": "sequence"
  },
  "date": "datetime(year: 2024, month: 8, day: 7)"
}
```

### Internal links

Add the following snippet to your page:

```js
/**
Copyright 2025 Myriad-Dreamin

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function findAncestor(el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}

window.handleTypstLocation = function (elem, page, x, y) {
  const docRoot = findAncestor(elem, 'typst-doc');
  const children = docRoot.children;
  let nthPage = 0;
  for (let i = 0; i < children.length; i++) {
    if (children[i].tagName === 'g') {
      nthPage++;
    }
    if (nthPage == page) {
      const page = children[i];
      const dataWidth = page.getAttribute('data-page-width');
      const dataHeight = page.getAttribute('data-page-height');
      const rect = page.getBoundingClientRect();
      const xOffsetInner = Math.max(0, x / dataWidth - 0.05) * rect.width;
      const yOffsetInner = Math.max(0, y / dataHeight - 0.05) * rect.height;
      const xOffsetInnerFix = (x / dataWidth) * rect.width - xOffsetInner;
      const yOffsetInnerFix = (y / dataHeight) * rect.height - yOffsetInner;

      const docRoot = document.body || document.firstElementChild;
      const basePos = docRoot.getBoundingClientRect();

      const xOffset = rect.left - basePos.left + xOffsetInner;
      const yOffset = rect.top - basePos.top + yOffsetInner;
      const left = xOffset + xOffsetInnerFix;
      const top = yOffset + yOffsetInnerFix;

      console.log('scrolling to', xOffset, yOffset, left, top);

      window.scrollTo(xOffset, yOffset);
      return;
    }
  }
};
```

## Development

### Playground

```bash
pnpm tsc -w
# in another terminal
pnpm dev
```

### Build package

```bash
pnpm compile
```
