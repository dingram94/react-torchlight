import React from "react";
declare global {
    interface TorchlightToursRegistry {
    }
}
import { TorchlightContextProps, TorchlightProviderProps, TorchlightStep } from "./types";
export declare const TorchlightContext: React.Context<TorchlightContextProps<string> | null>;
export declare const TorchlightProvider: React.FC<TorchlightProviderProps>;
export declare const useTorchlight: () => TorchlightContextProps<string>;
export declare const useTorchlightSteps: <TourId extends keyof TorchlightToursRegistry, T extends string>(tourId: TourId, steps: Omit<TorchlightStep<T>, "target" | "tourId">[]) => Record<T, React.RefObject<any>>;
