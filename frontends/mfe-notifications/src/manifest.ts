import type { MicrofrontendRegistration } from "./types";

export const manifest: MicrofrontendRegistration = {
    id: "mfe-notifications",
    displayName: "Notifications",
    remoteEntryUrl: "http://localhost:3003/remoteEntry.js",
    pageRoute: "/notifications",
    exposedPageModule: "./Page",
    exposedWidgetModule: "./Widget",
    slots: ["dashboard"],
    order: 30,
    runtime: "react"
};
