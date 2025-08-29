import React from "react";
declare global {
    interface TorchlightToursRegistry {
    }
}
type TOUR_IDS = Record<string, string>;
type TourId = string;
export { TorchlightContext, TorchlightProvider, useTorchlight, useTorchlightSteps, } from "./context";
export { TorchlightOverlay } from "./components/torchlight-overlay";
export { default as createTypeScriptPlugin } from "./plugins/typescript";
export { createTransformer as createTypeScriptTransformer } from "./plugins/typescript";
export { vitePluginTours as createVitePlugin } from "./plugins/vite";
export type { TOUR_IDS, TourId };
export type { TorchlightContextProps, TorchlightProviderProps, TorchlightStep, TorchlightTour, } from "./types";
export declare const TorchlightProviderWithOverlay: React.FC<{
    children: React.ReactNode;
    overlayProps?: any;
}>;
