"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'baseline' | 'positive' | 'drop' | 'recovery' | 'summary';

interface TooltipData {
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    x: number; // Percentage
    y: number; // Percentage
}

// --- Data ---
const TOOLTIPS: Record<Phase, TooltipData | null> = {
    idle: null,
    baseline: null,
    positive: {
        text: "Thanks for calling back so quickly.",
        sentiment: 'positive',
        x: 30,
        y: 20
    },
    drop: {
        text: "This is the third delay this month. I'm considering alternatives.",
        sentiment: 'negative',
        x: 55,
        y: 80
    },
    recovery: {
        text: "The priority unloading option sounds good, let's try it.",
        sentiment: 'positive',
        x: 85,
        y: 30
    },
    summary: null
};

// --- Component ---
export const SentimentBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');

    // --- Refs ---
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);

    // --- Helpers ---
    const wait = async (ms: number) => {
        let passed = 0;
        while (passed < ms) {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            if (stateRef.current === 'playing') passed += 50;
            await new Promise(r => setTimeout(r, 50));
        }
    };

    const waitForPlay = async () => {
        while (stateRef.current !== 'playing') {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            await new Promise(r => setTimeout(r, 50));
        }
    };

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            setPhase('idle');
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // Reset
                        setPhase('idle');
                        await wait(500);

                        // === PHASE 1: BASELINE ===
                        await waitForPlay();
                        setPhase('baseline');
                        await wait(1500);

                        // === PHASE 2: POSITIVE ===
                        await waitForPlay();
                        setPhase('positive');
                        await wait(2500);

                        // === PHASE 3: DROP ===
                        await waitForPlay();
                        setPhase('drop');
                        await wait(3000);

                        // === PHASE 4: RECOVERY ===
                        await waitForPlay();
                        setPhase('recovery');
                        await wait(2500);

                        // === PHASE 5: SUMMARY ===
                        await waitForPlay();
                        setPhase('summary');
                        await wait(6000);
                    }
                } catch (e) {
                    if (e instanceof Error && e.message !== "STOPPED") console.error(e);
                } finally {
                    isLoopingRef.current = false;
                }
            };
            loop();
        }
    }, [state]);

    // --- Render Helpers ---
    const getPathDefinition = (p: Phase) => {
        // SVG Path Definition
        // M 0 50 (Start Middle Left)
        // L 20 50 (Baseline)
        // L 40 20 (Positive)
        // L 60 85 (Drop)
        // L 80 40 (Recovery Start)
        // L 100 30 (Recovery End)

        const baseline = "M 0 60 L 20 60";
        const positive = "L 40 30";
        const drop = "L 65 90";
        const recovery = "Q 80 80 100 40"; // Bezier curve for smooth recovery

        // We construct the path based on current phase to allow drawing animation
        // However, for stroke-dashoffset animation to work best, we often render the full path 
        // and reveal it. But here we have different colors.
        // Strategy: Render separate path segments for each phase.
        return { baseline, positive, drop, recovery };
    };

    const isActive = state !== 'idle';
    const isBlur = !isActive;

    return (
        <ClientOnly>
            <div className={`relative w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none ${state === 'idle' ? 'cursor-default' : ''}`}>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                {/* IDLE STATE OVERLAY handled by SimulationControls mostly, but we add the blur effect here */}
                {state === 'idle' && (
                    <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-sm" />
                )}

                {/* VISUALIZATION CONTAINER */}
                <div className="relative w-full max-w-lg h-64 px-8">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-8 inset-y-0 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="w-full h-px bg-slate-500 border-t border-dashed border-slate-500" />
                        <div className="w-full h-px bg-slate-500" />
                        <div className="w-full h-px bg-slate-500 border-t border-dashed border-slate-500" />
                    </div>

                    {/* SVG Chart */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="positive-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="negative-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Segment 1: Baseline (Neutral) */}
                        {(phase !== 'idle') && (
                            <motion.path
                                d="M 0 50 L 20 50"
                                fill="none"
                                stroke="#94A3B8"
                                strokeWidth="2"
                                strokeDasharray="20"
                                strokeDashoffset="20"
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        )}

                        {/* Segment 2: Positive (Green) */}
                        {(phase === 'positive' || phase === 'drop' || phase === 'recovery' || phase === 'summary') && (
                            <motion.path
                                d="M 20 50 Q 25 50 40 20"
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeDasharray="40"
                                strokeDashoffset="40"
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        )}

                        {/* Segment 3: Drop (Red) */}
                        {(phase === 'drop' || phase === 'recovery' || phase === 'summary') && (
                            <motion.path
                                d="M 40 20 L 60 85"
                                fill="none"
                                stroke="#F43F5E"
                                strokeWidth="2"
                                strokeDasharray="70"
                                strokeDashoffset="70"
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        )}

                        {/* Segment 4: Recovery (Amber/Green) */}
                        {(phase === 'recovery' || phase === 'summary') && (
                            <motion.path
                                d="M 60 85 Q 80 85 100 30"
                                fill="none"
                                stroke="#F59E0B"
                                strokeWidth="2"
                                strokeDasharray="80"
                                strokeDashoffset="80"
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        )}
                    </svg>

                    {/* Active Tooltip */}
                    <AnimatePresence mode="wait">
                        {(['positive', 'drop', 'recovery'].includes(phase) && TOOLTIPS[phase]) && (
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="absolute z-10 w-64 pointer-events-none"
                                style={{
                                    left: `${TOOLTIPS[phase]?.x}%`,
                                    top: `${TOOLTIPS[phase]?.y}%`,
                                    transform: 'translate(-50%, -120%)' // Center horizontally, place above
                                }}
                            >
                                <div className={`
                                    relative p-3 rounded-xl border backdrop-blur-md shadow-xl
                                    ${phase === 'positive' || phase === 'recovery' ? 'bg-emerald-950/80 border-emerald-500/30' : 'bg-rose-950/80 border-rose-500/30'}
                                `}>
                                    {/* Arrow */}
                                    <div className={`
                                        absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rotate-45 border-b border-r
                                        ${phase === 'positive' || phase === 'recovery' ? 'bg-emerald-950 border-emerald-500/30' : 'bg-rose-950 border-rose-500/30'}
                                    `} />

                                    {/* Icon & Label */}
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {phase === 'drop' ? (
                                            <TrendingDown size={14} className="text-rose-400" />
                                        ) : (
                                            <TrendingUp size={14} className="text-emerald-400" />
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${phase === 'drop' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {phase === 'drop' ? 'Risk Detected' : 'Positive Signal'}
                                        </span>
                                    </div>

                                    {/* Transcript Text */}
                                    <p className="text-xs font-medium text-slate-200 leading-snug">
                                        "{TOOLTIPS[phase]?.text}"
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Markers for Key Events */}
                    {['positive', 'drop', 'recovery', 'summary'].includes(phase) && (
                        <>
                            {/* Positive Point */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-lg z-0"
                                style={{ left: '40%', top: '20%', marginLeft: '-6px', marginTop: '-6px' }}
                            />
                        </>
                    )}
                    {['drop', 'recovery', 'summary'].includes(phase) && (
                        <>
                            {/* Drop Point */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute w-3 h-3 bg-rose-500 border-2 border-white rounded-full shadow-lg z-0"
                                style={{ left: '60%', top: '85%', marginLeft: '-6px', marginTop: '-6px' }}
                            />
                        </>
                    )}
                    {['summary', 'summary'].includes(phase) && ( // Keeping consistent
                        <>
                            {/* Recovery Point */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute w-3 h-3 bg-amber-500 border-2 border-white rounded-full shadow-lg z-0"
                                style={{ left: '100%', top: '30%', marginLeft: '-6px', marginTop: '-6px' }}
                            />
                        </>
                    )}

                </div>

                {/* SUMMARY OVERLAY */}
                <AnimatePresence>
                    {phase === 'summary' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-6 left-6 right-6 z-20"
                        >
                            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                                        <Activity size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            Call Sentiment Analysis
                                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                                                Recovered
                                            </span>
                                        </h4>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Started Positive
                                                <span className="text-slate-600">→</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Dipped Negative (2:34)
                                                <span className="text-slate-600">→</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Recovered
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                                            <div className="text-xs text-slate-300">
                                                <span className="text-slate-500 mr-1">Risk Level:</span>
                                                <span className="text-amber-400 font-medium">Medium</span>
                                            </div>
                                            <div className="text-xs text-indigo-300 flex items-center gap-1.5">
                                                <AlertCircle size={12} />
                                                Recommended: Follow-up in 48h
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ClientOnly>
    );
};
