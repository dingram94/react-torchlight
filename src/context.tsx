import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  TorchlightContextProps,
  TorchlightProviderProps,
  TorchlightStep,
  TorchlightTour,
  TorchlightToursRegistry,
  TorchlightConfig,
} from "./types";

export const TorchlightContext = createContext<TorchlightContextProps<
  keyof TorchlightToursRegistry
> | null>(null);

export const TorchlightInternalProvider: React.FC<TorchlightProviderProps> = ({
  children,
  overlayProps = {},
  config = {},
}) => {
  const [tours, setTours] = useState<Map<string, TorchlightTour>>(new Map());
  const [activeTour, setActiveTour] = useState<
    keyof TorchlightToursRegistry | null
  >(null);

  const registerStep = useCallback(
    (step: Omit<TorchlightStep, "target">, ref: React.RefObject<any>) => {
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
          const isIdentical =
            existingStep.order === newStep.order &&
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
        } else {
          const newSteps = [...tour.steps, newStep].sort(
            (a, b) => a.order - b.order
          );
          newTours.set(step.tourId, {
            ...tour,
            steps: newSteps,
          });
        }

        return newTours;
      });
    },
    []
  );

  const unregisterStep = useCallback(
    (stepId: string, tourId: keyof TorchlightToursRegistry) => {
      setTours((prev) => {
        const newTours = new Map(prev);
        const tour = newTours.get(tourId as string);

        if (!tour) return prev;

        const newSteps = tour.steps.filter((s) => s.id !== stepId);

        if (newSteps.length === 0) {
          newTours.delete(tourId as string);
          if (activeTour === tourId) {
            setActiveTour(null);
          }
        } else {
          newTours.set(tourId as string, {
            ...tour,
            steps: newSteps,
            currentStepIndex: Math.min(
              tour.currentStepIndex,
              newSteps.length - 1
            ),
          });
        }

        return newTours;
      });
    },
    [activeTour]
  );

  const startTour = useCallback((tourId: keyof TorchlightToursRegistry) => {
    setTours((prev) => {
      const newTours = new Map(prev);
      const tour = newTours.get(tourId as string);

      if (!tour) {
        console.warn(
          `Tour "${String(
            tourId
          )}" not found. Make sure all steps are registered.`
        );
        return prev;
      }

      if (tour.steps.length === 0) {
        console.warn(
          `Tour "${String(
            tourId
          )}" has no steps. Make sure components with steps are mounted.`
        );
        return prev;
      }

      newTours.set(tourId as string, {
        ...tour,
        isActive: true,
        currentStepIndex: 0,
      });

      return newTours;
    });

    setActiveTour(tourId);
  }, []);

  const stopTour = useCallback(
    (tourId: keyof TorchlightToursRegistry) => {
      setTours((prev) => {
        const newTours = new Map(prev);
        const tour = newTours.get(tourId as string);

        if (tour) {
          newTours.set(tourId as string, {
            ...tour,
            isActive: false,
          });
        }

        return newTours;
      });

      if (activeTour === tourId) {
        setActiveTour(null);
      }
    },
    [activeTour]
  );

  const nextStep = useCallback((tourId: keyof TorchlightToursRegistry) => {
    setTours((prev) => {
      const newTours = new Map(prev);
      const tour = newTours.get(tourId as string);

      if (!tour) return prev;

      if (tour.currentStepIndex < tour.steps.length - 1) {
        newTours.set(tourId as string, {
          ...tour,
          currentStepIndex: tour.currentStepIndex + 1,
        });
      } else {
        newTours.set(tourId as string, {
          ...tour,
          isActive: false,
        });
        setActiveTour(null);
      }

      return newTours;
    });
  }, []);

  const prevStep = useCallback((tourId: keyof TorchlightToursRegistry) => {
    setTours((prev) => {
      const newTours = new Map(prev);
      const tour = newTours.get(tourId as string);

      if (tour && tour.currentStepIndex > 0) {
        newTours.set(tourId as string, {
          ...tour,
          currentStepIndex: tour.currentStepIndex - 1,
        });
      }

      return newTours;
    });
  }, []);

  const goToStep = useCallback(
    (tourId: keyof TorchlightToursRegistry, stepIndex: number) => {
      setTours((prev) => {
        const newTours = new Map(prev);
        const tour = newTours.get(tourId as string);

        if (tour && stepIndex >= 0 && stepIndex < tour.steps.length) {
          newTours.set(tourId as string, {
            ...tour,
            currentStepIndex: stepIndex,
          });
        }

        return newTours;
      });
    },
    []
  );

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <TorchlightContext.Provider value={contextValue}>
      {children}
    </TorchlightContext.Provider>
  );
};

export const useTorchlight = (): TorchlightContextProps<
  keyof TorchlightToursRegistry
> => {
  const context = useContext(TorchlightContext);

  if (!context) {
    throw new Error("useTorchlight must be used within a TorchlightProvider");
  }

  return context;
};

// Type-safe hook that registers tours and provides IntelliSense
export const useTorchlightSteps = <
  TourId extends keyof TorchlightToursRegistry,
  T extends string
>(
  tourId: TourId,
  steps: Omit<TorchlightStep<T>, "target" | "tourId">[]
) => {
  const { registerStep, unregisterStep } = useTorchlight();

  const refsRef = useRef<Record<T, React.RefObject<any>>>(
    {} as Record<T, React.RefObject<any>>
  );

  steps.forEach((step) => {
    if (!refsRef.current[step.id]) {
      refsRef.current[step.id] = { current: null };
    }
  });

  const currentStepsRef = useRef<string>("");
  const registeredStepsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stepsSignature = steps
      .map((s) => `${s.id}:${s.order}:${s.title || ""}:${s.placement || ""}`)
      .sort()
      .join("|");

    if (currentStepsRef.current !== stepsSignature) {
      steps.forEach((step) => {
        registerStep(
          {
            id: step.id,
            tourId: tourId as string,
            order: step.order,
            title: step.title,
            content: step.content,
            placement: step.placement || "bottom",
          },
          refsRef.current[step.id]
        );
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
      registerStep(
        {
          id: step.id,
          tourId: tourId as string,
          order: step.order,
          title: step.title,
          content: step.content,
          placement: step.placement || "bottom",
        },
        refsRef.current[step.id]
      );
    });
  }, [steps.map((s) => s.content || "").join(""), tourId, registerStep]);

  return refsRef.current;
};
