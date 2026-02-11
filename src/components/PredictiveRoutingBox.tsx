"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { Search, Play, Pause, BarChart2, MessageSquare, Tag, User, Clock, MoreVertical, MousePointer2 } from 'lucide-react';

export const PredictiveRoutingBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [simStep, setSimStep] = useState<'IDLE' | 'LIBRARY' | 'SEARCH' | 'PLAYBACK' | 'JUMP'>('IDLE');
    const [searchText, setSearchText] = useState("");
    const [waveformProgress, setWaveformProgress] = useState(0);

    // --- Data ---
    const CALLS = [
        { id: 1, rep: "Sarah J.", client: "Maersk Logistics", duration: "12:05", tags: [{ text: "Price Discussion", color: "bg-orange-500" }, { text: "Urgent", color: "bg-red-500" }] },
        { id: 2, rep: "Mike T.", client: "DHL Global", duration: "08:30", tags: [{ text: "Competitor Mention", color: "bg-purple-500" }] },
        { id: 3, rep: "David L.", client: "Kuehne+Nagel", duration: "15:45", tags: [{ text: "Contract Renewal", color: "bg-emerald-500" }] },
        { id: 4, rep: "Emma W.", client: "MSC Shipping", duration: "05:12", tags: [{ text: "General Inquiry", color: "bg-blue-500" }] },
    ];

    const TRANSCRIPT = [
        { time: "2:15", speaker: "Client", text: "Maersk quoted us lower for this route.", color: "text-red-400", marker: "🔴" },
        { time: "3:42", speaker: "Client", text: "Can you match that rate?", color: "text-amber-400", marker: "🟡" },
        { time: "5:10", speaker: "Rep", text: "Your transit time is the differentiator here.", color: "text-emerald-400", marker: "🟢" },
    ];

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
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const typeText = async (text: string, setter: (s: string) => void) => {
        for (let i = 0; i <= text.length; i++) {
            await waitForPlay();
            setter(text.slice(0, i));
            await wait(50 + Math.random() * 50);
        }
    };

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            setSimStep('IDLE');
            setSearchText("");
            setWaveformProgress(0);
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // Reset
                        setSimStep('LIBRARY');
                        setSearchText("");
                        setWaveformProgress(0);
                        await wait(2000);

                        // Search
                        setSimStep('SEARCH');
                        await wait(500);
                        await typeText("price objection", setSearchText);
                        await wait(1000);

                        // Select & Playback
                        setSimStep('PLAYBACK');
                        await wait(1000);

                        // Simulate Audio Playing
                        const startTime = Date.now();
                        const duration = 4000; // 4s playback simulation
                        while (Date.now() - startTime < duration) {
                            await waitForPlay();
                            setWaveformProgress(((Date.now() - startTime) / duration) * 40); // Play up to 40%
                            await new Promise(r => requestAnimationFrame(r));
                        }

                        // Jump
                        setSimStep('JUMP');
                        await wait(1000); // Hover effect time
                        setWaveformProgress(75); // Jump to 75%
                        await wait(500);

                        // Continue Playback after jump
                        const jumpTime = Date.now();
                        const jumpDuration = 3000;
                        while (Date.now() - jumpTime < jumpDuration) {
                            await waitForPlay();
                            setWaveformProgress(75 + ((Date.now() - jumpTime) / jumpDuration) * 25);
                            await new Promise(r => requestAnimationFrame(r));
                        }

                        await wait(2000);
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


    // --- Render Logic ---
    const filteredCalls = searchText
        ? CALLS.filter(c => c.id === 1) // Force match for simulation
        : CALLS;

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[520px] bg-slate-950 flex flex-col overflow-hidden font-sans select-none border border-slate-800 rounded-xl">

                {/* Header Status */}
                <div className="absolute top-0 inset-x-0 h-16 bg-slate-900/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 z-40">
                    <div className="flex items-center gap-3 text-slate-300">
                        <BarChart2 size={18} className="text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline-block">Recording Intelligence</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className={simStep === 'SEARCH' || simStep === 'PLAYBACK' || simStep === 'JUMP'
                            ? "flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1.5 transition-all duration-300"
                            : "flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 transition-all duration-300"
                        }>
                            <Search size={14} className={simStep === 'SEARCH' ? "text-slate-400" : "text-slate-500"} />
                            {(simStep === 'SEARCH' || simStep === 'PLAYBACK' || simStep === 'JUMP') && (
                                <span className="text-xs text-slate-300 min-w-[80px] origin-left">{searchText}<span className="animate-pulse">|</span></span>
                            )}
                        </div>

                        {/* Controls - integrated here */}


                        {/* User Profile */}
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                            <User size={14} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Push down to avoid header overlap */}
                <div className="absolute inset-x-0 bottom-0 top-16 bg-slate-900/50">
                    <AnimatePresence>

                        {/* Library/Search View */}
                        {(simStep === 'LIBRARY' || simStep === 'SEARCH') && (
                            <motion.div
                                key="library"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }} // Just fade out, let layoutId handle the movement
                                className="absolute inset-0 p-4 space-y-3 overflow-y-auto no-scrollbar"
                            >
                                {filteredCalls.map((call, idx) => (
                                    <motion.div
                                        layoutId={`customer-card-${call.id}`}
                                        key={call.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        // No transition delay on exit to make it snappy
                                        className="bg-slate-800/50 border border-white/5 p-4 rounded-lg flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                                                {call.rep.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{call.client}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                    <User size={10} /> {call.rep}
                                                    <Clock size={10} className="ml-2" /> {call.duration}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {call.tags.map(t => (
                                                <span key={t.text} className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${t.color} bg-opacity-20 border border-white/10`}>
                                                    {t.text}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Playback View */}
                        {(simStep === 'PLAYBACK' || simStep === 'JUMP') && (
                            <motion.div
                                key="playback"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col bg-slate-950 z-10"
                            >
                                {/* Selected Customer Card (Persisted) */}
                                <div className="p-4 border-b border-white/5 bg-slate-900/50">
                                    <motion.div
                                        layoutId="customer-card-1" // Must match the ID from the list
                                        className="bg-slate-800/80 border border-white/10 p-4 rounded-lg flex items-center justify-between shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                                                SJ
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">Maersk Logistics</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                    <User size={10} /> Sarah J.
                                                    <Clock size={10} className="ml-2" /> 12:05
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium bg-orange-500 bg-opacity-20 border border-white/10">
                                                Price Discussion
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium bg-red-500 bg-opacity-20 border border-white/10">
                                                Urgent
                                            </span>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Waveform Area */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="h-24 bg-slate-900/50 border-b border-white/5 flex items-center justify-center relative overflow-hidden shrink-0"
                                >
                                    {/* Dummy Waveform Bars */}
                                    <div className="flex items-end gap-1 h-10">
                                        {[...Array(40)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 bg-purple-500/40 rounded-t-sm"
                                                animate={{ height: [5, 15 + Math.random() * 20, 5] }}
                                                transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                                            />
                                        ))}
                                    </div>

                                    {/* Progress Overlay */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-purple-500/10 border-r border-purple-500 transition-all duration-75 ease-linear pointer-events-none"
                                        style={{ width: `${waveformProgress}%` }}
                                    />

                                    {/* Jump Interaction Cursor */}
                                    <AnimatePresence>
                                        {simStep === 'JUMP' && waveformProgress < 70 && (
                                            <motion.div
                                                initial={{ opacity: 0, top: '50%', left: '40%' }}
                                                animate={{ opacity: 1, top: '50%', left: '75%' }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                                className="absolute z-50 pointer-events-none"
                                            >
                                                <MousePointer2 className="text-white drop-shadow-lg fill-black" size={24} />
                                                <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white/30 animate-ping" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Transcript Area */}
                                <div className="flex-1 p-6 space-y-4 overflow-y-auto relative no-scrollbar">
                                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-slate-950 to-transparent z-10" />

                                    <motion.div
                                        className="space-y-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, y: simStep === 'JUMP' ? -80 : 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    >
                                        {TRANSCRIPT.map((line, idx) => (
                                            <div key={idx} className={`flex gap-4 ${simStep === 'JUMP' && idx === 0 ? 'opacity-30' : 'opacity-100'} transition-opacity duration-500`}>
                                                <div className="text-xs font-mono text-slate-600 pt-1 w-12 text-right">{line.time}</div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-slate-500 mb-1">{line.speaker}</div>
                                                    <p className={`text-sm font-medium ${line.color} bg-white/5 p-2 rounded-lg border border-white/5 inline-block`}>
                                                        <span className="mr-2 opacity-80">{line.marker}</span>
                                                        {line.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Filler Text */}
                                        <div className="flex gap-4 opacity-30">
                                            <div className="text-xs font-mono text-slate-600 pt-1 w-12 text-right">5:45</div>
                                            <div className="flex-1">
                                                <div className="text-xs text-slate-500 mb-1">Client</div>
                                                <p className="text-sm text-slate-400">That sounds reasonable. Let's proceed.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <SimulationControls
                    state={state}
                    className="scale-90 mr-6"
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

            </div>
        </ClientOnly>
    );
};
