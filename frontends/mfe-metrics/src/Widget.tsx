import React from "react";

export interface MfeWidgetProps {
    userName?: string;
}

const Widget: React.FC<MfeWidgetProps> = ({ userName }) => {
    return (
        <div>
            <p style={{ margin: "4px 0 8px" }}>Static Metrics Widget</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Latency: 42 ms</li>
                <li>Throughput: 1.2k events/s</li>
                <li>Error rate: 0.1%</li>
            </ul>
            <small style={{ color: "#666" }}>
                Viewer: <strong>{userName ?? "Guest"}</strong>
            </small>
        </div>
    );
};

export default Widget;
