"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Activity, Zap, Award, Search, FileText, Database, Lock } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Configuration ---
const AUDIT_ITEMS = [
    { id: 'c1', label: 'Identity Authentication', code: 'ZIM_ID_SEC', duration: 1200 },
    { id: 'c2', label: 'Compliance Disclosure', code: 'REG_CONF', duration: 1500 },
    { id: 'c3', label: 'Sentiment Analysis', code: 'NLP_SENT', duration: 1300 },
    { id: 'c4', label: 'Solution Relevance', code: 'KB_MATCH', duration: 1800 },
    { id: 'c5', label: 'Security Protocols', code: 'ENC_DATA', duration: 1400 },
];

export const EvalBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<"idle" | "scanning" | "auditing" | "complete">("idle");
    const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
    const [auditResults, setAuditResults] = useState<{ [key: string]: boolean }>({});
    const [auditScore, setAuditScore] = useState(0);

    // Refs for safe async loop access
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);

    // --- Robust Wait Logic ---
    const wait = async (ms: number) => {
        let passed = 0;
        while (passed < ms) {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            if (stateRef.current === 'playing') passed += 100;
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const waitForPlay = async () => {
        while (stateRef.current !== 'playing') {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const reset = () => {
        setPhase("idle");
        setCurrentAuditId(null);
        setAuditResults({});
        setAuditScore(0);
    };

    // --- Main Simulation Loop ---
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

                        // 1. Initial State
                        reset();
                        setPhase("idle");
                        await wait(500);

                        // 2. Scanning Mode
                        await waitForPlay();
                        setPhase("scanning");
                        await wait(2500);

                        // 3. Auditing Mode
                        await waitForPlay();
                        setPhase("auditing");

                        for (const item of AUDIT_ITEMS) {
                            await waitForPlay();
                            setCurrentAuditId(item.id);
                            await wait(item.duration);

                            await waitForPlay();
                            setAuditResults(prev => ({ ...prev, [item.id]: true }));
                            setAuditScore(prev => prev + 20);
                            await wait(400); // Small pause between items
                        }

                        // 4. Complete
                        await waitForPlay();
                        setCurrentAuditId(null);
                        setPhase("complete");
                        await wait(4000); // Show results
                    }
                } catch (e) {
                    if (e instanceof Error && e.message === "STOPPED") {
                        // Clean exit
                    } else {
                        console.error(e);
                    }
                } finally {
                    isLoopingRef.current = false;
                }
            };
            loop();
        }
    }, [state]);

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[450px] bg-slate-950 flex flex-col overflow-hidden border border-violet-500/20 font-sans group">

                {/* Background Infrastructure */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-90" />

                {/* Code Telemetry Streams (Animated Background) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden font-mono text-[8px] text-violet-400 p-4">
                    <motion.div
                        animate={{ y: [-1000, 0] }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="whitespace-pre"
                    >
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} className="mb-1">
                                {`AUDIT_STREAM_0x${i.toString(16).padStart(4, '0')} >> PROTOCOL: ${i % 2 === 0 ? 'ENCRYPTION_OK' : 'HANDSHAKE_VERIFIED'} >> ${Math.random().toString(36).substring(7)}`}
                            </div>
                        ))}
                    </motion.div>
                </div>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                {/* --- HEADER --- */}
                <div className="relative z-10 w-full h-14 bg-slate-900/90 backdrop-blur-md border-b border-violet-500/30 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <img src="/ZIM80Logo.png" alt="ZIM" className="h-7 w-auto object-contain" />
                        <div className="h-4 w-px bg-white/20" />
                        <span className="text-xs font-bold text-violet-400 tracking-[0.2em] uppercase">Audit Intelligence</span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] text-violet-300">
                            <Activity size={10} className="animate-pulse" />
                            LIVE_ANALYSIS
                        </div>
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Lock size={14} className="text-violet-400" />
                        </div>
                    </div>
                </div>

                {/* --- MAIN DASHBOARD AREA --- */}
                <div className="relative z-10 flex-1 p-6 flex gap-6 h-full">

                    {/* Transcript / Data Feed Section */}
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <FileText size={16} className="text-violet-400" />
                                Interactive Transcript
                            </h3>
                            <div className="text-[10px] font-mono text-slate-500 tracking-wider">REF: AQ-229-X</div>
                        </div>

                        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-zim-teal/20 border border-zim-teal/30 flex items-center justify-center text-[10px] font-bold text-zim-teal">AI</div>
                                    <div className="flex-1 text-xs text-slate-300 leading-relaxed bg-white/5 p-2.5 rounded-xl rounded-tl-none">
                                        I can help you with your booking from Shanghai to Los Angeles. I'll verify your account details for security.
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <div className="max-w-[80%] text-xs text-slate-300 leading-relaxed bg-violet-500/10 border border-violet-500/20 p-2.5 rounded-xl rounded-tr-none">
                                        Yes. My ID is Z-8821. I need to ensure compliance with our logistics disclosure policy.
                                    </div>
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">US</div>
                                </div>
                            </div>

                            {/* Deep Scan Ray */}
                            <AnimatePresence>
                                {phase === 'scanning' && (
                                    <motion.div
                                        initial={{ top: -100 }}
                                        animate={{ top: "100%" }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-violet-500/20 to-transparent pointer-events-none z-20"
                                    >
                                        <div className="h-px w-full bg-violet-400/50 shadow-[0_0_20px_rgba(139,92,246,1)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Audit Checklist HUD Section */}
                    <div className="w-64 flex flex-col gap-4">
                        <div className="relative flex-1 bg-slate-900/60 border border-violet-500/20 rounded-2xl p-4 backdrop-blur-xl flex flex-col">
                            {/* Decorative HUD Elements */}
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t border-r border-violet-500/40 rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b border-l border-violet-500/40 rounded-bl-xl" />

                            <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-bold text-violet-300 tracking-[0.2em] uppercase">Compliance Audit</div>
                                <ShieldCheck size={14} className="text-violet-400" />
                            </div>

                            {/* Checklist Items */}
                            <div className="flex-1 space-y-3">
                                {AUDIT_ITEMS.map((item) => {
                                    const isAuditing = currentAuditId === item.id;
                                    const isVerified = auditResults[item.id];

                                    return (
                                        <div key={item.id} className="relative">
                                            <div className={`p-3 rounded-xl border transition-all duration-300 ${isAuditing ? 'bg-violet-500/10 border-violet-500/50 scale-105' :
                                                isVerified ? 'bg-emerald-500/5 border-emerald-500/20' :
                                                    'bg-white/5 border-white/5'
                                                }`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isVerified ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        {item.label}
                                                    </span>
                                                    {isVerified && <CheckCircle2 size={12} className="text-emerald-400" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                                        {(isAuditing || isVerified) && (
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: isVerified ? "100%" : "70%" }}
                                                                transition={{ duration: item.duration / 1000 }}
                                                                className={`h-full ${isVerified ? 'bg-emerald-400' : 'bg-violet-400 animate-pulse'}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] font-mono text-slate-500">{item.code}</span>
                                                </div>
                                            </div>

                                            {/* Holographic Stamp Animation */}
                                            <AnimatePresence>
                                                {isVerified && (
                                                    <motion.div
                                                        initial={{ scale: 3, opacity: 0, rotate: -30 }}
                                                        animate={{ scale: 1, opacity: 1, rotate: 10 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute -right-2 top-0 pointer-events-none"
                                                    >
                                                        <div className="px-2 py-0.5 border-2 border-emerald-400 font-black text-[9px] text-emerald-400 uppercase tracking-tighter rounded bg-emerald-950/80 -rotate-12">
                                                            PASSED
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Score Meter Footer */}
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quality Score</span>
                                    <span className="text-2xl font-black text-white font-mono">{auditScore}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: `${auditScore}%` }}
                                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RESULTS OVERLAY --- */}
                <AnimatePresence>
                    {phase === 'complete' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-8"
                        >
                            <div className="max-w-md w-full bg-slate-900 border border-violet-500/30 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_80px_rgba(139,92,246,0.2)]">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20"
                                >
                                    <Award size={48} className="text-white" />
                                </motion.div>

                                <h4 className="text-2xl font-bold text-white mb-2">Audit Complete</h4>
                                <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed px-4">
                                    The automated evaluation engine has verified 100% compliance across all quality parameters.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Score</div>
                                        <div className="text-2xl font-black text-white">100/100</div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</div>
                                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                            <ShieldCheck size={14} /> CERTIFIED
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-[10px] font-mono text-violet-400 tracking-[0.3em] uppercase"
                                >
                                    Restarting analysis sequence...
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ClientOnly>
    );
};
