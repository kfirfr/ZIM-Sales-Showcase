"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const transcript = [
    { role: "agent", text: "Hello, how can I help you today?" },
    { role: "customer", text: "I am angry about the delay. It's been weeks!" },
    { role: "ai", text: "Detected: High Friction. Flagging Supervisor." },
    { role: "agent", text: "I completely understand your frustration. Let me check the status immediately." },
    { role: "customer", text: "Just fix it, please." },
    { role: "agent", text: "I've located the issue. Expediting it now—it will arrive tomorrow." },
    { role: "customer", text: "Okay, thank you. That's a relief." },
];

export function SpeechAnalyticsSimulation() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev < transcript.length ? prev + 1 : 0));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-4 font-mono text-sm h-full overflow-y-auto p-2 scrollbar-hide">
            <AnimatePresence>
                {transcript.slice(0, index + 1).map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.role === "customer" ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg max-w-[90%] ${msg.role === "customer"
                                ? "bg-zinc-800 self-start border border-zinc-700 text-white"
                                : msg.role === "ai"
                                    ? "bg-indigo-900/30 self-center text-xs text-indigo-300 border border-indigo-500/30 w-full text-center"
                                    : "bg-teal-900/30 self-end text-zim-teal border border-teal-500/30"
                            }`}
                    >
                        <span className="block text-[10px] opacity-70 mb-1 uppercase text-zinc-400">
                            {msg.role}
                        </span>
                        {msg.text.split(" ").map((word, w) => {
                            const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
                            let highlightClass = "";
                            if (cleanWord === "angry") highlightClass = "text-red-500 font-bold bg-red-900/20 px-1 rounded";
                            if (cleanWord === "delay") highlightClass = "text-gen-orange font-bold bg-orange-900/20 px-1 rounded";

                            return (
                                <span key={w} className={highlightClass}>
                                    {word}{" "}
                                </span>
                            );
                        })}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export function SpeechAnalyticsKPIs() {
    const [gaugeValue, setGaugeValue] = useState(30); // Start low (Red)

    useEffect(() => {
        // Simulate gauge moving from Red (anger) to Green (solution)
        const interval = setInterval(() => {
            setGaugeValue((prev) => (prev < 90 ? prev + 10 : 30));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-4">
            {/* Sentiment Gauge */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-zim-teal/30 transition-colors">
                <span className="text-xs text-zinc-500 uppercase block mb-2">Live Sentiment</span>

                <div className="relative h-24 w-full flex items-end justify-center">
                    {/* Gauge Background */}
                    <div className="absolute bottom-0 w-40 h-20 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-t-full opacity-20" />
                    <div className="absolute bottom-0 w-32 h-16 bg-zinc-900 rounded-t-full z-10" />

                    {/* Needle */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom z-20"
                        style={{ borderRadius: '2px' }}
                        animate={{ rotate: (gaugeValue / 100) * 180 - 90 }} // Map 0-100 to -90 to 90 deg
                        transition={{ type: "spring", stiffness: 60 }}
                    />
                    <div className="absolute bottom-0 z-30 w-4 h-4 bg-white rounded-full translate-y-1/2" />
                </div>

                <div className="mt-2 text-center">
                    <span className={`text-2xl font-bold font-mono ${gaugeValue > 75 ? 'text-emerald-400' : gaugeValue > 40 ? 'text-yellow-400' : 'text-red-500'}`}>
                        {gaugeValue}%
                    </span>
                </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 group hover:border-zim-teal/30 transition-colors">
                <span className="text-xs text-zinc-500 uppercase block mb-1">Business KPI</span>
                {/* Glowing Number */}
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        12<span className="text-lg text-zinc-500">%</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-mono tracking-tighter">
                        CSAT INCREASE
                    </span>
                </div>
            </div>
        </div>
    );
}
