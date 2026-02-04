"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ZIM_LOGO_URL = "https://npkyfnkpkuovnplylxot.supabase.co/storage/v1/object/public/ZIM/zim80-logo-313x112-white.png";

// THE KEY DATA - Aligned with User Request & "Quattro Gradient" Logic
const roadmapData = [
    {
        year: "2025",
        subtitle: "THE FOUNDATION",
        title: "EXCELLENCE DELIVERED",
        description: "Core AI capabilities deployed and driving value today.",
        color: "#60a5fa", // Blue start
        features: [
            "Speech & Text Analytics",
            "AI Summarization",
            "Auto-Quality Assurance",
            "Global Translation (Real-time)"
        ]
    },
    {
        year: "2026", // showcase features
        subtitle: "THE NEXT HORIZON",
        title: "CX & AI ORCHESTRATION",
        description: "Predictive & agentic workflows currently being showcased.",
        color: "#34d399", // Green/Teal mid
        features: [
            "Predictive Engagement",
            "Neural Routing Engine",
            "Agentic Task Force",
            "Smart Knowledge Base"
        ]
    },
    {
        year: "2027+", // future plans
        subtitle: "The Autonomous Frontier",
        title: "COGNITIVE SOVEREIGNTY",
        description: "Self-governing AI systems that evolve with the business.",
        color: "#a78bfa", // Purple/Orange end
        features: [
            "Autonomous Agentic AI",
            "Self-Healing Journeys",
            "Generative Brand Voice",
            "Emotional Intelligence Grid"
        ]
    }
];

export const VisionaryFooter = () => {
    // Hover state for interactive "hologram" cards
    const [activeCol, setActiveCol] = useState<number | null>(null);

    return (
        <footer id="roadmap" className="relative w-full pt-32 pb-12 overflow-hidden">
            {/* 1. SEAMLESS BACKGROUND BLEND */}
            {/* Fully transparent at top, gradually darkening only at the very bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#030712] to-transparent pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to top, #030712 0%, rgba(3, 7, 18, 0.6) 15%, transparent 30%)' }}
            />

            {/* Noise texture only at bottom to avoid any visual artifacts */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] opacity-10 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">

                {/* HEADER: Strategic Roadmap */}
                <div className="text-center mb-16 relative">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight quattro-gradient">
                        STRATEGIC AI ROADMAP
                    </h2>
                </div>


                {/* 3. THE "QUATTRO GRADIENT" TIMELINE (Seamless Loop) */}
                <div className="relative w-full max-w-6xl mb-24">
                    {/* The Rail */}
                    <div className="w-full h-[1px] bg-white/10 relative">
                        {/* The Active Beam - pure CSS animation for perfect seamless loop */}
                        <div className="absolute inset-0 h-[2px] -top-[0.5px] opacity-100">
                            <div className="w-full h-full animate-gradient-flow"
                                style={{
                                    background: 'linear-gradient(to right, #60a5fa, #34d399, #a78bfa, #fb923c, #60a5fa, #34d399, #a78bfa)',
                                    backgroundSize: '200% 100%'
                                }}
                            />
                        </div>
                        {/* Glow under the beam */}
                        <div className="absolute inset-0 h-[4px] -top-[1.5px] blur-[4px] opacity-60">
                            <div className="w-full h-full animate-gradient-flow"
                                style={{
                                    background: 'linear-gradient(to right, #60a5fa, #34d399, #a78bfa, #fb923c, #60a5fa, #34d399, #a78bfa)',
                                    backgroundSize: '200% 100%'
                                }}
                            />
                        </div>
                    </div>

                    {/* TIMELINE NODES */}
                    <div className="absolute top-0 left-0 w-full -translate-y-[7px] flex justify-between px-4 md:px-32">
                        {roadmapData.map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center group cursor-pointer"
                                onMouseEnter={() => setActiveCol(idx)}
                                onMouseLeave={() => setActiveCol(null)}
                            >
                                {/* Node Dot */}
                                <div className={`w-4 h-4 rounded-full bg-[#030712] border-2 z-10 transition-all duration-300 relative ${activeCol === idx ? 'border-white scale-125' : 'border-white/20 group-hover:border-white group-hover:scale-125'}`}>
                                    {/* Inner light */}
                                    <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${activeCol === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                        style={{ backgroundColor: item.color, filter: 'blur(2px)' }}
                                    />
                                </div>

                                {/* Year Label */}
                                <span className={`absolute -top-10 font-mono text-lg font-bold tracking-widest transition-all duration-300
                                               ${activeCol === idx ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110 group-hover:drop-shadow-lg'}`}
                                    style={{
                                        color: item.color,
                                        textShadow: `0 0 20px ${item.color}40`
                                    }}>
                                    {item.year}
                                </span>

                                {/* Connection Line to content */}
                                <div className={`w-[1px] h-8 mt-2 bg-gradient-to-b from-white/20 to-transparent transition-all duration-500
                                                ${activeCol === idx ? 'h-16 opacity-100 from-white' : 'opacity-30'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>


                {/* 4. FUTURISTIC CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mb-32">
                    {roadmapData.map((item, idx) => {
                        const isActive = activeCol === idx;

                        return (
                            <div key={idx}
                                className={`relative group rounded-xl p-0.5 transition-all duration-500
                                           ${isActive ? 'scale-[1.02]' : 'scale-100 opacity-80 hover:opacity-100'}`}
                                onMouseEnter={() => setActiveCol(idx)}
                                onMouseLeave={() => setActiveCol(null)}
                            >
                                {/* Active Border Gradient */}
                                <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500
                                                ${isActive ? 'opacity-100' : 'group-hover:opacity-30'}`}
                                    style={{
                                        background: `linear-gradient(145deg, ${item.color}, transparent 60%)`
                                    }}
                                />

                                {/* Card Content */}
                                <div className="relative h-full bg-[#030712]/90 backdrop-blur-md rounded-xl p-8 border border-white/5 overflow-hidden">
                                    {/* Header */}
                                    <div className="mb-6 border-b border-white/5 pb-4">
                                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2" style={{ color: item.color }}>
                                            {item.subtitle}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{item.title}</h3>
                                        {/* <p className="text-xs text-slate-400 leading-relaxed font-mono opacity-60">
                                            {item.description}
                                        </p> */}
                                    </div>

                                    {/* Feature List - The "Selling" Part */}
                                    <ul className="space-y-4">
                                        {item.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-center space-x-4 group/li">
                                                {/* Tech Bullet */}
                                                <div className="relative flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                                    {/* Outer glow ring */}
                                                    <div className={`absolute inset-0 rounded-full opacity-0 group-hover/li:opacity-30 transition-all duration-300 blur-sm`}
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    {/* Main bullet */}
                                                    <div className={`relative w-2 h-2 rounded-full transition-all duration-300 group-hover/li:scale-150`}
                                                        style={{
                                                            backgroundColor: item.color,
                                                            boxShadow: `0 0 8px ${item.color}40`
                                                        }}
                                                    />
                                                    {/* Accent ring */}
                                                    <div className="absolute inset-0 rounded-full border border-white/10 group-hover/li:border-white/30 transition-colors duration-300" />
                                                </div>

                                                <span className={`text-base font-semibold transition-all duration-200 leading-relaxed
                                                               ${isActive ? 'text-white' : 'text-slate-300 group-hover/li:text-white group-hover/li:translate-x-1'}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Bottom aesthetic tech-lines */}
                                    <div className="absolute bottom-0 right-0 p-4 opacity-10">
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-1 h-8 bg-white skew-x-12" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* 5. FOOTER SIGNATURE */}
                <div className="w-full flex flex-col md:flex-row justify-between items-end border-t border-white/5 pt-12 pb-4 opacity-50 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex flex-col gap-4">
                        <div className="h-8 flex items-center">
                            <img src={ZIM_LOGO_URL} alt="ZIM" className="h-full w-auto object-contain opacity-80" />
                        </div>
                        <div className="text-[10px] tracking-[0.3em] uppercase text-white/40">
                            UC CC Division · 2026
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 text-right">
                        <h4 className="text-lg md:text-xl font-light text-white/90 italic leading-relaxed">
                            "The Future is a Choice.<br />
                            <span className="quattro-gradient not-italic font-black text-2xl md:text-3xl tracking-tight">Let's Orchestrate it.</span>"
                        </h4>
                    </div>
                </div>

            </div>

            {/* Global Animation Styles for this component only */}
            <style jsx global>{`
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animate-gradient-flow {
                    animation: gradient-flow 3s linear infinite;
                }
            `}</style>
        </footer>
    );
};
