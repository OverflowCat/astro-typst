import type { AstroTypstConfig } from "./prelude";

let _config: AstroTypstConfig | undefined = undefined;

export function setConfig(config: AstroTypstConfig) {
    if (_config) {
        throw new Error("Config already set");
    }
    _config = config;
    Object.freeze(_config);
}

export function getConfig() {
    if (!_config) {
        throw new Error("Config not set");
    }
    return _config;
}
