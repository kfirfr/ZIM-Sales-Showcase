"use client";

import { useState, useCallback } from 'react';

/**
 * Interface for the standardized simulation control hook.
 * Used by all "Pro Max" Genesys Sales Simulations.
 */
export interface SimulationControl {
    /** Whether the simulation is currently active (started) */
    isPlaying: boolean;
    /** Whether the simulation is currently paused (frozen) */
    isPaused: boolean;
    /** Whether the simulation is in its initial blurred state */
    isBlurred: boolean;
    /** Start the simulation (removes blur) */
    play: () => void;
    /** Pause/Freeze the simulation state */
    pause: () => void;
    /** Resume the simulation from paused state */
    resume: () => void;
    /** Stop and reset the simulation to initial blurred state */
    reset: () => void;
}

/**
 * Hook to manage the global control logic for simulations.
 * Enforces the "Blur -> Play -> Pause/Reset" workflow.
 */
export const useSimulationControl = (): SimulationControl => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // The component is blurred only when it is NOT playing.
    const isBlurred = !isPlaying;

    const play = useCallback(() => {
        setIsPlaying(true);
        setIsPaused(false);
    }, []);

    const pause = useCallback(() => {
        if (isPlaying) {
            setIsPaused(true);
        }
    }, [isPlaying]);

    const resume = useCallback(() => {
        if (isPlaying && isPaused) {
            setIsPaused(false);
        }
    }, [isPlaying, isPaused]);

    const reset = useCallback(() => {
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    return {
        isPlaying,
        isPaused,
        isBlurred,
        play,
        pause,
        resume,
        reset
    };
};
