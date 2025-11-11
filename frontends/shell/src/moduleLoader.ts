// frontends/shell/src/moduleLoader.ts
import type { MicrofrontendManifest } from "./types";

const cache = new Map<string, any>();

export async function loadMfeModule(manifest: MicrofrontendManifest): Promise<any> {
    const url = manifest.remoteEntryUrl;
    if (cache.has(url)) return cache.get(url);

    // Optional cache-busting during dev:
    const withCacheBust = url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();

    // IMPORTANT: this triggers a CORS preflight; the MFE server must allow CORS
    const mod = await import(/* @vite-ignore */ withCacheBust);
    cache.set(url, mod);
    return mod;
}
