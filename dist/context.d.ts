import React from "react";
import { TorchlightContextProps, TorchlightProviderProps, TorchlightStep, TorchlightToursRegistry } from "./types";
export declare const TorchlightContext: React.Context<TorchlightContextProps<never> | null>;
export declare const TorchlightInternalProvider: React.FC<TorchlightProviderProps>;
export declare const useTorchlight: () => TorchlightContextProps<keyof TorchlightToursRegistry>;
export declare const useTorchlightSteps: <TourId extends keyof TorchlightToursRegistry, T extends string>(tourId: TourId, steps: Omit<TorchlightStep<T>, "target" | "tourId">[]) => Record<T, React.RefObject<any>>;
