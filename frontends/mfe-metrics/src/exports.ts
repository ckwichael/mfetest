// UMC v1 — no props; exports mount/unmount
import React from "react";
import ReactDOM from "react-dom/client";
import Widget from "./Widget";
import Page from "./Page";

const roots = new WeakMap<HTMLElement, any>();

export const umcVersion = "1.0";
export const id = "mfe-metrics";
export const displayName = "Metrics";
export const capabilities = { widget: true, page: true, slots: ["dashboard"] };

export async function mount(target: HTMLElement, kind: "widget" | "page") {
    const root = ReactDOM.createRoot(target);
    roots.set(target, root);
    root.render(React.createElement(kind === "widget" ? Widget : Page));
}

export async function unmount(target: HTMLElement) {
    roots.get(target)?.unmount();
    roots.delete(target);
}