"use client";

import React, { useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useFeatureCardContext } from "./FeatureCardContext";

export type SimulationState = "idle" | "playing" | "paused";

interface SimulationControlsProps {
    state: SimulationState;
    onPlay: () => void;
    onPause: () => void;
    onStop: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
    state,
    onPlay,
    onPause,
    onStop,
}) => {
    const { setControls } = useFeatureCardContext();

    // Handle Active Controls Hoisting (Top Right of Feature Card)
    useEffect(() => {
        if (state === "idle") {
            setControls(null);
            return;
        }

        setControls(
            <div className="flex items-center gap-2 mt-[90px] mr-8"> {/* Aligned with Feature Card Title */}
                {/* Pause/Resume Button */}
                {state === "playing" ? (
                    <motion.button
                        onClick={onPause}
                        className="group relative rounded-full p-[1px] overflow-hidden transition-transform"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Pause"
                    >
                        {/* Animated Gradient Border */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] via-[#34d399] via-[#a78bfa] to-[#fb923c] animate-gradient-shift opacity-80 group-hover:opacity-100" />

                        {/* Inner Content */}
                        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 group-hover:bg-slate-900/80 transition-colors">
                            <Pause size={14} className="text-white relative z-10" fill="currentColor" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest relative z-10">Pause</span>
                        </div>
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onPlay}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Resume"
                    >
                        <Play size={14} className="text-emerald-400" fill="currentColor" />
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Resume</span>
                    </motion.button>
                )}

                {/* Stop/Reset Button */}
                <motion.button
                    onClick={onStop}
                    className="p-1.5 rounded-full bg-slate-800/50 border border-slate-700/30 hover:bg-red-500/20 hover:border-red-500/50 transition-colors group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Reset"
                >
                    <RotateCcw size={14} className="text-slate-400 group-hover:text-red-400" />
                </motion.button>
            </div>
        );

        return () => setControls(null);
    }, [state, onPlay, onPause, onStop, setControls]);

    // Initial state: Render Big Play Button content in-place (centered in simulation box)
    if (state === "idle") {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
                <motion.button
                    onClick={onPlay}
                    className="group relative flex items-center gap-3 px-8 py-4 rounded-full transition-all overflow-hidden shadow-[0_0_30px_rgba(96,165,250,0.3)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Play simulation"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] via-[#34d399] via-[#a78bfa] to-[#fb923c] opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] via-[#34d399] via-[#a78bfa] to-[#fb923c] opacity-0 group-hover:opacity-100 transition-opacity animate-gradient-shift" />

                    {/* Icon and Text */}
                    <Play size={24} className="relative z-10 text-white" fill="currentColor" />
                    <span className="relative z-10 text-base font-bold text-white uppercase tracking-wider">
                        Play
                    </span>
                </motion.button>
            </div>
        );
    }

    return null;
};
