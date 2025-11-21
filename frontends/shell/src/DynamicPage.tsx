import React from "react";
import UmcHost from "./UmcHost";
import type { MicrofrontendManifest } from "./types";

type Props = { manifest: MicrofrontendManifest };

const DynamicPage: React.FC<Props> = ({ manifest }) => {
    return <UmcHost url={manifest.remoteModuleUrl} kind="page" />;
};

export default DynamicPage;
