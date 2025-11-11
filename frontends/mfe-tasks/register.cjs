// Node-side startup registration (runs inside the container)
const http = require("http");

const REGISTRY_URL = process.env.REGISTRY_URL || "http://registry:5000";
const PUBLIC_URL = process.env.PUBLIC_URL || "http://mfe-tasks:80"; // what browsers should use
const ID = process.env.MFE_ID || "mfe-tasks";
const NAME = process.env.MFE_NAME || "Tasks";
const PAGE_ROUTE = process.env.MFE_PAGE || "/tasks";
const ORDER = Number(process.env.MFE_ORDER || 10);

const manifest = {
    id: ID,
    displayName: NAME,
    remoteEntryUrl: `${PUBLIC_URL}/remoteEntry.js`,
    pageRoute: PAGE_ROUTE,
    exposedPageModule: "./Page",
    exposedWidgetModule: "./Widget",
    slots: ["dashboard"],
    order: ORDER
};

function postJSON(url, data) {
    return new Promise((resolve, reject) => {
        const { hostname, port, pathname, search } = new URL(url);
        const body = JSON.stringify(data);
        const req = http.request(
            {
                hostname,
                port,
                path: pathname + (search || ""),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            },
            res => {
                res.on("data", () => { });
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) resolve();
                    else reject(new Error("HTTP " + res.statusCode));
                });
            }
        );
        req.on("error", reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    const url = `${REGISTRY_URL}/api/mfe/register`;
    const retries = 30, delayMs = 2000;
    for (let a = 1; a <= retries; a++) {
        try {
            await postJSON(url, manifest);
            console.log(`[${ID}] registered with ${url}`);
            return;
        } catch (e) {
            console.warn(
                `[${ID}] registry unavailable (attempt ${a}/${retries}): ${e.message}`
            );
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    console.error(`[${ID}] failed to register after ${retries} attempts`);
}

main();
