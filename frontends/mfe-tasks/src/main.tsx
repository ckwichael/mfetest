import React from "react";
import ReactDOM from "react-dom/client";
import Widget from "./Widget";
import Page from "./Page";
import { manifest } from "./manifest";

declare global {
    interface Window {
        mfes?: Record<string, any>;
    }
}

window.mfes = window.mfes || {};
window.mfes[manifest.id] = {
    Widget,
    Page
};

const REGISTRY_URL = "http://localhost:5000";

async function registerWithRetry(
    retries: number = 200,
    delayMs: number = 2000
): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${REGISTRY_URL}/api/mfe/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(manifest)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            console.log("[mfe-tasks] Registered with registry");
            return;
        } catch (err) {
            console.warn(
                `[mfe-tasks] Registry unavailable (attempt ${attempt}/${retries}):`,
                err
            );
            if (attempt === retries) {
                console.error("[mfe-tasks] Giving up on registry registration");
                return;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
}

registerWithRetry();

// Dev-only render
const rootElement = document.getElementById("root");
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
            <h2>mfe-tasks dev shell</h2>
            <p>
                In production this bundle is loaded as <code>remoteEntry.js</code> and
                exposes <code>Widget</code> and <code>Page</code> on{" "}
                <code>window.mfes["mfe-tasks"]</code>.
            </p>
            <hr />
            <h3>Widget preview</h3>
            <Widget userName="DevUser" />
            <hr />
            <h3>Page preview</h3>
            <Page userName="DevUser" />
        </div>
    );
}
