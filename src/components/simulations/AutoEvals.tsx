"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, FileText, CheckCircle } from "lucide-react";

export function AutoEvalsSimulation() {
    const [phase, setPhase] = useState<"scanning" | "summarizing" | "complete">("scanning");

    useEffect(() => {
        const cycle = async () => {
            setPhase("scanning");
            await new Promise(r => setTimeout(r, 3000));
            setPhase("summarizing");
            await new Promise(r => setTimeout(r, 3000));
            setPhase("complete");
            await new Promise(r => setTimeout(r, 4000));
            cycle(); // Loop
        };
        cycle();
    }, []);

    return (
        <div className="h-full flex flex-col p-4 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === "scanning" && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-2 relative"
                    >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-4 bg-zinc-800 rounded w-full overflow-hidden relative">
                                <motion.div
                                    className="absolute inset-0 bg-zim-teal/20"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/80 backdrop-blur border border-zim-teal px-4 py-2 rounded-full flex items-center gap-2 text-zim-teal">
                                <ScanSearch size={16} className="animate-spin-slow" />
                                <span className="text-xs font-mono">ANALYZING TRANSCRIPT...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === "summarizing" && (
                    <motion.div
                        key="summarizing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-2">
                            <FileText size={16} className="text-gen-orange" />
                            <span>Generating Insights...</span>
                        </div>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.5 }}
                                className="p-3 bg-zinc-800/50 rounded border border-white/5"
                            >
                                <div className="h-2 bg-zinc-700 rounded w-3/4 mb-2 animate-pulse" />
                                <div className="h-2 bg-zinc-700 rounded w-1/2 animate-pulse" />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {phase === "complete" && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-4 h-full"
                    >
                        <div className="flex items-center justify-between border-b border-zim-teal/30 pb-2">
                            <span className="text-zim-teal font-mono font-bold text-sm">AI SUMMARY</span>
                            <CheckCircle size={16} className="text-emerald-400" />
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex gap-2">
                                <span className="text-zim-teal">•</span>
                                <span>Agent resolved shipping delay.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-zim-teal">•</span>
                                <span>Customer sentiment shifted from Negative to Positive.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-zim-teal">•</span>
                                <span>Follow-up scheduled for 24h.</span>
                            </li>
                        </ul>

                        <div className="mt-auto bg-emerald-900/20 border border-emerald-500/30 p-3 rounded text-center">
                            <span className="text-emerald-400 font-bold text-xs tracking-widest">COMPLIANCE PASSED</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AutoEvalsKPIs() {
    return (
        <div className="flex flex-col gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-zim-teal/30 transition-colors">
                <span className="text-xs text-zinc-500 uppercase block mb-1">Manual QA Time</span>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">0s</span>
                    <span className="text-xs text-zim-teal mb-1">Down from 15m</span>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-zim-teal/30 transition-colors">
                <div className="absolute inset-0 bg-zim-teal/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs text-zinc-500 uppercase block mb-1">Business KPI</span>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-mono">
                        100<span className="text-lg text-zinc-500">%</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-mono tracking-tighter">
                        COVERAGE
                    </span>
                </div>
            </div>
        </div>
    );
}
