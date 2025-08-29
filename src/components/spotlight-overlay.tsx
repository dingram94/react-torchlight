import React, { useCallback, useEffect, useState } from "react";
import { useSpotlight } from "../index";
import { SpotlightOverlayProps } from "../types";

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  className = "",
  overlayColor = "#000000",
  overlayOpacity = 0.7,
  highlightPadding = 8,
  borderRadius = 8,
  animationDuration = 300,
  showTooltip = true,
  tooltipClassName = "",
}) => {
  const { tours, activeTour, nextStep, prevStep, stopTour } = useSpotlight();
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
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
    if (!isVisible) return;

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
    if (!isVisible || !activeTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

  const highlightStyle: React.CSSProperties = {
    left: highlightRect.left - highlightPadding,
    top: highlightRect.top - highlightPadding,
    width: highlightRect.width + highlightPadding * 2,
    height: highlightRect.height + highlightPadding * 2,
    borderRadius: `${borderRadius}px`,
    transitionDuration: `${animationDuration}ms`,
  };

  const tooltipPosition = getTooltipPosition(highlightRect, currentStep.placement || "bottom");

  const tooltipStyle: React.CSSProperties = {
    ...tooltipPosition,
    transitionDuration: `${animationDuration}ms`,
  };

  return (
    <div className={`spotlight-overlay ${className}`}>
      {/* Dark overlay with cutout */}
      <svg className="spotlight-overlay__svg">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={highlightStyle.left}
              y={highlightStyle.top}
              width={highlightStyle.width}
              height={highlightStyle.height}
              rx={borderRadius}
              fill="black"
              style={{
                transitionDuration: `${animationDuration}ms`,
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={overlayColor} fillOpacity={overlayOpacity} mask="url(#spotlight-mask)" />
      </svg>

      {/* Tooltip */}
      {showTooltip && (currentStep.title || currentStep.content) && (
        <div className={`spotlight-tooltip ${tooltipClassName}`} style={tooltipStyle}>
          {currentStep.title && <h3 className="spotlight-tooltip__title">{currentStep.title}</h3>}
          {currentStep.content && <p className="spotlight-tooltip__content">{currentStep.content}</p>}

          <div className="spotlight-tooltip__footer">
            <div className="spotlight-tooltip__step-counter">
              {currentTour.currentStepIndex + 1} of {currentTour.steps.length}
            </div>

            <div className="spotlight-tooltip__button-group">
              {currentTour.currentStepIndex > 0 && (
                <button className="spotlight-tooltip__button" onClick={() => prevStep(activeTour!)}>
                  Previous
                </button>
              )}

              <button className="spotlight-tooltip__button" onClick={() => stopTour(activeTour!)}>
                Skip
              </button>

              <button className="spotlight-tooltip__button--primary" onClick={() => nextStep(activeTour!)}>
                {currentTour.currentStepIndex === currentTour.steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getTooltipPosition(highlightRect: DOMRect, placement: "top" | "bottom" | "left" | "right") {
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
