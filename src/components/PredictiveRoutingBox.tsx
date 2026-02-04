"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Zap, CheckCircle2, AlertTriangle, TrendingDown, Users, FileText, Send, RefreshCw, Play, Pause } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Types ---
type SimulationPhase = 'IDLE' | 'RADAR_SCAN' | 'DEEP_DIVE' | 'STRATEGY' | 'EXECUTION' | 'RESOLVED';

interface Client {
    id: string;
    name: string;
    logo: React.ReactNode;
    status: 'stable' | 'risk' | 'churned' | 'retained';
}

const CLIENTS: Client[] = [
    { id: 'c1', name: 'Adidas', logo: <span className="font-black text-xl">A</span>, status: 'stable' },
    { id: 'c2', name: 'Nike', logo: <span className="font-black text-xl italic">N</span>, status: 'stable' },
    { id: 'c3', name: 'Tesla', logo: <span className="font-bold text-xl tracking-tighter">T</span>, status: 'risk' },
    { id: 'c4', name: 'Sony', logo: <span className="font-serif text-xl">S</span>, status: 'stable' },
    { id: 'c5', name: 'Uber', logo: <span className="font-medium text-xl">U</span>, status: 'stable' },
    { id: 'c6', name: 'Meta', logo: <span className="font-bold text-xl">∞</span>, status: 'stable' },
    { id: 'c7', name: 'Apple', logo: <span className="font-bold text-xl"></span>, status: 'stable' },
];

// --- Sub-components ---

const HexGrid = ({ clients, scanActive, onTargetFound }: { clients: Client[], scanActive: boolean, onTargetFound: () => void }) => {
    return (
        <div className="grid grid-cols-3 gap-4 md:gap-6 relative z-10 p-4">
            {clients.map((client, index) => (
                <ClientHex key={client.id} client={client} index={index} scanActive={scanActive} onTargetFound={onTargetFound} />
            ))}
            {/* Radar Scan Overlay */}
            <AnimatePresence>
                {scanActive && (
                    <motion.div
                        className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full h-[20%] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent blur-sm absolute top-0"
                            animate={{ top: ['-20%', '120%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,182,212,0.1)_70%)] opacity-50" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ClientHex = ({ client, index, scanActive, onTargetFound }: { client: Client, index: number, scanActive: boolean, onTargetFound: () => void }) => {
    const isTarget = client.name === 'Tesla';
    const [isFlickering, setIsFlickering] = useState(false);

    useEffect(() => {
        if (scanActive && isTarget) {
            const timer = setTimeout(() => {
                setIsFlickering(true);
                onTargetFound();
            }, 1500); // Found after 1.5s of scanning
            return () => clearTimeout(timer);
        } else {
            setIsFlickering(false);
        }
    }, [scanActive, isTarget, onTargetFound]);

    return (
        <motion.div
            layout
            className={`relative aspect-video md:aspect-square flex flex-col items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300
                ${isFlickering
                    ? 'bg-red-900/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40'
                }
            `}
        >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border mb-2
                 ${isFlickering ? 'bg-red-500/20 text-red-200 border-red-500/50' : 'bg-slate-700/50 text-slate-300 border-slate-600/50'}
            `}>
                {client.logo}
            </div>
            <div className={`text-xs font-bold uppercase tracking-wider ${isFlickering ? 'text-red-400' : 'text-slate-400'}`}>
                {client.name}
            </div>
            {isFlickering && (
                <motion.div
                    layoutId="risk-badge"
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <AlertTriangle size={10} /> RISK
                </motion.div>
            )}
        </motion.div>
    );
};

const DeepDiveCard = ({ onActionClick }: { onActionClick: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex flex-col gap-4"
        >
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/50 text-red-400 font-bold text-2xl tracking-tighter">
                        T
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-none">Tesla Motors</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50">High Risk</span>
                            <span className="text-xs text-slate-400">ARR: $4.5M</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-red-500">-28</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">NPS Score</div>
                </div>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <TrendingDown size={14} /> Usage
                    </div>
                    <div className="text-white font-mono font-bold">-15% MoM</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Users size={14} /> Active Seats
                    </div>
                    <div className="text-white font-mono font-bold">142/200</div>
                </div>
            </div>

            {/* AI Insight */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mx-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Zap size={14} /> AI Root Cause
                </div>
                <p className="text-sm text-amber-200/80 leading-snug">
                    Recent surge in "API Latency" tickets correlates with drop in usage.
                </p>
            </div>

            <div className="flex-1" />

            {/* Action Button */}
            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onActionClick}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Mail size={16} />
                Generate Retention Email
            </motion.button>
        </motion.div>
    );
};

const ExecutionView = ({ isPlaying, onComplete }: { isPlaying: boolean, onComplete: () => void }) => {
    const fullText = "Team, I've noticed the latency issues. I'm deploying a dedicated instance for you immediately and issuing a 20% service credit for Q3.";
    const [text, setText] = useState("");
    const index = useRef(0);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying && !sent) {
            timer = setInterval(() => {
                if (index.current < fullText.length) {
                    setText((prev) => prev + fullText.charAt(index.current));
                    index.current++;
                } else {
                    clearInterval(timer);
                    setTimeout(() => setSent(true), 800);
                    setTimeout(onComplete, 2500); // Wait before finishing
                }
            }, 30);
        }
        return () => clearInterval(timer);
    }, [isPlaying, sent, onComplete]);

    if (sent) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
            >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Send size={32} />
                </div>
                <h3 className="text-emerald-400 font-bold text-lg mb-1">Email Sent</h3>
                <p className="text-slate-400 text-sm">Status updated to <span className="text-emerald-400 font-semibold">Risk Mitigated</span></p>
            </motion.div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs">AI</div>
                    <span className="font-semibold">Drafting Response...</span>
                </div>
            </div>
            <div className="font-mono text-sm text-slate-300 leading-relaxed">
                {text}
                <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-blue-500 align-middle"></span>
            </div>
        </div>
    );
};


export const PredictiveRoutingBox = () => {
    const [phase, setPhase] = useState<SimulationPhase>('IDLE');
    const [isPlaying, setIsPlaying] = useState(false);
    const [key, setKey] = useState(0); // For resetting

    const handlePlay = () => {
        setIsPlaying(true);
        if (phase === 'IDLE') setPhase('RADAR_SCAN');
    };

    const handlePause = () => setIsPlaying(false);

    const handleReset = () => {
        setIsPlaying(false);
        setPhase('IDLE');
        setKey(prev => prev + 1);
    };

    const handleTargetFound = () => {
        setTimeout(() => {
            if (isPlaying) setPhase('DEEP_DIVE');
        }, 1000);
    };

    const handleStrategyClick = () => {
        setPhase('EXECUTION');
    };

    const handleExecutionComplete = () => {
        setPhase('RESOLVED');
        // Auto-reset after delay
        setTimeout(() => {
            if (phase !== 'IDLE') handleReset();
        }, 3000);
    };


    return (
        <ClientOnly>
            <div className="relative w-full h-[400px] bg-slate-950 flex flex-col overflow-hidden border border-slate-800/50 rounded-none md:rounded-b-2xl">

                {/* --- HEADER / CONTROL BAR --- */}
                <div className="absolute top-0 inset-x-0 h-14 bg-slate-900/60 backdrop-blur-md border-b border-white/5 z-50 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Shield className="text-cyan-400" size={16} />
                        <span className="text-xs font-bold text-slate-300 tracking-wider">CHURN SENTINEL</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={handleReset}
                            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Reset"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-0.5" />
                        {isPlaying && phase !== 'RESOLVED' ? (
                            <button
                                onClick={handlePause}
                                className="p-1.5 rounded-md hover:bg-white/10 text-amber-400 transition-colors"
                                title="Pause"
                            >
                                <Pause size={14} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                onClick={handlePlay}
                                disabled={phase === 'RESOLVED'}
                                className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${phase === 'RESOLVED' ? 'text-slate-600' : 'text-emerald-400'}`}
                                title="Play"
                            >
                                <Play size={14} fill="currentColor" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 relative pt-14 p-6 flex flex-col items-center justify-center">

                    {/* IDLE OVERLAY */}
                    <AnimatePresence>
                        {phase === 'IDLE' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handlePlay}
                                    className="group relative px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Play size={16} fill="currentColor" /> Initialize Sentinel
                                    </span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>


                    {/* SCENE: RADAR + GRID */}
                    <AnimatePresence mode='wait'>
                        {(phase === 'IDLE' || phase === 'RADAR_SCAN') && (
                            <motion.div
                                key="grid"
                                className="w-full max-w-sm"
                                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            >
                                <HexGrid
                                    key={key}
                                    clients={CLIENTS}
                                    scanActive={phase === 'RADAR_SCAN' && isPlaying}
                                    onTargetFound={handleTargetFound}
                                />
                            </motion.div>
                        )}

                        {/* SCENE: DEEP DIVE */}
                        {(phase === 'DEEP_DIVE' || phase === 'STRATEGY') && (
                            <motion.div
                                key="deep-dive"
                                className="w-full max-w-sm h-full max-h-[320px]"
                            >
                                <DeepDiveCard onActionClick={handleStrategyClick} />
                            </motion.div>
                        )}

                        {/* SCENE: EXECUTION */}
                        {(phase === 'EXECUTION' || phase === 'RESOLVED') && (
                            <motion.div
                                key="execution"
                                className="w-full max-w-sm h-full max-h-[300px]"
                            >
                                <ExecutionView isPlaying={isPlaying} onComplete={handleExecutionComplete} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </ClientOnly>
    );
};
