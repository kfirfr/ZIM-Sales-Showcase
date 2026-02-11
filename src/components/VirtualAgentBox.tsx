"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { Phone, BarChart3, FileText, Signal, Clock, PhoneOff, CheckCircle } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'incoming' | 'connected' | 'analytics' | 'handover';

interface TranscriptLine {
    time: string;
    speaker: 'Rep' | 'Client';
    text: string;
}

interface AnalyticItem {
    label: string;
    value: string;
    color: string;
}

// --- Data ---
const TRANSCRIPT_LINES: TranscriptLine[] = [
    { time: "00:03", speaker: "Rep", text: "Hi Sarah, David from ZIM." },
    { time: "00:08", speaker: "Client", text: "David! We need to rebook the Asia containers." },
    { time: "00:14", speaker: "Rep", text: "Sure, let me check the Q2 schedule." },
    { time: "00:19", speaker: "Client", text: "The delay cost us — but we want to keep the partnership." },
    { time: "00:25", speaker: "Rep", text: "Absolutely. I'll send a revised proposal today." },
];

const ANALYTICS: AnalyticItem[] = [
    { label: "Sentiment", value: "Positive", color: "#34d399" },
    { label: "Topic", value: "Shipping Delay", color: "#60a5fa" },
    { label: "Intent", value: "Re-booking", color: "#a78bfa" },
];

// --- Component ---
export const VirtualAgentBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [callTimer, setCallTimer] = useState(0);
    const [visibleAnalytics, setVisibleAnalytics] = useState<number>(0);
    const [visibleTranscript, setVisibleTranscript] = useState<number>(0);
    const [crmLogged, setCrmLogged] = useState(false);

    // --- Refs ---
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // --- Call Timer ---
    useEffect(() => {
        if (phase === 'connected' || phase === 'analytics') {
            timerRef.current = setInterval(() => {
                if (stateRef.current === 'playing') {
                    setCallTimer(prev => prev + 1);
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase]);

    // --- Reset ---
    const resetAll = () => {
        setPhase('idle');
        setCallTimer(0);
        setVisibleAnalytics(0);
        setVisibleTranscript(0);
        setCrmLogged(false);
    };

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

                        // Reset for loop
                        resetAll();
                        await wait(300);

                        // === PHASE 1: INCOMING ===
                        await waitForPlay();
                        setPhase('incoming');
                        await wait(3000);

                        // === PHASE 2: CONNECTED ===
                        await waitForPlay();
                        setPhase('connected');
                        setCallTimer(0);
                        await wait(3000);

                        // === PHASE 3: ANALYTICS ===
                        await waitForPlay();
                        setPhase('analytics');
                        // Reveal analytics one by one
                        for (let i = 0; i < ANALYTICS.length; i++) {
                            await waitForPlay();
                            setVisibleAnalytics(i + 1);
                            await wait(800);
                        }
                        // Reveal transcript lines one by one
                        for (let i = 0; i < TRANSCRIPT_LINES.length; i++) {
                            await waitForPlay();
                            setVisibleTranscript(i + 1);
                            await wait(1200);
                        }
                        await wait(1500);

                        // === PHASE 4: HANDOVER ===
                        await waitForPlay();
                        setPhase('handover');
                        await wait(1000);
                        setCrmLogged(true);
                        await wait(4000);

                        // Reset for next loop
                        setVisibleAnalytics(0);
                        setVisibleTranscript(0);
                        setCrmLogged(false);
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
    const showSplit = phase === 'connected' || phase === 'analytics' || phase === 'handover';

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
                                <Phone size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Direct Line Ready</p>
                        </motion.div>
                    )}

                    {/* === INCOMING CALL === */}
                    {isActive && phase === 'incoming' && (
                        <motion.div
                            key="incoming"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-5 w-full max-w-[260px]"
                        >
                            {/* Mobile Phone Frame */}
                            <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(96,165,250,0.1)]">
                                {/* Caller Info */}
                                <div className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="w-16 h-16 rounded-full bg-blue-500/15 border-2 border-blue-400/40 flex items-center justify-center"
                                    >
                                        <span className="text-2xl font-bold text-blue-400">AS</span>
                                    </motion.div>
                                    <p className="text-white font-bold text-sm">AcuSport Logistics</p>
                                    <p className="text-slate-400 text-xs">+1 (312) 555-0147</p>
                                </div>

                                {/* Incoming label */}
                                <motion.p
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="text-blue-400 text-xs font-semibold uppercase tracking-widest"
                                >
                                    Incoming Call
                                </motion.p>

                                {/* Ring animation */}
                                <div className="relative w-16 h-16 flex items-center justify-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.08, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                                        className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer"
                                    >
                                        <Phone size={22} className="text-white" />
                                    </motion.div>
                                    {/* Pulse rings */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-emerald-400/15"
                                        animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                    />
                                </div>

                                {/* Genesys badge */}
                                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                    <Signal size={10} className="text-blue-400" />
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Via Genesys Cloud</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* === SPLIT VIEW: CONNECTED / ANALYTICS / HANDOVER === */}
                    {isActive && showSplit && (
                        <motion.div
                            key="split"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-3 w-full max-w-lg px-4"
                        >
                            {/* --- LEFT: MOBILE CALL UI --- */}
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-[38%] shrink-0"
                            >
                                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col items-center gap-3 h-full">
                                    {/* Caller avatar */}
                                    <div className="w-12 h-12 rounded-full bg-blue-500/15 border-2 border-blue-400/30 flex items-center justify-center">
                                        <span className="text-lg font-bold text-blue-400">AS</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-xs">AcuSport</p>
                                        <p className="text-slate-500 text-[10px]">Logistics</p>
                                    </div>

                                    {/* Status */}
                                    {phase !== 'handover' ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Connected</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider">Ended</span>
                                        </div>
                                    )}

                                    {/* Timer */}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Clock size={12} className="text-slate-400" />
                                        <span className="text-white font-mono text-lg font-bold tracking-wider">
                                            {formatTime(callTimer)}
                                        </span>
                                    </div>

                                    {/* End Call Button */}
                                    {phase !== 'handover' ? (
                                        <div className="mt-auto pt-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                                <PhoneOff size={16} className="text-red-400" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-auto pt-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                <Phone size={16} className="text-slate-500" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* --- RIGHT: GENESYS CLOUD OVERLAY --- */}
                            <motion.div
                                initial={{ x: 30, opacity: 0, scale: 0.95 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="flex-1 min-w-0"
                            >
                                <div
                                    className="h-full rounded-2xl p-4 flex flex-col gap-3 overflow-hidden border"
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        backdropFilter: 'blur(20px)',
                                        WebkitBackdropFilter: 'blur(20px)',
                                        borderColor: phase === 'handover' && crmLogged
                                            ? 'rgba(52, 211, 153, 0.4)'
                                            : 'rgba(96, 165, 250, 0.25)',
                                        boxShadow: phase === 'handover' && crmLogged
                                            ? '0 0 40px rgba(52, 211, 153, 0.15), inset 0 1px 0 rgba(52, 211, 153, 0.1)'
                                            : '0 0 40px rgba(96, 165, 250, 0.1), inset 0 1px 0 rgba(96, 165, 250, 0.05)',
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                                                <Signal size={10} className="text-blue-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                Genesys Cloud
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Live</span>
                                        </div>
                                    </div>

                                    {/* Connected State — Waiting for analytics */}
                                    {phase === 'connected' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-1 flex flex-col items-center justify-center gap-3"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-400"
                                            />
                                            <p className="text-blue-400/70 text-[10px] font-mono uppercase tracking-widest">
                                                Analyzing call...
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Analytics State — Live Stats + Transcript */}
                                    {phase === 'analytics' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-1 flex flex-col gap-3 overflow-hidden"
                                        >
                                            {/* Analytics Chips */}
                                            <div className="flex flex-col gap-1.5">
                                                {ANALYTICS.map((item, i) => (
                                                    <AnimatePresence key={item.label}>
                                                        {i < visibleAnalytics && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 15 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                className="flex items-center justify-between py-1.5 px-2.5 rounded-lg"
                                                                style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}
                                                            >
                                                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                                                    {item.label}
                                                                </span>
                                                                <span
                                                                    className="text-[11px] font-bold"
                                                                    style={{ color: item.color }}
                                                                >
                                                                    {item.value}
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                ))}
                                            </div>

                                            {/* Divider */}
                                            {visibleAnalytics >= ANALYTICS.length && (
                                                <motion.div
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FileText size={10} className="text-slate-500 shrink-0" />
                                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest shrink-0">
                                                        Transcript
                                                    </span>
                                                    <div className="flex-1 h-px bg-slate-700/50" />
                                                </motion.div>
                                            )}

                                            {/* Transcript Feed */}
                                            <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                                                {TRANSCRIPT_LINES.map((line, i) => (
                                                    <AnimatePresence key={i}>
                                                        {i < visibleTranscript && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex gap-2 items-start"
                                                            >
                                                                <span className="text-[9px] text-slate-600 font-mono shrink-0 mt-0.5 w-8">
                                                                    {line.time}
                                                                </span>
                                                                <span className={`text-[9px] font-bold shrink-0 mt-0.5 w-8 ${line.speaker === 'Rep' ? 'text-blue-400' : 'text-slate-400'
                                                                    }`}>
                                                                    {line.speaker === 'Rep' ? 'REP' : 'CLI'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-300 leading-relaxed">
                                                                    {line.text}
                                                                </span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Handover State — CRM Logged */}
                                    {phase === 'handover' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex-1 flex flex-col items-center justify-center gap-3"
                                        >
                                            <AnimatePresence>
                                                {crmLogged ? (
                                                    <motion.div
                                                        key="logged"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                        className="flex flex-col items-center gap-3"
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                                            className="w-12 h-12 rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center"
                                                        >
                                                            <CheckCircle size={22} className="text-emerald-400" />
                                                        </motion.div>
                                                        <div className="text-center">
                                                            <p className="text-emerald-400 font-bold text-sm">Logged to CRM</p>
                                                            <p className="text-slate-500 text-[10px] mt-1">
                                                                Call data synced to Dynamics 365
                                                            </p>
                                                        </div>
                                                        {/* Mini summary chips */}
                                                        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                                                            {ANALYTICS.map(a => (
                                                                <span
                                                                    key={a.label}
                                                                    className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
                                                                    style={{
                                                                        background: `${a.color}15`,
                                                                        color: a.color,
                                                                        border: `1px solid ${a.color}25`,
                                                                    }}
                                                                >
                                                                    {a.label}: {a.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="saving"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col items-center gap-3"
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                            className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400"
                                                        />
                                                        <p className="text-emerald-400/70 text-[10px] font-mono uppercase tracking-widest">
                                                            Saving to CRM...
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </ClientOnly>
    );
};
