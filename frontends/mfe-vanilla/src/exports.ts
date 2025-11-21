export const umcVersion = "1.0";
export const id = "mfe-vanilla";
export const displayName = "Vanilla";
export const capabilities = { widget: true, page: true, slots: ["dashboard"] };

export function mount(target: HTMLElement, kind: "widget" | "page") {
    const el = document.createElement("div");
    el.className = "vanilla-root";
    el.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    el.innerHTML = kind === "widget"
        ? `<p style="margin:0">Vanilla Widget (UMC)</p>`
        : `<h1 style="margin:0 0 8px">Vanilla Page (UMC)</h1><p>No framework here.</p>`;
    target.appendChild(el);
    (target as any).__node = el;
}
export function unmount(target: HTMLElement) {
    const el = (target as any).__node;
    if (el && target.contains(el)) target.removeChild(el);
}
