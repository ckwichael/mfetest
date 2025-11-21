import React, { useEffect, useRef } from "react";

// Simple ESM module cache so we only import each URL once
const cache = new Map<string, any>();

async function loadUmc(url: string) {
    if (cache.has(url)) return cache.get(url);
    const mod = await import(/* @vite-ignore */ url);
    if (typeof mod.mount !== "function" || typeof mod.unmount !== "function") {
        throw new Error("Module does not implement UMC (mount/unmount)");
    }
    cache.set(url, mod);
    return mod;
}

type Props = {
    url: string;
    kind: "widget" | "page";
    className?: string;
};

const UmcHost: React.FC<Props> = ({ url, kind, className }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mod: any;
        const el = ref.current!;
        (async () => {
            mod = await loadUmc(url);
            await mod.mount(el, kind);
        })();
        return () => {
            try {
                mod?.unmount?.(el);
            } catch {
                // no-op
            }
        };
    }, [url, kind]);

    return <div className={className} ref={ref} />;
};

export default UmcHost;
