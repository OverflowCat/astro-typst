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

### As a component
