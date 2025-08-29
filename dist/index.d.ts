import React from "react";
declare global {
    interface SpotlightToursRegistry {
    }
}
type TOUR_IDS = Record<string, string>;
type TourId = string;
import { SpotlightContextProps, SpotlightProviderProps, SpotlightStep } from "./types";
export type { TOUR_IDS, TourId };
export type { SpotlightContextProps, SpotlightProviderProps, SpotlightStep, SpotlightTour, } from "./types";
export declare const SpotlightContext: React.Context<SpotlightContextProps<string> | null>;
export declare const SpotlightProvider: React.FC<SpotlightProviderProps>;
export declare const useSpotlight: () => SpotlightContextProps<string>;
export declare const useSpotlightSteps: <TourId extends keyof SpotlightToursRegistry, T extends string>(tourId: TourId, steps: Omit<SpotlightStep<T>, "target" | "tourId">[]) => Record<T, React.RefObject<any>>;
export declare const defineTours: <T extends Record<string, any>>(tours: T) => T;
export { SpotlightOverlay } from "./components/spotlight-overlay";
export { default as createTypeScriptPlugin } from "./plugins/typescript-plugin";
export { createTransformer as createTypeScriptTransformer } from "./plugins/typescript-plugin";
export { vitePluginTours as createVitePlugin } from "./plugins/vite-plugin";
