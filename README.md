# `astro-typst`

An Astro Integration that lets you render Typst within Astro.

## Installation

```bash
npm install astro-typst
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

![](https://github.com/user-attachments/assets/613eaf8e-53da-4cf0-bbaa-f32592d7f742)

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
