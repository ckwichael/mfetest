// frontends/shell/src/Dashboard.tsx
import React, { useEffect, useState } from "react";
import type { MicrofrontendManifest } from "./types";
import { loadMfeModule } from "./moduleLoader";

const REGISTRY_URL = "http://localhost:5000";

const Dashboard: React.FC = () => {
    const [widgets, setWidgets] = useState<MicrofrontendManifest[]>([]);
    const [loaded, setLoaded] = useState<Record<string, any>>({});

    useEffect(() => {
        fetch(`${REGISTRY_URL}/api/mfe/widgets?slot=dashboard`)
            .then((r) => r.json())
            .then((data: MicrofrontendManifest[]) =>
                setWidgets(data.slice().sort((a, b) => a.order - b.order))
            )
            .catch((e) => console.error("widgets fetch failed", e));
    }, []);

    useEffect(() => {
        (async () => {
            const entries: Record<string, any> = {};
            for (const m of widgets) {
                try {
                    entries[m.id] = await loadMfeModule(m);
                } catch (e) {
                    console.error("failed to import module", m.id, e);
                }
            }
            setLoaded(entries);
        })();
    }, [widgets]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {widgets.map((m) => {
                const Widget = loaded[m.id]?.Widget;
                return (
                    <section key={m.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, background: "#fff" }}>
                        <h3 style={{ marginTop: 0 }}>{m.displayName}</h3>
                        {!Widget ? <div>Loading…</div> : <Widget userName="Cameron" />}
                    </section>
                );
            })}
        </div>
    );
};

export default Dashboard;
