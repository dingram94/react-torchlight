import React from "react";
export type TorchlightStep<T extends string = string> = {
    id: T;
    tourId: string;
    order: number;
    title?: string;
    content?: React.ReactNode;
    placement?: "top" | "bottom" | "left" | "right";
    target: React.RefObject<any>;
};
export type TorchlightTour = {
    id: string;
    steps: TorchlightStep[];
    currentStepIndex: number;
    isActive: boolean;
};
export interface TorchlightContextProps<TourIds extends string = string> {
    tours: Map<string, TorchlightTour>;
    registerStep: (step: Omit<TorchlightStep, "target">, ref: React.RefObject<any>) => void;
    unregisterStep: (stepId: string, tourId: TourIds) => void;
    startTour: (tourId: TourIds) => void;
    stopTour: (tourId: TourIds) => void;
    nextStep: (tourId: TourIds) => void;
    prevStep: (tourId: TourIds) => void;
    goToStep: (tourId: TourIds, stepIndex: number) => void;
    activeTour: TourIds | null;
}
export type TorchlightProviderProps = {
    children: React.ReactNode;
    overlayProps?: Partial<TorchlightOverlayProps>;
};
export type TorchlightOverlayProps = {
    className?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    highlightPadding?: number;
    borderRadius?: number;
    animationDuration?: number;
    showTooltip?: boolean;
    tooltipClassName?: string;
    styles?: {
        overlay?: React.CSSProperties;
        svg?: React.CSSProperties;
        highlight?: React.CSSProperties;
        tooltip?: React.CSSProperties;
        tooltipTitle?: React.CSSProperties;
        tooltipContent?: React.CSSProperties;
        tooltipFooter?: React.CSSProperties;
        stepCounter?: React.CSSProperties;
        buttonGroup?: React.CSSProperties;
        button?: React.CSSProperties;
        primaryButton?: React.CSSProperties;
    };
};
