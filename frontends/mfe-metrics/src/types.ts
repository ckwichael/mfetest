export interface MicrofrontendRegistration {
    id: string;
    displayName: string;
    remoteEntryUrl: string;
    pageRoute: string;
    exposedPageModule: string;
    exposedWidgetModule: string;
    slots: string[];
    order: number;
    runtime?: "react" | "vanilla"; // optional, used for rendering
}