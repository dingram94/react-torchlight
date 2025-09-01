import React from "react";
import { TorchlightConfig, TorchlightOverlayProps } from "./types";
export declare const TorchlightProvider: ({ children, overlayProps, config, }: {
    children: React.ReactNode;
    overlayProps?: Partial<TorchlightOverlayProps>;
    config?: TorchlightConfig;
}) => import("react/jsx-runtime").JSX.Element;
export { useTorchlight, useTorchlightSteps } from "./context";
export { torchlightVitePlugin } from "./plugins/vite";
export type { TorchlightToursRegistry } from "./types";
