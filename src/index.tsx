import React from "react";
import { TorchlightOverlay } from "./components/torchlight-overlay";
import { TorchlightInternalProvider } from "./context";
import { TorchlightConfig, TorchlightOverlayProps } from "./types";

export const TorchlightProvider = ({
  children,
  overlayProps = {},
  config = {},
}: {
  children: React.ReactNode;
  overlayProps?: Partial<TorchlightOverlayProps>;
  config?: TorchlightConfig;
}) => {
  return (
    <TorchlightInternalProvider overlayProps={overlayProps} config={config}>
      {children}
      <TorchlightOverlay {...overlayProps} />
    </TorchlightInternalProvider>
  );
};

export { useTorchlight, useTorchlightSteps } from "./context";
export { torchlightVitePlugin } from "./plugins/vite";
export type { TorchlightToursRegistry } from "./types";
