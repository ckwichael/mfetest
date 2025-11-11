import React from "react";

export interface MfeWidgetProps {
    userName?: string;
}

const Widget: React.FC<MfeWidgetProps> = ({ userName }) => {
    return (
        <div>
            <p style={{ margin: "4px 0 8px" }}>Static Tasks Widget</p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Build microfrontend shell</li>
                <li>Wire registry service</li>
                <li>Test dynamic widget loading</li>
            </ul>
            <small style={{ color: "#666" }}>
                User: <strong>{userName ?? "Guest"}</strong>
            </small>
        </div>
    );
};

export default Widget;
