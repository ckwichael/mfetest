// Universal Microfrontend Contract (UMC) - minimal types used by the shell

export interface Capabilities {
  widget?: boolean;
  page?: boolean;
  slots?: string[];
}

export interface MicrofrontendManifest {
  id: string;
  displayName: string;
  remoteModuleUrl: string; // ES module URL exporting mount/unmount
  order: number;
  capabilities?: Capabilities;
  pageRoute?: string | null; // optional metadata
}
