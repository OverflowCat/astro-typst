import { renderToSVGString } from "./typst.js";
export type TypstComponent = {
    name: "TypstComponent";
    svg: string;
}

export default function () {
    return {
        name: 'vite-plugin-typ',
        async transform(code: string, id: string) {
            if (id.endsWith('.typ')) {
                try {
                    const svg = await renderToSVGString(code, {});
                    const component: TypstComponent = {
                        name: "TypstComponent",
                        svg
                    };
                    return {
                        code: `export default ${JSON.stringify(component)}`,
                        map: null,
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    };
}
