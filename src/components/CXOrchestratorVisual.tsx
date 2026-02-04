"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Touchpoint data with metrics (Logos & Colors)
interface Touchpoint {
    id: string;
    label: string;
    color: string;
    hex: string;
    icon: React.ReactNode;
    position: { x: string; y: string; };
    image?: string;
}

const TOUCHPOINTS: Touchpoint[] = [
    {
        id: "whatsapp",
        label: "WhatsApp",
        color: "text-[#25D366]",
        hex: "#25D366",
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
        ),
        position: { x: "15%", y: "20%" },
    },
    {
        id: "messenger",
        label: "Messenger",
        color: "text-[#0084FF]",
        hex: "#0084FF",
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.03 2 11c0 2.86 1.48 5.4 3.79 6.99V22l3.47-1.9c.87.24 1.79.37 2.74.37 5.52 0 10-4.03 10-9S17.52 2 12 2zm1.14 12.2l-2.48-2.65-4.84 2.65 5.32-5.65 2.5 2.65 4.82-2.65-5.32 5.65z" />
            </svg>
        ),
        position: { x: "50%", y: "12%" },
    },
    {
        id: "crm",
        label: "Dynamics 365",
        color: "text-[#2c3e50]",
        hex: "#2c3e50",
        icon: (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5.5 8.5L11 6L9 16L5.5 8.5Z" opacity="0.6" />
                <path d="M12 5L19 2L17 12L12 5Z" opacity="0.8" />
                <path d="M10 17L17 13L16 20L9 22L10 17Z" />
            </svg>
        ),
        position: { x: "85%", y: "20%" },
    },
    {
        id: "wechat",
        label: "WeChat",
        color: "text-[#7BB32E]",
        hex: "#7BB32E",
        icon: (
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5 2C4.9 2 2 4.5 2 7.5C2 9.5 3.1 11.2 4.8 12.1C4.7 12.5 4.3 13.5 4.2 13.7C4.1 13.9 4.3 14 4.5 13.9C5.5 13.4 6.9 12.5 7.4 12.2C7.7 12.3 8.1 12.3 8.5 12.3C8.8 12.3 9.2 12.3 9.5 12.2C9.2 11.5 9.1 10.8 9.1 10C9.1 6.1 12.5 2.9 16.6 2.9C14.2 2.3 11.5 2 8.5 2ZM6 6.5C6.6 6.5 7 6.9 7 7.5C7 8.1 6.6 8.5 6 8.5C5.4 8.5 5 8.1 5 7.5C5 6.9 5.4 6.5 6 6.5ZM11 6.5C11.6 6.5 12 6.9 12 7.5C12 8.1 11.6 8.5 11 8.5C10.4 8.5 10 8.1 10 7.5C10 6.9 10.4 6.5 11 6.5Z" />
                <path d="M16.5 5C12.4 5 9 7.7 9 11C9 14.3 12.4 17 16.5 17C17 17 17.5 16.9 18 16.8C18.6 17.2 20.3 18.2 21.6 18.9C21.8 19 22 18.9 21.9 18.7C21.8 18.4 21.3 17.2 21.2 16.7C22.9 15.6 24 13.4 24 11C24 7.7 20.6 5 16.5 5ZM14.5 10C14.5 9.4 14.9 9 15.5 9C16.1 9 16.5 9.4 16.5 10C16.5 10.6 16.1 11 15.5 11C14.9 11 14.5 10.6 14.5 10ZM19 10C19 9.4 19.4 9 20 9C20.6 9 21 9.4 21 10C21 10.6 20.6 11 20 11C19.4 11 19 10.6 19 10Z" />
            </svg>
        ),
        position: { x: "5%", y: "50%" },
    },
    {
        id: "line",
        label: "LINE",
        color: "text-[#06C755]",
        hex: "#06C755",
        icon: (
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 10.8C22 5.9 17.5 2 12 2C6.5 2 2 5.9 2 10.8C2 14.6 4.3 17.8 7.9 18.9C7.7 19.7 7.4 21.3 7.3 21.6C7.2 22 8 22 8.4 21.6C9.2 20.9 13.5 16.7 13.5 16.7H12C17.5 16.7 22 14 22 10.8ZM16.8 13H15.6C15.4 13 15.2 12.8 15.2 12.6V8.9H13.8C13.6 8.9 13.4 8.7 13.4 8.5V7.9C13.4 7.7 13.6 7.5 13.8 7.5H16.8C17 7.5 17.2 7.7 17.2 7.9V12.6C17.2 12.8 17 13 16.8 13ZM12.7 12.6C12.7 12.8 12.5 13 12.3 13H10.8C10.6 13 10.4 12.8 10.4 12.6V7.9C10.4 7.7 10.6 7.5 10.8 7.5H12.3C12.5 7.5 12.7 7.7 12.7 7.9V12.6ZM9.8 13H7.3C7.1 13 6.9 12.8 6.9 12.6V7.9C6.9 7.7 7.1 7.5 7.3 7.5H8.7C8.9 7.5 9.1 7.7 9.1 7.9V11.2H9.8C10 11.2 10.2 11.4 10.2 11.6V12.6C10.2 12.8 10 13 9.8 13Z" />
            </svg>
        ),
        position: { x: "95%", y: "50%" },
    },
    {
        id: "voice",
        label: "Voice AI",
        color: "text-[#8B5CF6]",
        hex: "#8B5CF6",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        ),
        position: { x: "15%", y: "80%" },
    },
    {
        id: "sms",
        label: "SMS",
        color: "text-[#EAB308]",
        hex: "#EAB308",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        ),
        position: { x: "50%", y: "88%" },
    },
    {
        id: "web",
        label: "Web / Mobile",
        color: "text-[#F97316]",
        hex: "#F97316",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        position: { x: "85%", y: "80%" },
    }
];

export const CXOrchestratorVisual = () => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [showAndMore, setShowAndMore] = useState(false);

    React.useEffect(() => {
        const showDuration = 3000; // 3s visible
        const cycleInterval = 5000; // 5s repeat
        const initialDelay = 3000; // 3s before first show

        let intervalId: NodeJS.Timeout | undefined;

        // Wait 3s, then show first time
        const initialTimer = setTimeout(() => {
            setShowAndMore(true);
            setTimeout(() => setShowAndMore(false), showDuration);

            // Wait 5s after hide, then repeat (show 3s, wait 5s)
            intervalId = setInterval(() => {
                setShowAndMore(true);
                setTimeout(() => setShowAndMore(false), showDuration);
            }, showDuration + 5000); // 8s total cycle (3s show + 5s hidden)
        }, initialDelay);

        return () => {
            clearTimeout(initialTimer);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="relative w-full h-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center pointer-events-auto select-none">
            {/* Background Grid/Glow */}
            <div className="absolute inset-0 bg-zim-void/50 rounded-full blur-3xl scale-75 opacity-50 z-0" />

            {/* Neural Core (Vortex/Atom) */}
            <div className="relative z-20 w-48 h-48 flex items-center justify-center">
                {/* Core Glow */}
                <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />

                <motion.div
                    className="relative w-40 h-40 flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {/* Ring 1 - Outer Orbit */}
                    <div className="absolute inset-0 rounded-full border border-orange-500/30 border-t-white/80 border-b-transparent rotate-12" />

                    {/* Ring 2 - Middle Orbit */}
                    <div className="absolute inset-4 rounded-full border border-blue-500/20 border-r-orange-500/80 border-l-transparent -rotate-45" />

                    {/* Ring 3 - Inner Orbit */}
                    <div className="absolute inset-8 rounded-full border border-purple-500/20 border-t-orange-400/80 border-b-transparent rotate-90" />
                </motion.div>

                {/* Static Center Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-slate-900/40 backdrop-blur-sm border border-white/5 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(249,115,22,0.2)]">
                        {/* Genesys Logo */}
                        <img
                            src="/genesys-logo-reversed.png"
                            alt="Genesys"
                            className="w-20 h-20 object-contain relative z-10"
                        />
                    </div>
                </div>
            </div>

            {/* Connecting Lines & Data Packets */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                <defs>
                    <linearGradient id="gradient-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(96, 165, 250, 0)" />
                        <stop offset="50%" stopColor="rgba(45, 212, 191, 0.3)" />
                        <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
                    </linearGradient>
                </defs>
                {TOUCHPOINTS.map((tp) => {
                    const isHovered = hoveredId === tp.id;
                    return (
                        <g key={tp.id}>
                            {/* Line from center (50% 50%) to touchpoint position */}
                            <motion.line
                                x1="50%" y1="50%"
                                x2={tp.position.x} y2={tp.position.y}
                                stroke="url(#gradient-line)"
                                strokeWidth={isHovered ? 2 : 1.5}
                                strokeOpacity={isHovered ? 0.8 : 0.4}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />

                            {/* "Pulse" Packet on Hover - Sending Data to Core */}

                        </g>
                    );
                })}
                {/* Moving Data Packets REMOVED per user request ("weird colored dot") */}
                {/* 
                            <circle r="4" fill="#2DD4BF" className="filter blur-[1px]">
                                <animateMotion
                                    dur={`${2 + Math.random()}s`}
                                    repeatCount="indefinite"
                                    path={`M50% 50% L${tp.position.x} ${tp.position.y}`}
                                    keyPoints="1;0"
                                    keyTimes="0;1"
                                />
                            </circle>
                             */}

                {/* Pulse-on-Hover Packet (Rapid, Gradient Color) - Keep or Remove? User said "weird colored dot". 
                                Likely referred to the persistent ones. I'll remove the hover one too to be safe/clean.
                            */}
                {/*
                            {isHovered && (
                                <circle r="8" fill="url(#gradient-pulse)" className="filter blur-[2px]">
                                    <animateMotion
                                        dur="0.6s"
                                        repeatCount="indefinite"
                                        path={`M${tp.position.x} ${tp.position.y} L50% 50%`}
                                    />
                                </circle>
                            )}
                            */}

                {/* "And More" Orange Beam Visual - Looping */}
                <AnimatePresence>
                    {showAndMore && (
                        <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <defs>
                                <linearGradient id="gradient-beam-slim" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                                {/* 
                                    The Beam Path: Ultra-Slim "Electric" Thread.
                                    Stroke: 1px (Slimmer).
                                    Path: Leaves core (50,50), lands at DEEP LEFT (-22, 92).
                                */}
                                <motion.path
                                    d="M 50 50 C 30 55, -8 60, -18 92"
                                    fill="none"
                                    stroke="url(#gradient-beam-slim)"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    strokeDasharray="2 4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />

                                {/* High-speed particle for "electric" feel */}
                                <circle r="1" fill="#fff">
                                    <animateMotion
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                        path="M 50 50 C 30 55, -8 60, -18 92"
                                        keyPoints="0;1"
                                        keyTimes="0;1"
                                        calcMode="linear"
                                    />
                                </circle>

                                {/* Terminal Dot at (-18, 92) */}
                                <motion.circle
                                    cx="-18" cy="92" r="1.5" fill="#f97316"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1.5 }}
                                />
                            </svg>
                        </motion.g>
                    )}
                </AnimatePresence>
            </svg>

            {/* "And More..." Label */}
            <AnimatePresence>
                {showAndMore && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        // Text positioned at -25% (moved right from -28%), slight translate to fine-tune
                        // This should align 'M' of 'MORE' under beam tip at -18%
                        className="absolute left-[-25%] top-[94%] -translate-x-[-30%] z-40 flex flex-col items-center"
                    >
                        {/* 
                           Text Only + Electric Line Underlay ("be creative")
                        */}
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em] shadow-black drop-shadow-md whitespace-nowrap mb-1">
                                AND MORE
                            </span>
                            {/* Electric Line */}
                            <motion.div
                                className="h-[1px] bg-orange-500 shadow-[0_0_8px_#f97316]"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.5, delay: 1.8 }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Touchpoints */}

            {/* Touchpoints */}
            {
                TOUCHPOINTS.map((tp) => (
                    <div
                        key={tp.id}
                        className="absolute z-30 group"
                        style={{ left: tp.position.x, top: tp.position.y }}
                        onMouseEnter={() => setHoveredId(tp.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                            {/* Icon Circle */}
                            <div
                                className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                                    hoveredId === tp.id ? "scale-110" : ""
                                )}
                            >
                                <div className={cn("transition-colors duration-300", hoveredId === tp.id ? tp.color : "text-slate-400")}>
                                    {/* Render Image if available, else render Icon */}
                                    {tp.image ? (
                                        <img
                                            src={tp.image}
                                            alt={tp.label}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        tp.icon
                                    )}
                                </div>
                            </div>

                            {/* Label */}
                            <div className={cn(
                                "absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-slate-400 whitespace-nowrap transition-colors duration-300",
                                hoveredId === tp.id ? "text-white" : ""
                            )}>
                                {tp.label}
                            </div>
                        </div>
                    </div>
                ))
            }
        </div >
    );
};
