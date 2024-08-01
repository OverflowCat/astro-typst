import { renderToSVGString } from "./typst";

export default function () {
    return {
        name: 'vite-plugin-typ',
        async transform(code: string, id: string) {
            if (id.endsWith('.typ')) {
                try {
                    const result = await renderToSVGString(code, {});
                    code = `const code = ${JSON.stringify(result)}; export default code;`;
                    return {
                        code,
                    };
                } catch (error) {
                    console.log(error)
                }
            }
        }
    };
}
