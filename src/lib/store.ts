import type { AstroTypstConfig } from "./prelude";

export function setConfig(config: AstroTypstConfig) {
    (global as any)._astroTypstConfig = config;
}

export function getConfig() {
    const c = (global as any)._astroTypstConfig;
    if (!c) {
        throw new Error("Config not set");
    }
    return c as AstroTypstConfig;
}
