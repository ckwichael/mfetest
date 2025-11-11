const http = require("http");
const REGISTRY_URL = process.env.REGISTRY_URL || "http://registry:5000";
const PUBLIC_URL = process.env.PUBLIC_URL || "http://mfe-vanilla:80";
const manifest = {
    id: "mfe-vanilla",
    displayName: "Vanilla",
    remoteEntryUrl: `${PUBLIC_URL}/remoteModule.js`, // ES module URL
    pageRoute: "/vanilla",
    exposedPageModule: "./Page",
    exposedWidgetModule: "./Widget",
    slots: ["dashboard"],
    order: 40,
    runtime: "vanilla"
};
function postJSON(url, data) {
    return new Promise((resolve, reject) => {
        const { hostname, port, pathname, search } = new URL(url);
        const body = JSON.stringify(data);
        const req = http.request({
            hostname, port, path: pathname + (search || ""), method: "POST",
            headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
        },
            res => { res.on("data", () => { }); res.on("end", () => res.statusCode >= 200 && res.statusCode < 300 ? resolve() : reject(new Error("HTTP " + res.statusCode))); });
        req.on("error", reject); req.write(body); req.end();
    });
}
(async () => {
    const url = `${REGISTRY_URL}/api/mfe/register`;
    for (let i = 1; i <= 30; i++) {
        try { await postJSON(url, manifest); console.log("[mfe-vanilla] registered"); return; }
        catch (e) { console.warn(`[mfe-vanilla] registry unavailable (${i}/30): ${e.message}`); await new Promise(r => setTimeout(r, 2000)); }
    }
    console.error("[mfe-vanilla] failed to register");
})();
