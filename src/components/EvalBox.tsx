"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { Users, BarChart3, Award, AlertCircle, ChevronDown, ChevronUp, Phone, TrendingUp } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'loading' | 'metrics' | 'leaderboard' | 'drilldown';

interface RepData {
    id: string;
    name: string;
    calls: number;
    score: number;
    status: 'good' | 'average' | 'risk';
    trend: 'up' | 'down' | 'flat';
}

// --- Data ---
const REPS: RepData[] = [
    { id: '1', name: 'David Kim', calls: 38, score: 91, status: 'good', trend: 'up' },
    { id: '2', name: 'Sarah Miller', calls: 29, score: 85, status: 'good', trend: 'flat' },
    { id: '3', name: 'Tom Wilson', calls: 22, score: 62, status: 'risk', trend: 'down' },
    { id: '4', name: 'Jessica Lee', calls: 31, score: 78, status: 'average', trend: 'up' },
];

// --- Component ---
export const EvalBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [expandedRep, setExpandedRep] = useState<string | null>(null);

    // Count-up states for KPIs
    const [counts, setCounts] = useState({ calls: 0, sentiment: 0, score: 0, risks: 0 });

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

    const animateCount = async (target: number, key: keyof typeof counts, duration: number) => {
        const steps = 20;
        const interval = duration / steps;
        const increment = target / steps;

        for (let i = 1; i <= steps; i++) {
            if (stateRef.current === 'idle') return;
            setCounts(prev => ({ ...prev, [key]: Math.min(Math.round(increment * i), target) }));
            await wait(interval);
        }
    };

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            setPhase('idle');
            setExpandedRep(null);
            setCounts({ calls: 0, sentiment: 0, score: 0, risks: 0 });
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
                        setExpandedRep(null);
                        setCounts({ calls: 0, sentiment: 0, score: 0, risks: 0 });
                        await wait(500);

                        // === PHASE 1: LOADING ===
                        await waitForPlay();
                        setPhase('loading');
                        await wait(1200);

                        // === PHASE 2: METRICS ===
                        await waitForPlay();
                        setPhase('metrics');
                        // Animate counters concurrently
                        const metricsAnimations = [
                            animateCount(142, 'calls', 1000),
                            animateCount(74, 'sentiment', 1000),
                            animateCount(81, 'score', 1000),
                            animateCount(3, 'risks', 600)
                        ];
                        await Promise.all(metricsAnimations);
                        await wait(800);

                        // === PHASE 3: LEADERBOARD ===
                        await waitForPlay();
                        setPhase('leaderboard');
                        await wait(1500);

                        // === PHASE 4: DRILLDOWN (Tom Wilson) ===
                        await waitForPlay();
                        setPhase('drilldown');
                        setExpandedRep('3'); // Tom Wilson
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
    const isActive = state !== 'idle';

    // Skeleton Component
    const SkeletonRow = () => (
        <div className="flex items-center gap-4 py-3 border-b border-slate-800/50 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-slate-800 rounded" />
                <div className="h-2 w-16 bg-slate-800/60 rounded" />
            </div>
            <div className="w-12 h-6 bg-slate-800 rounded" />
        </div>
    );

    return (
        <ClientOnly>
            <div className={`relative w-full min-h-[400px] bg-slate-950 flex flex-col items-center font-sans select-none transition-all duration-500 ease-in-out ${state === 'idle' ? 'cursor-default' : ''}`}>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-0 mr-4"
                />

                {/* IDLE STATE OVERLAY */}
                {state === 'idle' && (
                    <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-sm" />
                )}

                {/* CONTENT CONTAINER */}
                <div className="w-full flex-1 p-6 flex flex-col gap-6">

                    {/* --- KPI ROW --- */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <AnimatePresence>
                            {(phase === 'metrics' || phase === 'leaderboard' || phase === 'drilldown') && (
                                <>
                                    {/* Calls Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"
                                    >
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            <Phone size={12} /> Calls
                                        </div>
                                        <div className="text-2xl font-bold text-white tabular-nums">{counts.calls}</div>
                                    </motion.div>

                                    {/* Sentiment Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"
                                    >
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            <TrendingUp size={12} /> Sentiment
                                        </div>
                                        <div className="text-2xl font-bold text-emerald-400 tabular-nums">{counts.sentiment}%</div>
                                    </motion.div>

                                    {/* Score Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"
                                    >
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            <Award size={12} /> Avg Score
                                        </div>
                                        <div className="text-2xl font-bold text-indigo-400 tabular-nums">{counts.score}</div>
                                    </motion.div>

                                    {/* Risk Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-1"
                                    >
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                            <AlertCircle size={12} /> At Risk
                                        </div>
                                        <div className="text-2xl font-bold text-rose-500 tabular-nums">{counts.risks}</div>
                                    </motion.div>
                                </>
                            )}

                            {/* Loading State for Cards */}
                            {phase === 'loading' && (
                                <>
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 h-[74px] animate-pulse"
                                        />
                                    ))}
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* --- LEADERBOARD --- */}
                    <div className="w-full relative border border-slate-800 rounded-2xl bg-slate-900/30 backdrop-blur-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} className="text-indigo-400" /> Rep Performance
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] text-slate-500">On Track</span>
                                <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" />
                                <span className="text-[10px] text-slate-500">Risk</span>
                            </div>
                        </div>

                        {/* Loading Skeletons */}
                        {phase === 'loading' && (
                            <div className="p-4 space-y-2">
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </div>
                        )}

                        {/* Rows */}
                        <div className="p-2 space-y-1 w-full">
                            <AnimatePresence>
                                {(phase === 'leaderboard' || phase === 'drilldown' || phase === 'metrics') && REPS.map((rep, index) => (
                                    <motion.div
                                        key={rep.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.1) }}
                                        className={`group rounded-lg overflow-hidden border transition-all duration-300 relative
                                            ${expandedRep === rep.id
                                                ? 'bg-slate-800/60 border-indigo-500/30 shadow-lg'
                                                : 'bg-transparent border-transparent hover:bg-slate-800/30'
                                            }
                                        `}
                                    >
                                        {/* Main Row */}
                                        <div className="flex items-center p-3 gap-3">
                                            {/* Avatar / Initials */}
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-offset-slate-950
                                                ${rep.status === 'risk' ? 'bg-rose-950 text-rose-400 ring-rose-500/20' : 'bg-slate-800 text-slate-300 ring-slate-700/50'}
                                            `}>
                                                {rep.name.split(' ').map(n => n[0]).join('')}
                                            </div>

                                            {/* Name & Calls */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-white truncate">{rep.name}</span>
                                                    {rep.status === 'risk' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/20 uppercase font-bold tracking-wider">
                                                            Alert
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span>{rep.calls} calls</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className={rep.trend === 'down' ? 'text-rose-400' : 'text-emerald-400'}>
                                                        {rep.trend === 'up' ? '↗' : rep.trend === 'down' ? '↘' : '→'} Trend
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="flex flex-col items-end mr-2">
                                                <span className={`text-sm font-bold ${rep.score < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    {rep.score}
                                                </span>
                                                <span className="text-[9px] text-slate-600 uppercase">Score</span>
                                            </div>

                                            {/* Expand Icon */}
                                            {rep.id === '3' && ( // Only Tom Wilson expands in this sim
                                                <motion.div
                                                    animate={{ rotate: expandedRep === rep.id ? 180 : 0 }}
                                                    className="opacity-50"
                                                >
                                                    <ChevronDown size={14} />
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Drilling Down Content */}
                                        <AnimatePresence>
                                            {expandedRep === rep.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-slate-950/30 border-t border-slate-700/50"
                                                >
                                                    <div className="p-3 space-y-3">
                                                        <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-500/20">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="font-bold block mb-0.5">Performance Issue Detected</span>
                                                                Low objection handling score detected in 5 recent calls.
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-2 text-xs text-indigo-300 bg-indigo-950/20 p-2 rounded border border-indigo-500/20">
                                                            <Award size={14} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="font-bold block mb-0.5">AI Recommendation</span>
                                                                Assign "Handling Price Objections" coaching module.
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 mt-1">
                                                            <button className="flex-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
                                                                Assign Coaching
                                                            </button>
                                                            <button className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors">
                                                                Listen to Calls
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </ClientOnly>
    );
};
