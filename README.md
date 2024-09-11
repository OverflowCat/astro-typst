# `astro-typst`

An Astro Integration that lets you render Typst within Astro.

<img src="https://github.com/user-attachments/assets/613eaf8e-53da-4cf0-bbaa-f32592d7f742" alt="Demo" width="400" />

## Features

- [x] Import packages in [Typst Universe](https://typst.app/universe/)
- [x] `import` / `include` / `read` files or resources
- [x] Use system fonts
- [x] Selectable, clickable text layer
- [x] Set scale
- [x] Static SVGs without JavaScript
- [ ] Responsive SVGs
- [ ] Add font files or blobs
- [x] [Content collections](https://docs.astro.build/en/guides/content-collections/)

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
    integrations: [/** other integrations */ ..., typst()],
});
```

Then you can use `.typ` files just like anything else in Astro: render directly by router, or import in another file.

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
