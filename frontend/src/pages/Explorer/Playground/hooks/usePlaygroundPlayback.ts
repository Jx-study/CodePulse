import { useState, useCallback, useEffect, useRef } from "react";

export function usePlaygroundPlayback() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const totalStepsRef = useRef(0);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);
  const handleNext = useCallback(
    () => setCurrentStep((s) => Math.min(s + 1, totalStepsRef.current - 1)),
    [],
  );
  const handlePrev = useCallback(
    () => setCurrentStep((s) => Math.max(s - 1, 0)),
    [],
  );
  const handleStepChange = useCallback((step: number) => setCurrentStep(step), []);
  const handleSpeedChange = useCallback((speed: number) => setPlaybackSpeed(speed), []);

  const resetAll = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  // Playground calls this after computing totalSteps to keep the ref in sync
  const setTotalSteps = useCallback((n: number) => {
    totalStepsRef.current = n;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= totalStepsRef.current - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed]);

  return {
    currentStep,
    isPlaying,
    playbackSpeed,
    handlePlay,
    handlePause,
    handleReset,
    handleNext,
    handlePrev,
    handleStepChange,
    handleSpeedChange,
    resetAll,
    setTotalSteps,
  };
}
