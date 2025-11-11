// frontends/shell/src/DynamicPage.tsx
import React, { useEffect, useState } from "react";
import type { MicrofrontendManifest } from "./types";
import { loadMfeModule } from "./moduleLoader";
import VanillaMount from "./VanillaMount";

interface Props { manifest: MicrofrontendManifest; }

const DynamicPage: React.FC<Props> = ({ manifest }) => {
    const [mod, setMod] = useState<any>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const m = await loadMfeModule(manifest);
                if (!cancelled) setMod(m);
            } catch (e) {
                console.error("failed to import page", manifest.id, e);
            }
        })();
        return () => { cancelled = true; };
    }, [manifest]);

    const Page = mod?.Page;
    const runtime = (mod?.runtime ?? "react") as "react" | "vanilla";
    if (!mod) return <div>Loading {manifest.displayName}…</div>;
    return runtime === "vanilla"
        ? <VanillaMount factory={mod.Page} props={{ userName: "Cameron" }} />
        : React.createElement(mod.Page, { userName: "Cameron" });
};

export default DynamicPage;
