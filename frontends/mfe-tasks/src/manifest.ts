import type { MicrofrontendRegistration } from "./types";

export const manifest: MicrofrontendRegistration = {
    id: "mfe-tasks",
    displayName: "Tasks",
    remoteEntryUrl: "http://localhost:3001/remoteEntry.js",
    pageRoute: "/tasks",
    exposedPageModule: "./Page",
    exposedWidgetModule: "./Widget",
    slots: ["dashboard"],
    order: 10
};
