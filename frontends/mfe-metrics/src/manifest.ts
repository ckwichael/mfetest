import type { MicrofrontendRegistration } from "./types";

export const manifest: MicrofrontendRegistration = {
    id: "mfe-metrics",
    displayName: "Metrics",
    remoteEntryUrl: "http://localhost:3002/remoteEntry.js",
    pageRoute: "/metrics",
    exposedPageModule: "./Page",
    exposedWidgetModule: "./Widget",
    slots: ["dashboard"],
    order: 20,
    runtime: "react"
};
