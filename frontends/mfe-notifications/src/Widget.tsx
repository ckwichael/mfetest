import React from "react";

export interface MfeWidgetProps {
    userName?: string;
}

const Widget: React.FC<MfeWidgetProps> = ({ userName }) => {
    return (
        <div>
            <p style={{ margin: "4px 0 8px" }}>Static Notifications Widget</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Build: Successful</li>
                <li>New user signups: 3</li>
                <li>Alerts: 0 critical</li>
            </ul>
            <small style={{ color: "#666" }}>
                Viewer: <strong>{userName ?? "Guest"}</strong>
            </small>
        </div>
    );
};

export default Widget;
