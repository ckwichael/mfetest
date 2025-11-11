import React from "react";

export interface MfePageProps {
    userName?: string;
}

const Page: React.FC<MfePageProps> = ({ userName }) => {
    return (
        <div>
            <h1>Metrics Page</h1>
            <p>Static metrics dashboard for demo purposes.</p>

            <div
                style={{
                    display: "flex",
                    gap: 16,
                    marginTop: 16,
                    flexWrap: "wrap"
                }}
            >
                <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 4 }}>
                    <strong>CPU</strong>
                    <p style={{ margin: 0 }}>37%</p>
                </div>
                <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 4 }}>
                    <strong>Memory</strong>
                    <p style={{ margin: 0 }}>5.4 GB</p>
                </div>
                <div style={{ border: "1px solid #ddd", padding: 8, borderRadius: 4 }}>
                    <strong>Disk I/O</strong>
                    <p style={{ margin: 0 }}>120 MB/s</p>
                </div>
            </div>

            <p style={{ marginTop: 16 }}>
                Viewer: <strong>{userName ?? "Guest"}</strong>
            </p>
        </div>
    );
};

export default Page;
