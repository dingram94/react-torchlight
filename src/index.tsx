import React from "react";
import { TorchlightOverlay } from "./components/torchlight-overlay";
import { TorchlightInternalProvider } from "./context";

// Re-export everything from context
export {
  TorchlightContext,
  TorchlightInternalProvider,
  useTorchlight,
  useTorchlightSteps,
} from "./context";

// Re-export components
export { TorchlightOverlay } from "./components/torchlight-overlay";

// Re-export plugins
export {
  createTransformer as torchlightTypeScriptPlugin,
  default as createTypeScriptPlugin,
} from "./plugins/typescript";
export { torchlightVitePlugin } from "./plugins/vite";

// Re-export types from types.ts
export type {
  TorchlightContextProps,
  TorchlightProviderProps,
  TorchlightStep,
  TorchlightTour,
} from "./types";

// Create a provider that includes the overlay
export const TorchlightProvider: React.FC<{
  children: React.ReactNode;
  overlayProps?: any;
}> = ({ children, overlayProps = {} }) => {
  return (
    <TorchlightInternalProvider overlayProps={overlayProps}>
      {children}
      <TorchlightOverlay {...overlayProps} />
    </TorchlightInternalProvider>
  );
};
