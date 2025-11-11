import React from "react";
import ReactDOM from "react-dom/client";
import Widget from "./Widget";
import Page from "./Page";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
        <h2>MFE dev preview</h2>
        <h3>Widget</h3>
        <Widget userName="DevUser" />
        <h3>Page</h3>
        <Page userName="DevUser" />
    </div>
);