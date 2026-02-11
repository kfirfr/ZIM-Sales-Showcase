"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { FileText, CheckSquare, Smile, Calendar, Phone, PhoneOff } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'call_end' | 'processing' | 'summary' | 'delivered';

// --- Data ---
const TOPICS = ["Rate negotiation", "Q3 volume commitment", "Port congestion concerns"];

const ACTION_ITEMS = [
    "Send revised quote by Wednesday",
    "Confirm Savannah slot availability",
];

const NEXT_STEPS = "Follow-up call scheduled Feb 18";

// --- Component ---
export const ProactiveEngagementBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [processingText, setProcessingText] = useState("");
    const [scanlineProgress, setScanlineProgress] = useState(0);
    const [visibleSections, setVisibleSections] = useState(0);
    const [showDelivered, setShowDelivered] = useState(false);

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

    // --- Reset ---
    const resetAll = () => {
        setPhase('idle');
        setProcessingText("");
        setScanlineProgress(0);
        setVisibleSections(0);
        setShowDelivered(false);
    };

    // --- Scanline animation (runs independently during processing) ---
    useEffect(() => {
        if (phase !== 'processing' || state === 'idle') {
            setScanlineProgress(0);
            return;
        }
        let raf: number;
        let start: number | null = null;
        const duration = 3500; // ms for full sweep

        const tick = (timestamp: number) => {
            if (stateRef.current === 'idle') return;
            if (start === null) start = timestamp;

            if (stateRef.current === 'playing') {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                setScanlineProgress(progress);
                if (progress >= 1) return;
            }
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [phase, state]);

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            resetAll();
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // Reset
                        resetAll();
                        await wait(300);

                        // === PHASE 1: CALL_END ===
                        await waitForPlay();
                        setPhase('call_end');
                        await wait(3000);

                        // === PHASE 2: PROCESSING ===
                        await waitForPlay();
                        setPhase('processing');
                        setProcessingText("Analyzing transcript...");
                        await wait(2000);
                        await waitForPlay();
                        setProcessingText("Extracting key topics...");
                        await wait(2000);

                        // === PHASE 3: SUMMARY ===
                        await waitForPlay();
                        setPhase('summary');
                        setVisibleSections(0);
                        setShowDelivered(false);
                        // Stagger sections in
                        for (let i = 1; i <= 4; i++) {
                            await waitForPlay();
                            setVisibleSections(i);
                            await wait(700);
                        }
                        await wait(1500);

                        // === PHASE 4: DELIVERED ===
                        await waitForPlay();
                        setPhase('delivered');
                        setShowDelivered(true);
                        await wait(4000);
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

    const isActive = state !== 'idle';

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-4 mr-4"
                />

                <AnimatePresence mode="wait">

                    {/* === IDLE === */}
                    {!isActive && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                <FileText size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Post-Call AI Ready</p>
                        </motion.div>
                    )}

                    {/* === CALL_END BANNER === */}
                    {isActive && phase === 'call_end' && (
                        <motion.div
                            key="call_end"
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="w-full max-w-md px-4"
                        >
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
                                {/* Call ended header */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                                        <PhoneOff size={14} className="text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm">Call Ended</p>
                                        <p className="text-slate-500 text-[10px] font-mono">12:34 duration</p>
                                    </div>
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25"
                                    >
                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Processing</span>
                                    </motion.div>
                                </div>

                                {/* Participants */}
                                <div className="flex items-center gap-3 px-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-blue-400">DK</span>
                                        </div>
                                        <span className="text-xs text-slate-300 font-medium">David K.</span>
                                    </div>
                                    <span className="text-slate-600 text-xs">↔</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                                            <span className="text-[8px] font-bold text-purple-400 tracking-tighter">ZIM</span>
                                        </div>
                                        <span className="text-xs text-slate-300 font-medium">ZIM</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* === PROCESSING (WAVEFORM + SCANLINE) === */}
                    {isActive && phase === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6 w-full max-w-sm px-4"
                        >
                            {/* Waveform container */}
                            <div className="relative w-full h-16 flex items-center justify-center gap-[3px] overflow-hidden rounded-lg bg-slate-900/80 border border-slate-800 px-3">
                                {/* Waveform bars */}
                                {Array.from({ length: 32 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: state === 'playing'
                                                ? [4 + Math.random() * 6, 10 + Math.random() * 30, 4 + Math.random() * 6]
                                                : 8,
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.4 + Math.random() * 0.6,
                                            ease: "easeInOut",
                                            delay: i * 0.03,
                                        }}
                                        className="w-[3px] rounded-full bg-cyan-500/40 shrink-0"
                                    />
                                ))}

                                {/* Scanline overlay */}
                                <motion.div
                                    className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.4)]"
                                    style={{ left: `${scanlineProgress * 100}%` }}
                                />

                                {/* Processed region tint */}
                                <div
                                    className="absolute top-0 bottom-0 left-0 bg-cyan-400/5 pointer-events-none transition-none"
                                    style={{ width: `${scanlineProgress * 100}%` }}
                                />
                            </div>

                            {/* Processing text */}
                            <motion.p
                                key={processingText}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-cyan-400 font-mono text-xs uppercase tracking-widest"
                            >
                                {processingText}
                            </motion.p>
                        </motion.div>
                    )}

                    {/* === SUMMARY CARD (+ DELIVERED footer) === */}
                    {isActive && (phase === 'summary' || phase === 'delivered') && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 60, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full max-w-sm mx-auto px-4"
                        >
                            <div
                                className="rounded-xl overflow-hidden border"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.9)',
                                    borderColor: showDelivered ? 'rgba(52, 211, 153, 0.4)' : 'rgba(100, 116, 139, 0.3)',
                                    boxShadow: showDelivered
                                        ? '0 0 40px rgba(52, 211, 153, 0.12)'
                                        : '0 0 30px rgba(0,0,0,0.3)',
                                }}
                            >
                                {/* Card Header */}
                                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-cyan-400" />
                                        <span className="text-white font-bold text-sm">AI Summary</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-slate-500 font-mono">David K. ↔ ZIM</span>
                                    </div>
                                </div>

                                {/* Card Body — staggered sections */}
                                <div className="px-4 py-3 space-y-3">

                                    {/* Section 1: Topics Discussed */}
                                    <AnimatePresence>
                                        {visibleSections >= 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35 }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <FileText size={11} className="text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topics Discussed</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {TOPICS.map((topic, i) => (
                                                        <motion.span
                                                            key={topic}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-medium"
                                                        >
                                                            {topic}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Section 2: Action Items */}
                                    <AnimatePresence>
                                        {visibleSections >= 2 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35 }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5 pt-2 border-t border-slate-800/60">
                                                    <CheckSquare size={11} className="text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Items</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {ACTION_ITEMS.map((item, i) => (
                                                        <motion.div
                                                            key={item}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.12 }}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <div className="w-3.5 h-3.5 rounded border border-amber-500/40 bg-amber-500/10 mt-0.5 shrink-0 flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 rounded-sm bg-transparent" />
                                                            </div>
                                                            <span className="text-[11px] text-slate-300 leading-relaxed">{item}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Section 3: Customer Mood */}
                                    <AnimatePresence>
                                        {visibleSections >= 3 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35 }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5 pt-2 border-t border-slate-800/60">
                                                    <Smile size={11} className="text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Mood</span>
                                                </div>
                                                <motion.div
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                                                >
                                                    <Smile size={12} className="text-emerald-400" />
                                                    <span className="text-[11px] font-bold text-emerald-300">Positive</span>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Section 4: Next Steps */}
                                    <AnimatePresence>
                                        {visibleSections >= 4 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35 }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5 pt-2 border-t border-slate-800/60">
                                                    <Calendar size={11} className="text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Steps</span>
                                                </div>
                                                <p className="text-[11px] text-slate-300 leading-relaxed">{NEXT_STEPS}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* DELIVERED Footer */}
                                <AnimatePresence>
                                    {showDelivered && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="border-t border-emerald-500/20 px-4 py-2.5 flex items-center gap-2 bg-emerald-500/5 overflow-hidden"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
                                                className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"
                                            >
                                                <CheckSquare size={10} className="text-emerald-400" />
                                            </motion.div>
                                            <span className="text-[10px] font-semibold text-emerald-300/90">
                                                Summary sent to David K. & logged to Dynamics 365
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </ClientOnly>
    );
};
