import type { MicrofrontendManifest } from "./types";

// Global declaration for window.mfes
declare global {
    interface Window {
        mfes?: Record<string, any>;
    }
}

window.mfes = window.mfes || {};

export async function loadRemoteScript(
    manifest: MicrofrontendManifest
): Promise<void> {
    if (document.querySelector(`script[data-mfe-id="${manifest.id}"]`)) {
        // Already loaded
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = manifest.remoteEntryUrl;
        script.async = true;
        script.dataset.mfeId = manifest.id;
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error(`Failed to load ${manifest.remoteEntryUrl}`));
        document.body.appendChild(script);
    });
}
