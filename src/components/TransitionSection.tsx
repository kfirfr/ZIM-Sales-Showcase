"use client";

import React from "react";
import { motion } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";
import { ArrowRight, Sparkles } from "lucide-react";

export const TransitionSection = () => {
    return (
        <section className="relative py-32 px-4 overflow-hidden">
            {/* Background accents */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zim-teal/5 to-transparent" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-gen-orange/30 mb-6">
                        <Sparkles size={16} className="text-gen-orange" />
                        <span className="text-xs font-bold text-gen-orange uppercase tracking-wider">Coming Soon</span>
                    </div>

                    <AnimatedTitle as="h2" className="text-4xl md:text-6xl tracking-tight mb-6">
                        The Next Horizon
                    </AnimatedTitle>

                    <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        We're expanding our AI capabilities to fully autonomous customer journeys—from predictive routing to self-service virtual agents.
                    </p>
                </motion.div>

                {/* Roadmap Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="flex items-center justify-center gap-6 md:gap-12 mt-12"
                >
                    {/* Current State */}
                    <div className="flex flex-col items-center gap-4 max-w-xs">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">Today</h3>
                            <p className="text-xs text-slate-500">Agent-Assisted AI</p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="text-zim-teal animate-pulse" size={32} />

                    {/* Future State */}
                    <div className="flex flex-col items-center gap-4 max-w-xs">
                        <div className="w-16 h-16 rounded-full bg-zim-teal/20 border-2 border-zim-teal flex items-center justify-center relative">
                            <svg className="w-8 h-8 text-zim-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gen-orange rounded-full animate-ping" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">2025</h3>
                            <p className="text-xs text-slate-500">Autonomous AI Orchestration</p>
                        </div>
                    </div>
                </motion.div>

                {/* Key Capabilities Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 flex flex-wrap justify-center gap-4 text-sm text-slate-400"
                >
                    {["Predictive Intent Routing", "Self-Service Bots", "Proactive Outreach", "AI Knowledge Base"].map((item, i) => (
                        <div key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            {item}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
