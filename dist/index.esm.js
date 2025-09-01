import { jsx, jsxs } from 'react/jsx-runtime';
import { createContext, useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as fs from 'fs';
import * as path from 'path';

const TorchlightContext = createContext(null);
const TorchlightInternalProvider = ({ children, overlayProps = {}, config = {}, }) => {
    const [tours, setTours] = useState(new Map());
    const [activeTour, setActiveTour] = useState(null);
    const registerStep = useCallback((step, ref) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(step.tourId) || {
                id: step.tourId,
                steps: [],
                currentStepIndex: 0,
                isActive: false,
            };
            const existingStepIndex = tour.steps.findIndex((s) => s.id === step.id);
            const newStep = { ...step, target: ref };
            if (existingStepIndex !== -1) {
                const existingStep = tour.steps[existingStepIndex];
                const isIdentical = existingStep.order === newStep.order &&
                    existingStep.title === newStep.title &&
                    existingStep.content === newStep.content &&
                    existingStep.placement === newStep.placement &&
                    existingStep.target === newStep.target;
                if (isIdentical) {
                    return prev;
                }
                const updatedSteps = [...tour.steps];
                updatedSteps[existingStepIndex] = newStep;
                updatedSteps.sort((a, b) => a.order - b.order);
                newTours.set(step.tourId, {
                    ...tour,
                    steps: updatedSteps,
                });
            }
            else {
                const newSteps = [...tour.steps, newStep].sort((a, b) => a.order - b.order);
                newTours.set(step.tourId, {
                    ...tour,
                    steps: newSteps,
                });
            }
            return newTours;
        });
    }, []);
    const unregisterStep = useCallback((stepId, tourId) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (!tour)
                return prev;
            const newSteps = tour.steps.filter((s) => s.id !== stepId);
            if (newSteps.length === 0) {
                newTours.delete(tourId);
                if (activeTour === tourId) {
                    setActiveTour(null);
                }
            }
            else {
                newTours.set(tourId, {
                    ...tour,
                    steps: newSteps,
                    currentStepIndex: Math.min(tour.currentStepIndex, newSteps.length - 1),
                });
            }
            return newTours;
        });
    }, [activeTour]);
    const startTour = useCallback((tourId) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (!tour) {
                console.warn(`Tour "${String(tourId)}" not found. Make sure all steps are registered.`);
                return prev;
            }
            if (tour.steps.length === 0) {
                console.warn(`Tour "${String(tourId)}" has no steps. Make sure components with steps are mounted.`);
                return prev;
            }
            newTours.set(tourId, {
                ...tour,
                isActive: true,
                currentStepIndex: 0,
            });
            return newTours;
        });
        setActiveTour(tourId);
    }, []);
    const stopTour = useCallback((tourId) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (tour) {
                newTours.set(tourId, {
                    ...tour,
                    isActive: false,
                });
            }
            return newTours;
        });
        if (activeTour === tourId) {
            setActiveTour(null);
        }
    }, [activeTour]);
    const nextStep = useCallback((tourId) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (!tour)
                return prev;
            if (tour.currentStepIndex < tour.steps.length - 1) {
                newTours.set(tourId, {
                    ...tour,
                    currentStepIndex: tour.currentStepIndex + 1,
                });
            }
            else {
                newTours.set(tourId, {
                    ...tour,
                    isActive: false,
                });
                setActiveTour(null);
            }
            return newTours;
        });
    }, []);
    const prevStep = useCallback((tourId) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (tour && tour.currentStepIndex > 0) {
                newTours.set(tourId, {
                    ...tour,
                    currentStepIndex: tour.currentStepIndex - 1,
                });
            }
            return newTours;
        });
    }, []);
    const goToStep = useCallback((tourId, stepIndex) => {
        setTours((prev) => {
            const newTours = new Map(prev);
            const tour = newTours.get(tourId);
            if (tour && stepIndex >= 0 && stepIndex < tour.steps.length) {
                newTours.set(tourId, {
                    ...tour,
                    currentStepIndex: stepIndex,
                });
            }
            return newTours;
        });
    }, []);
    const contextValue = useMemo(() => ({
        tours,
        registerStep,
        unregisterStep,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
        activeTour,
        config,
    }), [
        tours,
        registerStep,
        unregisterStep,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
        activeTour,
        config,
    ]);
    return (jsx(TorchlightContext.Provider, { value: contextValue, children: children }));
};
const useTorchlight = () => {
    const context = useContext(TorchlightContext);
    if (!context) {
        throw new Error("useTorchlight must be used within a TorchlightProvider");
    }
    return context;
};
// Type-safe hook that registers tours and provides IntelliSense
const useTorchlightSteps = (tourId, steps) => {
    const { registerStep, unregisterStep } = useTorchlight();
    const refsRef = useRef({});
    steps.forEach((step) => {
        if (!refsRef.current[step.id]) {
            refsRef.current[step.id] = { current: null };
        }
    });
    const currentStepsRef = useRef("");
    const registeredStepsRef = useRef(new Set());
    useEffect(() => {
        const stepsSignature = steps
            .map((s) => `${s.id}:${s.order}:${s.title || ""}:${s.placement || ""}`)
            .sort()
            .join("|");
        if (currentStepsRef.current !== stepsSignature) {
            steps.forEach((step) => {
                registerStep({
                    id: step.id,
                    tourId: tourId,
                    order: step.order,
                    title: step.title,
                    content: step.content,
                    placement: step.placement || "bottom",
                }, refsRef.current[step.id]);
                registeredStepsRef.current.add(step.id);
            });
            currentStepsRef.current = stepsSignature;
        }
        return () => {
            registeredStepsRef.current.forEach((stepId) => {
                unregisterStep(stepId, tourId);
            });
            registeredStepsRef.current.clear();
        };
    }, [tourId, registerStep, unregisterStep, steps]);
    useEffect(() => {
        steps.forEach((step) => {
            registerStep({
                id: step.id,
                tourId: tourId,
                order: step.order,
                title: step.title,
                content: step.content,
                placement: step.placement || "bottom",
            }, refsRef.current[step.id]);
        });
    }, [steps.map((s) => s.content || "").join(""), tourId, registerStep]);
    return refsRef.current;
};

const TorchlightOverlay = ({ className = "", overlayColor = "#000000", overlayOpacity = 0.7, highlightPadding = 8, borderRadius = 8, animationDuration = 300, showTooltip = true, tooltipClassName = "", }) => {
    const { tours, activeTour, nextStep, prevStep, stopTour, config } = useTorchlight();
    const [highlightRect, setHighlightRect] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const currentTour = activeTour ? tours.get(activeTour) : null;
    const currentStep = currentTour?.steps[currentTour.currentStepIndex];
    const updateHighlightPosition = useCallback(() => {
        if (!currentStep?.target.current) {
            setHighlightRect(null);
            setIsVisible(false);
            return;
        }
        const rect = currentStep.target.current.getBoundingClientRect();
        setHighlightRect(rect);
        setIsVisible(true);
    }, [currentStep]);
    // Update position when step changes
    useEffect(() => {
        updateHighlightPosition();
    }, [updateHighlightPosition]);
    // Handle scroll and resize
    useEffect(() => {
        if (!isVisible)
            return;
        const handleUpdate = () => updateHighlightPosition();
        window.addEventListener("scroll", handleUpdate, true);
        window.addEventListener("resize", handleUpdate);
        return () => {
            window.removeEventListener("scroll", handleUpdate, true);
            window.removeEventListener("resize", handleUpdate);
        };
    }, [isVisible, updateHighlightPosition]);
    // Keyboard navigation
    useEffect(() => {
        if (!isVisible || !activeTour)
            return;
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "Escape":
                    stopTour(activeTour);
                    break;
                case "ArrowRight":
                case " ":
                    e.preventDefault();
                    nextStep(activeTour);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    prevStep(activeTour);
                    break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, activeTour, nextStep, prevStep, stopTour]);
    if (!isVisible || !highlightRect || !currentTour || !currentStep) {
        return null;
    }
    const highlightStyle = {
        left: highlightRect.left - highlightPadding,
        top: highlightRect.top - highlightPadding,
        width: highlightRect.width + highlightPadding * 2,
        height: highlightRect.height + highlightPadding * 2,
        borderRadius: `${borderRadius}px`,
        transitionDuration: `${animationDuration}ms`,
    };
    const tooltipPosition = getTooltipPosition(highlightRect, currentStep.placement || "bottom");
    const tooltipStyle = {
        ...tooltipPosition,
        transitionDuration: `${animationDuration}ms`,
    };
    return (jsxs("div", { className: `torchlight-overlay ${className}`, children: [jsxs("svg", { className: "torchlight-overlay__svg", children: [jsx("defs", { children: jsxs("mask", { id: "torchlight-mask", children: [jsx("rect", { width: "100%", height: "100%", fill: "white" }), jsx("rect", { x: highlightStyle.left, y: highlightStyle.top, width: highlightStyle.width, height: highlightStyle.height, rx: borderRadius, fill: "black", style: {
                                        transitionDuration: `${animationDuration}ms`,
                                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                                    } })] }) }), jsx("rect", { width: "100%", height: "100%", fill: overlayColor, fillOpacity: overlayOpacity, mask: "url(#torchlight-mask)" })] }), showTooltip && (currentStep.title || currentStep.content) && (jsxs("div", { className: `torchlight-tooltip ${tooltipClassName}`, style: tooltipStyle, children: [currentStep.title && (jsx("h3", { className: "torchlight-tooltip__title", children: currentStep.title })), currentStep.content && (jsx("p", { className: "torchlight-tooltip__content", children: currentStep.content })), jsxs("div", { className: "torchlight-tooltip__footer", children: [jsxs("div", { className: "torchlight-tooltip__step-counter", children: [currentTour.currentStepIndex + 1, " of ", currentTour.steps.length] }), jsxs("div", { className: "torchlight-tooltip__button-group", children: [currentTour.currentStepIndex > 0 && (jsx("button", { className: "torchlight-tooltip__button", onClick: () => prevStep(activeTour), children: config?.locale?.prevButtonText || "Previous" })), jsx("button", { className: "torchlight-tooltip__button", onClick: () => stopTour(activeTour), children: config?.locale?.skipButtonText || "Skip" }), jsx("button", { className: "torchlight-tooltip__button--primary", onClick: () => nextStep(activeTour), children: currentTour.currentStepIndex === currentTour.steps.length - 1
                                            ? config?.locale?.doneButtonText || "Finish"
                                            : config?.locale?.nextButtonText || "Next" })] })] })] }))] }));
};
function getTooltipPosition(highlightRect, placement) {
    const spacing = 16;
    switch (placement) {
        case "top":
            return {
                left: Math.max(16, Math.min(window.innerWidth - 16, highlightRect.left + highlightRect.width / 2 / 2)),
                bottom: window.innerHeight - highlightRect.top + spacing,
            };
        case "bottom":
            return {
                left: Math.max(16, Math.min(window.innerWidth - 16, highlightRect.left + highlightRect.width / 2 / 2)),
                top: highlightRect.bottom + spacing,
            };
        case "left":
            return {
                right: window.innerWidth - highlightRect.left + spacing,
                top: Math.max(16, highlightRect.top + highlightRect.height / 2 - 100),
            };
        case "right":
            return {
                left: highlightRect.right + spacing,
                top: Math.max(16, highlightRect.top + highlightRect.height / 2 - 100),
            };
        default:
            return {
                left: Math.max(16, Math.min(window.innerWidth - 16, highlightRect.left + highlightRect.width / 2 / 2)),
                top: highlightRect.bottom + spacing,
            };
    }
}

function torchlightVitePlugin(options = {}) {
    const { rootFolder = "src", outputPath = "torchlight.gen.ts" } = options;
    const tourIds = new Set();
    let isDevMode = false;
    // Function to generate the types file
    const generateTypesFile = () => {
        const sortedTourIds = Array.from(tourIds).sort();
        if (sortedTourIds.length === 0) {
            console.log("⚠️ No tour IDs found. Make sure you have useTorchlightSteps calls in your code.");
            return;
        }
        const content = `
/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

// Auto-generated by torchlight-vite-plugin
// Do not edit this file manually
// Generated on: ${new Date().toISOString()}

// Extend the TorchlightToursRegistry interface from the react-torchlight package
declare module "react-torchlight" {
  interface TorchlightToursRegistry {
${sortedTourIds.map((id) => `    "${id}": "${id}";`).join("\n")}
  }
}

// Export the tour IDs for runtime use
export const TOUR_IDS = {
${sortedTourIds
            .map((id, index) => `  ${id.replace(/[^a-zA-Z0-9_]/g, "_")}: "${id}"${index < sortedTourIds.length - 1 ? "," : ""}`)
            .join("\n")}
} as const;

export type TourId = ${sortedTourIds.length > 0
            ? sortedTourIds.map((id) => `"${id}"`).join(" | ")
            : "never"};
`;
        // Create the full output path
        const fullOutputPath = path.resolve(rootFolder, outputPath);
        const outputDir = path.dirname(fullOutputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(fullOutputPath, content, "utf-8");
        console.log(`✅ Generated torchlight types with ${tourIds.size} tours: ${sortedTourIds.join(", ")}`);
    };
    // Function to scan all files during build
    const scanAllFilesForBuild = () => {
        // Don't clear existing tour IDs - rebuild the complete set from all files
        const foundTourIds = new Set();
        const scanDirectory = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        // Skip node_modules, dist, and other irrelevant directories
                        if (!["node_modules", "dist", ".git", ".next", "build"].includes(item)) {
                            scanDirectory(fullPath);
                        }
                    }
                    else if (stat.isFile() &&
                        (item.endsWith(".ts") || item.endsWith(".tsx"))) {
                        // Skip declaration files and the generated file itself
                        if (!item.endsWith(".d.ts") && !fullPath.includes(outputPath)) {
                            try {
                                const code = fs.readFileSync(fullPath, "utf-8");
                                const useTorchlightStepsRegex = /useTorchlightSteps\s*\(\s*["']([^"']+)["']/g;
                                let match;
                                while ((match = useTorchlightStepsRegex.exec(code)) !== null) {
                                    const tourId = match[1];
                                    if (tourId && tourId.trim() !== "" && tourId !== "tourId") {
                                        foundTourIds.add(tourId);
                                        console.log(`🎯 Found tour ID: ${tourId} in ${fullPath}`);
                                    }
                                }
                            }
                            catch (error) {
                                // Ignore files that can't be read
                            }
                        }
                    }
                }
            }
            catch (error) {
                // Ignore directories that can't be read
            }
        };
        try {
            scanDirectory(path.resolve(rootFolder));
            // Replace the global tourIds with the newly found ones
            tourIds.clear();
            foundTourIds.forEach((id) => tourIds.add(id));
            generateTypesFile();
        }
        catch (error) {
            console.warn("Could not scan files for tour IDs:", error);
            generateTypesFile();
        }
    };
    return {
        name: "torchlight-vite-plugin",
        configResolved(resolvedConfig) {
            isDevMode = resolvedConfig.command === "serve";
        },
        configureServer(server) {
            // Function to do a complete rebuild by scanning all files
            const rebuildAllTourIds = () => {
                console.log("🔄 Rebuilding complete tour ID list...");
                const foundTourIds = new Set();
                const scanDirectory = (dir) => {
                    try {
                        const items = fs.readdirSync(dir);
                        for (const item of items) {
                            const fullPath = path.join(dir, item);
                            const stat = fs.statSync(fullPath);
                            if (stat.isDirectory()) {
                                // Skip node_modules, dist, and other irrelevant directories
                                if (!["node_modules", "dist", ".git", ".next", "build"].includes(item)) {
                                    scanDirectory(fullPath);
                                }
                            }
                            else if (stat.isFile() &&
                                (item.endsWith(".ts") || item.endsWith(".tsx"))) {
                                // Skip declaration files and the generated file itself
                                if (!item.endsWith(".d.ts") && !fullPath.includes(outputPath)) {
                                    try {
                                        const code = fs.readFileSync(fullPath, "utf-8");
                                        const useTorchlightStepsRegex = /useTorchlightSteps\s*\(\s*["']([^"']+)["']/g;
                                        let match;
                                        while ((match = useTorchlightStepsRegex.exec(code)) !== null) {
                                            const tourId = match[1];
                                            if (tourId &&
                                                tourId.trim() !== "" &&
                                                tourId !== "tourId") {
                                                foundTourIds.add(tourId);
                                            }
                                        }
                                    }
                                    catch (error) {
                                        // Ignore files that can't be read
                                    }
                                }
                            }
                        }
                    }
                    catch (error) {
                        // Ignore directories that can't be read
                    }
                };
                scanDirectory(path.resolve(rootFolder));
                // Only update if the found tour IDs are different
                const foundArray = Array.from(foundTourIds).sort();
                const currentArray = Array.from(tourIds).sort();
                if (foundArray.join(",") !== currentArray.join(",")) {
                    tourIds.clear();
                    foundTourIds.forEach((id) => tourIds.add(id));
                    console.log(`✅ Updated tour IDs: ${foundArray.join(", ")}`);
                    generateTypesFile();
                }
            };
            // Watch for file changes and regenerate types
            server.watcher.on("change", (file) => {
                if (file.endsWith(".ts") || file.endsWith(".tsx")) {
                    // Do a complete rebuild to catch any removed tour IDs
                    setTimeout(() => {
                        rebuildAllTourIds();
                    }, 100); // Small delay to ensure file is written
                }
            });
            // Initial complete scan
            setTimeout(() => {
                rebuildAllTourIds();
            }, 500);
        },
        transform(code, id) {
            // Only process TypeScript/TSX files
            if (!id.endsWith(".ts") && !id.endsWith(".tsx")) {
                return null;
            }
            // Skip the generated file itself
            if (id.includes("torchlight.gen.ts")) {
                return null;
            }
            // Simple regex-based extraction for tour IDs
            // This is a simplified version - the TypeScript plugin provides more robust parsing
            const useTorchlightStepsRegex = /useTorchlightSteps\s*\(\s*["']([^"']+)["']/g;
            let match;
            while ((match = useTorchlightStepsRegex.exec(code)) !== null) {
                const tourId = match[1];
                if (tourId && tourId.trim() !== "" && tourId !== "tourId") {
                    tourIds.add(tourId);
                    console.log(`🎯 Found tour ID: ${tourId} in ${id}`);
                }
            }
            return null;
        },
        generateBundle() {
            // This runs during build mode
            if (!isDevMode) {
                scanAllFilesForBuild();
            }
        },
        closeBundle() {
            // This runs after the bundle is closed, which happens in both dev and build
            if (!isDevMode) {
                scanAllFilesForBuild();
            }
        },
    };
}

const TorchlightProvider = ({ children, overlayProps = {}, config = {}, }) => {
    return (jsxs(TorchlightInternalProvider, { overlayProps: overlayProps, config: config, children: [children, jsx(TorchlightOverlay, { ...overlayProps })] }));
};

export { TorchlightProvider, torchlightVitePlugin, useTorchlight, useTorchlightSteps };
//# sourceMappingURL=index.esm.js.map
