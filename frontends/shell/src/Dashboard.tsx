import React, { useEffect, useState } from "react";
import UmcHost from "./UmcHost";
import type { MicrofrontendManifest } from "./types";

// If you prefer, move this into a config file or env var.
const REGISTRY_URL = "http://localhost:5000";

const Dashboard: React.FC = () => {
    const [widgets, setWidgets] = useState<MicrofrontendManifest[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const res = await fetch(`${REGISTRY_URL}/api/mfe/widgets?slot=dashboard`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data: MicrofrontendManifest[] = await res.json();
                if (!cancelled) {
                    setWidgets([...data].sort((a, b) => a.order - b.order));
                }
            } catch (e: any) {
                if (!cancelled) setErr(e?.message ?? "Failed to load dashboard widgets");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <div>Loading dashboard…</div>;
    if (err) return <div style={{ color: "#b91c1c" }}>Error: {err}</div>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
            }}
        >
            {widgets.map((m) => (
                <section
                    key={m.id}
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: 12,
                        background: "#fff",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>{m.displayName}</h3>
                    <UmcHost url={m.remoteModuleUrl} kind="widget" />
                </section>
            ))}
        </div>
    );
};

export default Dashboard;
