// Node-side startup registration for mfe-notifications
const http = require("http");

const REGISTRY_URL = process.env.REGISTRY_URL || "http://registry:5000";
const PUBLIC_URL = process.env.PUBLIC_URL || "http://mfe-notifications:80"; // what browsers load
const ID = process.env.MFE_ID || "mfe-notifications";
const NAME = process.env.MFE_NAME || "Notifications";
const PAGE_ROUTE = process.env.MFE_PAGE || "/notifications";
const ORDER = Number(process.env.MFE_ORDER || 30);

const manifest = {
    id: ID,
    displayName: NAME,
    remoteModuleUrl: `${PUBLIC_URL}/remoteModule.js`, // <— rename & ES module
    order: ORDER,
    capabilities: { widget: true, page: true, slots: ["dashboard"] }
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
