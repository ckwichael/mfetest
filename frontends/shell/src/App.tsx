import React, { useEffect, useMemo, useState } from "react";
import type { MicrofrontendManifest } from "./types";
import Dashboard from "./Dashboard";
import DynamicPage from "./DynamicPage";

const REGISTRY_URL = "http://localhost:5000";

type Tab =
    | { key: "dashboard"; label: "Dashboard"; type: "dashboard" }
    | { key: string; label: string; type: "page"; manifest: MicrofrontendManifest };

const App: React.FC = () => {
    const [pages, setPages] = useState<MicrofrontendManifest[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [active, setActive] = useState<string>("dashboard");

    // Fetch page-capable MFEs
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const res = await fetch(`${REGISTRY_URL}/api/mfe/pages`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: MicrofrontendManifest[] = await res.json();
                if (!cancelled) setPages(data);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message ?? "Failed to load pages");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Compose tabs: Dashboard + pages (ordered)
    const tabs: Tab[] = useMemo(() => {
        const pageTabs: Tab[] = [...pages]
            .sort((a, b) => a.order - b.order)
            .map((m) => ({ key: m.id, label: m.displayName, type: "page" as const, manifest: m }));
        return [{ key: "dashboard", label: "Dashboard", type: "dashboard" as const }, ...pageTabs];
    }, [pages]);

    // Keep active valid if tabs change
    useEffect(() => {
        if (!tabs.find((t) => t.key === active)) setActive("dashboard");
    }, [tabs, active]);

    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                minHeight: "100vh",
                background: "#f6f7f9",
            }}
        >
            <header
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    background: "#fff",
                }}
            >
                <h1 style={{ margin: 0, fontSize: 18 }}>Microfrontend Shell (UMC)</h1>
            </header>

            <nav
                style={{
                    display: "flex",
                    gap: 8,
                    padding: "8px 12px",
                    background: "#fff",
                    borderBottom: "1px solid #e5e7eb",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                }}
            >
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActive(t.key)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            background: active === t.key ? "#111827" : "#fff",
                            color: active === t.key ? "#fff" : "#111827",
                            cursor: "pointer",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <main style={{ padding: 16 }}>
                {loading && <div>Loading tabs…</div>}
                {err && <div style={{ color: "#b91c1c" }}>Error: {err}</div>}
                {!loading && !err && (
                    <>
                        {active === "dashboard" ? (
                            <Dashboard />
                        ) : (
                            (() => {
                                const tab = tabs.find((t) => t.key === active && t.type === "page") as
                                    | Extract<Tab, { type: "page" }>
                                    | undefined;
                                if (!tab?.manifest) return <div>Not found.</div>;
                                return <DynamicPage manifest={tab.manifest} />;
                            })()
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default App;
