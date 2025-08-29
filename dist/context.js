'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

const TorchlightContext = react.createContext(null);
const TorchlightInternalProvider = ({ children, overlayProps = {}, }) => {
    const [tours, setTours] = react.useState(new Map());
    const [activeTour, setActiveTour] = react.useState(null);
    const registerStep = react.useCallback((step, ref) => {
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
    const unregisterStep = react.useCallback((stepId, tourId) => {
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
    const startTour = react.useCallback((tourId) => {
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
    const stopTour = react.useCallback((tourId) => {
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
    const nextStep = react.useCallback((tourId) => {
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
    const prevStep = react.useCallback((tourId) => {
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
    const goToStep = react.useCallback((tourId, stepIndex) => {
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
    const contextValue = react.useMemo(() => ({
        tours,
        registerStep,
        unregisterStep,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
        activeTour,
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
    ]);
    return (jsxRuntime.jsx(TorchlightContext.Provider, { value: contextValue, children: children }));
};
const useTorchlight = () => {
    const context = react.useContext(TorchlightContext);
    if (!context) {
        throw new Error("useTorchlight must be used within a TorchlightProvider");
    }
    return context;
};
// Type-safe hook that registers tours and provides IntelliSense
const useTorchlightSteps = (tourId, steps) => {
    const { registerStep, unregisterStep } = useTorchlight();
    const refsRef = react.useRef({});
    steps.forEach((step) => {
        if (!refsRef.current[step.id]) {
            refsRef.current[step.id] = { current: null };
        }
    });
    const currentStepsRef = react.useRef("");
    const registeredStepsRef = react.useRef(new Set());
    react.useEffect(() => {
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
    react.useEffect(() => {
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

exports.TorchlightContext = TorchlightContext;
exports.TorchlightInternalProvider = TorchlightInternalProvider;
exports.useTorchlight = useTorchlight;
exports.useTorchlightSteps = useTorchlightSteps;
//# sourceMappingURL=context.js.map
