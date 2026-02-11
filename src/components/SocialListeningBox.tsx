"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { MessageCircle, Bell, Smartphone, Share2, Zap, ArrowRight, Twitter, Linkedin, MessageSquare, Globe, Target, DollarSign } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'scanning' | 'intercept' | 'analysis' | 'dispatch';

interface SocialSignal {
    id: string;
    icon: React.ReactNode;
    color: string;
    x: number;
    y: number;
    delay: number;
}

// --- Constants ---
const SIGNALS: SocialSignal[] = [
    { id: 'wa', icon: <MessageCircle size={20} />, color: '#25D366', x: -80, y: 10, delay: 0 },
    { id: 'tw', icon: <Twitter size={20} />, color: '#1DA1F2', x: 90, y: 30, delay: 0.2 },
    { id: 'li', icon: <Linkedin size={20} />, color: '#0077B5', x: -70, y: 140, delay: 0.4 },
    { id: 'wc', icon: <MessageSquare size={20} />, color: '#07C160', x: 80, y: 120, delay: 0.6 },
    { id: 'gl', icon: <Globe size={20} />, color: '#4285F4', x: 0, y: -20, delay: 0.8 },
];

export const SocialListeningBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [activeSignal, setActiveSignal] = useState<string | null>(null);

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
            setActiveSignal(null);
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
                        setActiveSignal(null);
                        await wait(500);

                        // 1. SCANNING
                        await waitForPlay();
                        setPhase('scanning');
                        await wait(2500);

                        // 2. INTERCEPT (WhatsApp Signal)
                        await waitForPlay();
                        setPhase('intercept');
                        setActiveSignal('wa'); // WhatsApp
                        await wait(1200);

                        // 3. ANALYSIS
                        await waitForPlay();
                        setPhase('analysis');
                        await wait(2500);

                        // 4. DISPATCH
                        await waitForPlay();
                        setPhase('dispatch');
                        await wait(5000);
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

    return (
        <ClientOnly>
            <div className={`relative w-full h-full min-h-[420px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none border border-slate-800 rounded-xl ${state === 'idle' ? 'cursor-default' : ''}`}>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-2 mr-2"
                />

                {/* BACKGROUND RADAR GRID */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#334155_1px,_transparent_1px)] bg-[length:40px_40px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border border-slate-700 rounded-full" />
                        <div className="w-[200px] h-[200px] border border-slate-800 rounded-full" />
                        <div className="w-[100px] h-[100px] border border-slate-900 rounded-full" />
                    </div>
                </div>

                <AnimatePresence mode="wait">

                    {/* IDLE OVERLAY */}
                    {state === 'idle' && (
                        <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-sm" />
                    )}

                    {/* PHASE: SCANNING / CLOUD */}
                    {(phase === 'scanning' || phase === 'intercept') && (
                        <motion.div
                            key="cloud"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* RADAR BEAM */}
                            {phase === 'scanning' && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <div className="w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent rounded-full origin-center" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 20%)' }} />
                                </motion.div>
                            )}

                            {/* SIGNALS CLOUD */}
                            {SIGNALS.map(s => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: phase === 'intercept' && activeSignal !== s.id ? 0.2 : 1,
                                        scale: phase === 'intercept' && activeSignal === s.id ? 1.5 : 1,
                                        x: phase === 'intercept' && activeSignal === s.id ? 0 : s.x,
                                        y: phase === 'intercept' && activeSignal === s.id ? -80 : s.y,
                                    }}
                                    transition={{
                                        type: "spring", stiffness: 300, damping: 20, delay: s.delay,
                                        opacity: { duration: 0.4 }
                                    }}
                                    className="absolute group"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg transition-all duration-300
                                            ${phase === 'scanning' ? 'animate-pulse' : ''}
                                        `}
                                        style={{
                                            backgroundColor: `${s.color}15`,
                                            borderColor: `${s.color}40`,
                                            color: s.color,
                                            boxShadow: phase === 'scanning' ? `0 0 20px ${s.color}20` : 'none'
                                        }}
                                    >
                                        {s.icon}
                                    </div>

                                    {/* WAVE PULSE ON INTERCEPT */}
                                    {phase === 'intercept' && activeSignal === s.id && (
                                        <motion.div
                                            initial={{ scale: 1, opacity: 1 }}
                                            animate={{ scale: 2.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 rounded-xl border-2 border-emerald-500/50"
                                        />
                                    )}
                                </motion.div>
                            ))}

                            {/* SCANNING TEXT */}
                            {phase === 'scanning' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute top-4 w-full flex flex-col items-center gap-2 z-50 pointer-events-none"
                                >
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Zap size={14} className="animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Scanning Global Pulse</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono tracking-wider">Twitter, LinkedIn, WhatsApp, WeChat...</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* PHASE: ANALYSIS */}
                    {phase === 'analysis' && (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center p-6 w-full max-w-[320px] gap-6"
                        >
                            {/* Source Signal Header */}
                            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl w-full">
                                <div className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-lg">
                                    <MessageCircle size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Intercepted Lead</p>
                                    <p className="text-xs text-white font-medium truncate italic">"Need 20 Cargo spaces for Q3..."</p>
                                </div>
                                <div className="flex items-center gap-1 bg-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold text-slate-950">
                                    92% Match
                                </div>
                            </div>

                            {/* AI Extraction Card */}
                            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5, ease: "linear" }}
                                    className="absolute top-0 left-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Share2 size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">AI Extraction</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Intent</p>
                                            <p className="text-xs text-white font-bold">Booking Request</p>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Priority</p>
                                            <div className="flex items-center gap-1">
                                                <Target size={12} className="text-red-400" />
                                                <span className="text-xs text-red-400 font-bold">High (Hot)</span>
                                            </div>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Company</p>
                                            <p className="text-xs text-white font-bold">AcuSport Inc.</p>
                                        </motion.div>
                                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Est. Value</p>
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-bold">$125,000</span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE: DISPATCH */}
                    {phase === 'dispatch' && (
                        <motion.div
                            key="dispatch"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-6 gap-6"
                        >
                            <div className="text-center space-y-2">
                                <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full"
                                >
                                    <ArrowRight size={14} className="text-indigo-400" />
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Dispatching to Agent</span>
                                </motion.div>
                            </div>

                            {/* MOBILE PHONE ALERT */}
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="relative w-[240px] h-[140px] bg-slate-900 border-x-4 border-t-4 border-slate-800 rounded-t-3xl p-4 pb-0 shadow-2xl"
                            >
                                {/* SIMULATED PHONE NOTIFICATION */}
                                <motion.div
                                    animate={{ x: [-2, 2, -2, 2, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 2 }}
                                    className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-xl space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded bg-[#25D366] flex items-center justify-center text-white">
                                                <MessageCircle size={10} />
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase underline decoration-emerald-500/50">WhatsApp Business</span>
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-mono">Just Now</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white">New Sales Opportunity!</p>
                                        <p className="text-[9px] text-slate-400 line-clamp-1 italic">High intent lead routed to your mobile.</p>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 4, ease: "linear" }}
                                            className="h-full bg-indigo-500"
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"
                            >
                                <Zap size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Instant Handover Complete</span>
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>

            </div>
        </ClientOnly>
    );
};
