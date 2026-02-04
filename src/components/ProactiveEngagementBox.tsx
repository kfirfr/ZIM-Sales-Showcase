"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { MousePointer2, MessageCircle, BarChart3, Users, Zap, UserPlus, ArrowRight, Activity, AlertCircle, CheckCircle2, Globe, Shield } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

type Phase = 'browsing' | 'scoring' | 'engagement' | 'handoff';

export const ProactiveEngagementBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('browsing');

    // Simulation Data
    const [scrollProgress, setScrollProgress] = useState(0);
    const [intentScore, setIntentScore] = useState(20);
    const [showHandoffCard, setShowHandoffCard] = useState(false);

    // Animation Controls
    const scrollControls = useAnimation();
    const cursorControls = useAnimation();
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);

    // --- Helpers ---
    const wait = async (ms: number) => {
        const start = Date.now();
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
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const reset = () => {
        setPhase('browsing');
        setScrollProgress(0);
        setIntentScore(20);
        setShowHandoffCard(false);
        scrollControls.set({ y: 0 });
        cursorControls.set({ opacity: 0, x: 200, y: 300 });
    };

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            reset();
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // --- PHASE 1: BROWSING ---
                        await waitForPlay();
                        setPhase('browsing');
                        reset();

                        // Scroll Animation
                        const scrollSteps = 40;
                        for (let i = 0; i <= scrollSteps; i++) {
                            await waitForPlay();
                            const progress = i / scrollSteps;
                            setScrollProgress(progress * 100);
                            scrollControls.set({ y: -(progress * 300) }); // Scroll down 300px

                            // Passive score increase
                            setIntentScore(20 + (progress * 15));

                            await wait(50);
                        }

                        // --- PHASE 2: SCORING ---
                        await waitForPlay();
                        setPhase('scoring');

                        // Score Spike Animation
                        const scoreTarget = 88;
                        const scoreStart = 35;
                        const jumpSteps = 20;

                        for (let i = 0; i <= jumpSteps; i++) {
                            await waitForPlay();
                            const t = i / jumpSteps;
                            // Ease out cubic
                            const eased = 1 - Math.pow(1 - t, 3);
                            setIntentScore(scoreStart + (scoreTarget - scoreStart) * eased);
                            await wait(40);
                        }

                        await wait(800); // Hold on high score alert

                        // --- PHASE 3: ENGAGEMENT ---
                        await waitForPlay();
                        setPhase('engagement');

                        // Wait for widget entrance
                        await wait(600);

                        // Cursor Logic
                        await cursorControls.start({ opacity: 1, x: 280, y: 400, transition: { duration: 0 } });
                        await wait(200);

                        // Move to "Yes" button (approximated coords)
                        const moveSteps = 30;
                        const startX = 280, startY = 400;
                        const endX = 320, endY = 480;

                        for (let i = 0; i <= moveSteps; i++) {
                            await waitForPlay();
                            const t = i / moveSteps;
                            const smooth = t * t * (3 - 2 * t);
                            cursorControls.set({
                                x: startX + (endX - startX) * smooth,
                                y: startY + (endY - startY) * smooth
                            });
                            await wait(20);
                        }

                        await wait(200);
                        // "Click" visual pause
                        await wait(300);

                        // --- PHASE 4: HANDOFF ---
                        await waitForPlay();
                        setPhase('handoff');

                        await wait(500); // Wait for zoom out
                        setShowHandoffCard(true);

                        await wait(4000); // Show result

                    }
                } catch (e) {
                    if (e instanceof Error && e.message !== "STOPPED") console.error(e);
                } finally {
                    isLoopingRef.current = false;
                }
            };
            loop();
        }
    }, [state]); // Dependencies reduced to state to prevent restart on internal changes

    return (
        <ClientOnly>
            <div className="relative w-full h-[500px] bg-slate-950 flex flex-col overflow-hidden border border-slate-800 font-sans group select-none rounded-xl">

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                {/* --- SCENE CONTAINER --- */}
                <div className="relative w-full h-full overflow-hidden">

                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[#0B1221]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                    {/* --- MAIN BROWSER CONTENT (Scales down in Handoff) --- */}
                    <motion.div
                        className="w-full h-full origin-center"
                        animate={{
                            scale: phase === 'handoff' ? 0.8 : 1,
                            opacity: phase === 'handoff' ? 0.3 : 1,
                            filter: phase === 'handoff' ? "blur(4px)" : "blur(0px)"
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        {/* Fake Browser Header */}
                        <div className="h-10 bg-slate-900 border-b border-white/10 flex items-center px-4 gap-3 z-10 relative">
                            <div className="flex gap-1.5 opacity-50">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                            </div>
                            <div className="flex-1 max-w-md h-6 bg-slate-800 rounded flex items-center px-3 gap-2">
                                <Globe size={12} className="text-slate-500" />
                                <span className="text-[10px] text-slate-400 font-mono">zim.com/global-routes/enterprise</span>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="relative w-full h-full overflow-hidden bg-slate-900/50">
                            <motion.div animate={scrollControls} className="p-8 space-y-8">
                                {/* Hero Section */}
                                <div className="w-full h-48 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-white/5 p-6 flex flex-col justify-end">
                                    <div className="w-32 h-8 bg-blue-500/20 rounded mb-4" />
                                    <div className="w-3/4 h-6 bg-slate-700/50 rounded mb-2" />
                                    <div className="w-1/2 h-4 bg-slate-700/30 rounded" />
                                </div>

                                {/* Pricing Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-40 bg-slate-800/20 rounded border border-white/5 p-4 transform transition-all hover:scale-[1.02]">
                                            <div className="w-8 h-8 rounded bg-cyan-500/10 mb-3" />
                                            <div className="w-20 h-4 bg-slate-700/50 rounded mb-2" />
                                            <div className="w-full h-2 bg-slate-700/20 rounded mb-1" />
                                            <div className="w-2/3 h-2 bg-slate-700/20 rounded" />
                                        </div>
                                    ))}
                                </div>

                                {/* Technical Specs */}
                                <div className="space-y-3">
                                    <div className="w-40 h-5 bg-slate-700/50 rounded" />
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/10 rounded border border-white/5">
                                            <div className="w-4 h-4 rounded-full bg-green-500/20" />
                                            <div className="flex-1 h-3 bg-slate-700/30 rounded" />
                                        </div>
                                    ))}
                                </div>

                                {/* Enterprise Footer */}
                                <div className="h-32 bg-slate-800/30 rounded border border-white/5 p-6 flex items-center justify-center">
                                    <div className="text-center space-y-2">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Shield size={20} className="text-blue-400" />
                                        </div>
                                        <div className="w-32 h-4 bg-slate-700/50 rounded mx-auto" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* --- HUD OVERLAY --- */}
                    {(phase === 'browsing' || phase === 'scoring' || phase === 'engagement') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-14 right-4 w-64 backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-lg p-4 shadow-2xl z-20"
                        >
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <Activity size={14} className="text-cyan-400" />
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Live Signal</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                                    <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse delay-75" />
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-slate-800/50 p-2 rounded">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Scroll</div>
                                    <div className="text-lg font-mono text-cyan-400">{Math.floor(scrollProgress)}%</div>
                                </div>
                                <div className="bg-slate-800/50 p-2 rounded">
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">Intent</div>
                                    <div className={`text-lg font-mono transition-colors duration-300 ${intentScore > 60 ? 'text-orange-400' : 'text-slate-300'}`}>
                                        {Math.floor(intentScore)}
                                    </div>
                                </div>
                            </div>

                            {/* Intent Gauge */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                                    <span>SCORING MODEL</span>
                                    <span>v2.4</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-orange-500"
                                        style={{ width: `${intentScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Alert Logic */}
                            <AnimatePresence>
                                {intentScore > 80 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-2 flex items-start gap-2">
                                            <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                            <div>
                                                <div className="text-[10px] font-bold text-orange-400 uppercase">High Value Intent</div>
                                                <div className="text-[9px] text-orange-400/70 leading-tight">Prospect qualifies for instant enterprise engagement.</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* --- CHAT WIDGET --- */}
                    <AnimatePresence>
                        {phase === 'engagement' && (
                            <motion.div
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 200, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute bottom-6 right-6 w-[320px] bg-white rounded-lg shadow-2xl overflow-hidden z-30"
                            >
                                <div className="bg-[#1D2536] p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                                        <MessageCircle size={16} className="text-white fill-white/20" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Sales Assistant</div>
                                        <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Active Now
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 space-y-3">
                                    <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-slate-800">
                                        Hello! I noticed you're looking at our global routes. Would you like a custom quote for your enterprise?
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button className="flex-1 bg-[#FF4D00] hover:bg-[#E04400] text-white text-xs font-bold py-2.5 rounded shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                            Yes, get quote
                                        </button>
                                        <button className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 rounded text-xs font-bold transition-colors">
                                            No thanks
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- CURSOR --- */}
                    <motion.div
                        animate={cursorControls}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        className="absolute z-50 pointer-events-none drop-shadow-xl"
                    >
                        <MousePointer2 size={24} className="text-slate-900 fill-white" />
                    </motion.div>

                    {/* --- HANDOFF CARD --- */}
                    <AnimatePresence>
                        {showHandoffCard && (
                            <motion.div
                                initial={{ y: -50, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center z-40 bg-slate-950/20 backdrop-blur-[2px]"
                            >
                                <div className="w-[300px] bg-[#0F172A] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Incoming Lead</div>
                                                <h3 className="text-lg font-bold text-white">Adidas Global</h3>
                                            </div>
                                            <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                                <Zap size={16} className="text-cyan-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-5">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Intent Score</span>
                                                <span className="font-mono font-bold text-orange-400">94/100</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Deal Value</span>
                                                <span className="font-mono font-bold text-white">$1.2M</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Source</span>
                                                <span className="text-slate-300">Enterprise Pricing</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                                            <CheckCircle2 size={14} className="text-green-400" />
                                            <span className="text-[10px] font-bold text-green-400 uppercase">Routed to Enterprise Team</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </ClientOnly>
    );
};
