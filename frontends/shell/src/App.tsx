import React, { useEffect, useState } from "react";
import type { MicrofrontendManifest } from "./types";
import Dashboard from "./Dashboard";
import DynamicPage from "./DynamicPage";

const REGISTRY_URL = "http://localhost:5000";

const App: React.FC = () => {
    const [pages, setPages] = useState<MicrofrontendManifest[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>("__dashboard__");

    useEffect(() => {
        fetch(`${REGISTRY_URL}/api/mfe/pages`)
            .then((r) => r.json())
            .then((data: MicrofrontendManifest[]) => {
                // sort by order for deterministic tab order
                setPages(data.slice().sort((a, b) => a.order - b.order));
            })
            .catch((err) => console.error("Failed to load pages", err));
    }, []);

    const renderActiveTabContent = () => {
        if (activeTabId === "__dashboard__") {
            return <Dashboard />;
        }

        const manifest = pages.find((p) => p.id === activeTabId);
        if (!manifest) {
            return <div>Unknown MFE: {activeTabId}</div>;
        }

        return <DynamicPage manifest={manifest} />;
    };

    return (
        <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <header
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}
            >
                <div>
                    <strong>Microfrontend Shell</strong>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                    Registry: <code>{REGISTRY_URL}</code>
                </div>
            </header>

            {/* Tab bar */}
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    borderBottom: "1px solid #ddd",
                    padding: "8px 8px 0 8px",
                    background: "#fafafa"
                }}
            >
                {/* Dashboard tab */}
                <button
                    type="button"
                    onClick={() => setActiveTabId("__dashboard__")}
                    style={{
                        border: "none",
                        padding: "8px 12px",
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        background:
                            activeTabId === "__dashboard__" ? "#ffffff" : "transparent",
                        borderBottom:
                            activeTabId === "__dashboard__" ? "1px solid #ffffff" : "none",
                        cursor: "pointer"
                    }}
                >
                    Dashboard
                </button>

                {/* Dynamic MFE tabs */}
                {pages.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveTabId(p.id)}
                        style={{
                            border: "none",
                            padding: "8px 12px",
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                            background: activeTabId === p.id ? "#ffffff" : "transparent",
                            borderBottom:
                                activeTabId === p.id ? "1px solid #ffffff" : "none",
                            cursor: "pointer"
                        }}
                    >
                        {p.displayName}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <main style={{ padding: 16, background: "#ffffff" }}>
                {renderActiveTabContent()}
            </main>
        </div>
    );
};

export default App;
