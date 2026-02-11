"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Activity, Zap, Award, Search, FileText, Database, Lock, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Configuration ---
const SALES_CRITERIA = [
    { id: 'c1', label: 'Professional Greeting', code: 'SALES_GREET', duration: 1000, status: 'pass' },
    { id: 'c2', label: 'Needs Discovery', code: 'Q_DISCOV', duration: 1200, status: 'pass' },
    { id: 'c3', label: 'Value Proposition', code: 'VAL_PROP', duration: 1400, status: 'pass' },
    { id: 'c4', label: 'Objection Handling', code: 'OBJ_HANDLE', duration: 1800, status: 'warn' }, // The "Insight" item
    { id: 'c5', label: 'Closing & Next Steps', code: 'ZIM_CLOSE', duration: 1100, status: 'pass' },
];

const FINAL_SCORE = 72;
const COACHING_TIP = "Rep pivoted instead of addressing the price concern directly. Suggest using the 'Feel, Felt, Found' method.";

export const KnowledgeAIBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<"idle" | "scanning" | "evaluating" | "complete">("idle");
    const [currentCriterionId, setCurrentCriterionId] = useState<string | null>(null);
    const [results, setResults] = useState<{ [key: string]: 'pass' | 'warn' | null }>({});
    const [currentScore, setCurrentScore] = useState(0);

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
        setCurrentCriterionId(null);
        setResults({});
        setCurrentScore(0);
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

                        // 2. Scanning Mode (Transcript Analysis)
                        await waitForPlay();
                        setPhase("scanning");
                        await wait(2000);

                        // 3. Evaluating Mode (Checklist)
                        await waitForPlay();
                        setPhase("evaluating");

                        let accumulatedScore = 0;
                        const scorePerItem = Math.floor(FINAL_SCORE / SALES_CRITERIA.length);
                        // We'll just enact a visual score buildup that ends at 72

                        for (const item of SALES_CRITERIA) {
                            await waitForPlay();
                            setCurrentCriterionId(item.id);
                            await wait(item.duration);

                            await waitForPlay();
                            setResults(prev => ({ ...prev, [item.id]: item.status as 'pass' | 'warn' }));

                            // Visual score increment
                            const points = item.status === 'pass' ? 18 : 0; // Rough approx to get to ~72 with 4 passes
                            accumulatedScore += points;
                            setCurrentScore(Math.min(accumulatedScore, FINAL_SCORE)); // Cap at final

                            await wait(400); // Small pause between items
                        }

                        // Ensure we hit exact final score
                        setCurrentScore(FINAL_SCORE);

                        // 4. Complete
                        await waitForPlay();
                        setCurrentCriterionId(null);
                        setPhase("complete");
                        await wait(6000); // Show results for a while
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
            <div className="relative w-full h-full min-h-[450px] bg-slate-950 flex flex-col overflow-hidden border border-amber-500/20 font-sans group">

                {/* Background Infrastructure */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-90" />

                {/* Eval Telemetry Streams (Animated Background) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden font-mono text-[8px] text-amber-500 p-4">
                    <motion.div
                        animate={{ y: [-1000, 0] }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="whitespace-pre"
                    >
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} className="mb-1">
                                {`EVAL_STREAM_0x${i.toString(16).padStart(4, '0')} >> METHOD: ${i % 2 === 0 ? 'NLP_SENTIMENT' : 'MEDDIC_SCORE'} >> ${Math.random().toString(36).substring(7)}`}
                            </div>
                        ))}
                    </motion.div>
                </div>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="absolute top-3 right-3 flex items-center gap-2 z-50"
                />

                {/* --- HEADER --- */}
                <div className="relative z-10 w-full h-14 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/30 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <img src="/ZIM80Logo.png" alt="ZIM" className="h-7 w-auto object-contain" />
                        <div className="h-4 w-px bg-white/20" />
                        <span className="text-xs font-bold text-amber-400 tracking-[0.2em] uppercase">Sales Evaluation</span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-300">
                            <Activity size={10} className="animate-pulse" />
                            LIVE_SCORING
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Database size={14} className="text-amber-400" />
                        </div>
                    </div>
                </div>

                {/* --- MAIN DASHBOARD AREA --- */}
                <div className="relative z-10 flex-1 p-6 flex gap-6 h-full">

                    {/* Transcript / Data Feed Section */}
                    <div className="flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <FileText size={16} className="text-amber-400" />
                                Call Transcript
                            </h3>
                            <div className="text-[10px] font-mono text-slate-500 tracking-wider">ID: ZIM-SALES-882</div>
                        </div>

                        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
                            <div className="space-y-4">
                                {/* Agent */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-zim-teal/20 border border-zim-teal/30 flex items-center justify-center text-[10px] font-bold text-zim-teal">REP</div>
                                    <div className="flex-1 text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                                        "I understand you're looking for better rates on the trans-pacific route. ZIM excels there."
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="flex gap-3 justify-end">
                                    <div className="max-w-[85%] text-xs text-slate-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl rounded-tr-none">
                                        "That sounds good, but Maersk is offering us a 15% discount for the next quarter. Can you match that?"
                                    </div>
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">CLI</div>
                                </div>

                                {/* Agent Response (The weak point) */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 shrink-0 rounded-lg bg-zim-teal/20 border border-zim-teal/30 flex items-center justify-center text-[10px] font-bold text-zim-teal">REP</div>
                                    <div className="flex-1 text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5">
                                        "Well, our service reliability is much higher. Let me show you our on-time performance stats..."
                                    </div>
                                </div>
                            </div>

                            {/* Deep Scan Ray */}
                            <AnimatePresence>
                                {phase === 'scanning' && (
                                    <motion.div
                                        initial={{ top: "-20%" }}
                                        animate={{ top: "120%" }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 2.0, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent pointer-events-none z-20 flex flex-col justify-center"
                                    >
                                        <div className="h-px w-full bg-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,1)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Audit Checklist HUD Section */}
                    <div className="w-64 flex flex-col gap-4">
                        <div className="relative flex-1 bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xl flex flex-col">
                            {/* Decorative HUD Elements */}
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t border-r border-amber-500/40 rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b border-l border-amber-500/40 rounded-bl-xl" />

                            <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-bold text-amber-300 tracking-[0.2em] uppercase">Criteria</div>
                                <ShieldCheck size={14} className="text-amber-400" />
                            </div>

                            {/* Checklist Items */}
                            <div className="flex-1 space-y-3">
                                {SALES_CRITERIA.map((item) => {
                                    const isEvaluating = currentCriterionId === item.id;
                                    const result = results[item.id];
                                    const isPass = result === 'pass';
                                    const isWarn = result === 'warn';

                                    return (
                                        <div key={item.id} className="relative">
                                            <div className={`p-3 rounded-xl border transition-all duration-300 ${isEvaluating ? 'bg-amber-500/10 border-amber-500/50 scale-105' :
                                                result ? (isPass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20') :
                                                    'bg-white/5 border-white/5'
                                                }`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isPass ? 'text-emerald-400' : isWarn ? 'text-rose-400' : 'text-slate-200'}`}>
                                                        {item.label}
                                                    </span>
                                                    {isPass && <CheckCircle2 size={12} className="text-emerald-400" />}
                                                    {isWarn && <AlertTriangle size={12} className="text-rose-400" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                                        {(isEvaluating || result) && (
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: result ? "100%" : "70%" }}
                                                                transition={{ duration: item.duration / 1000 }}
                                                                className={`h-full ${isPass ? 'bg-emerald-400' : isWarn ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'}`}
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] font-mono text-slate-500">{item.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Score Meter Footer */}
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score</span>
                                    <span className="text-2xl font-black text-white font-mono">{currentScore}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: `${currentScore}%` }}
                                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
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
                            <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_80px_rgba(245,158,11,0.2)]">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20"
                                >
                                    <Award size={48} className="text-white" />
                                </motion.div>

                                <h4 className="text-2xl font-bold text-white mb-2">Evaluation Complete</h4>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="text-4xl font-black text-white">{FINAL_SCORE}</div>
                                    <div className="text-sm font-bold text-slate-500 self-end mb-1">/ 100</div>
                                </div>

                                {/* Coaching Card */}
                                <div className="w-full bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                                    <div className="flex items-center gap-2 mb-3 text-amber-400">
                                        <Lightbulb size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Coaching Opportunity</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        "{COACHING_TIP}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Win Probability</div>
                                        <div className="text-lg font-bold text-white flex items-center gap-1">
                                            <TrendingUp size={14} className="text-emerald-400" /> +12%
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Follow-up</div>
                                        <div className="text-lg font-bold text-white">
                                            Auto-Scheduled
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-[10px] font-mono text-amber-400 tracking-[0.3em] uppercase"
                                >
                                    Sending report to manager...
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </ClientOnly>
    );
};
