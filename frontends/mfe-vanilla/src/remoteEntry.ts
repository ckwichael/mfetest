// Vanilla ES module exports (no React)
// Contract: runtime='vanilla'; Widget/Page return HTMLElement (or DocumentFragment)

export const runtime = "vanilla" as const;

type Props = { userName?: string };

export function Widget(props: Props): HTMLElement {
    const box = document.createElement("section");
    box.style.border = "1px solid #ddd";
    box.style.borderRadius = "8px";
    box.style.padding = "12px";
    box.style.background = "#fff";
    box.innerHTML = `
    <h3 style="margin:0 0 8px">Vanilla Widget</h3>
    <p style="margin:0 0 8px">Hello, <strong>${props.userName ?? "Guest"}</strong>!</p>
    <ul style="margin:0;padding-left:20px">
      <li>No React</li>
      <li>Pure ES modules</li>
      <li>Lightweight runtime</li>
    </ul>
  `;
    return box;
}

export function Page(props: Props): HTMLElement {
    const root = document.createElement("div");
    root.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    root.innerHTML = `
    <h1 style="margin-top:0">Vanilla Page</h1>
    <p>This page is rendered with plain DOM APIs — no framework.</p>
    <p>Current user: <strong>${props.userName ?? "Guest"}</strong></p>
    <hr />
    <p>Why ES modules?</p>
    <ul>
      <li>Native browser loader</li>
      <li>No bundler/runtime coupling</li>
      <li>Great for small MFEs or vendors without your stack</li>
    </ul>
  `;
    return root;
}