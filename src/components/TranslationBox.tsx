"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { Globe, Languages, MousePointer2, Check } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Visual & Animation Constants ---
const MORPH_DURATION = 0.8;

// --- Mock Data ---
interface Message {
    id: string;
    role: 'customer' | 'agent';
    thai: string;
    english: string;
}

const CONVERSATION: Message[] = [
    {
        id: 'msg-1',
        role: 'customer',
        thai: "สวัสดีครับ สินค้าของฉันอยู่ที่ไหนครับ? มันควรจะถึงแล้ว",
        english: "Hello. Where is my cargo? It should have arrived by now."
    },
    {
        id: 'msg-2',
        role: 'agent',
        thai: "สวัสดีครับ ขอทราบหมายเลขการจองด้วยครับ",
        english: "Hello. May I have your booking number, please?"
    },
    {
        id: 'msg-3',
        role: 'customer',
        thai: "ซิม-ยู 2938 ครับ",
        english: "It is ZIMU-2938."
    },
    {
        id: 'msg-4',
        role: 'agent',
        thai: "ขอบคุณครับ ตรวจสอบแล้ว เรือจะเข้าเทียบท่าพรุ่งนี้เวลา 10:00 น.",
        english: "Thank you. Verified. The vessel docks tomorrow at 10:00 AM."
    },
    {
        id: 'msg-5',
        role: 'customer',
        thai: "เยี่ยมมาก! ขอบคุณสำหรับความช่วยเหลือ",
        english: "Great! Thank you for the assistance."
    }
];

// --- Sub-components ---

// 1. Ghost Cursor (Controlled by Parent via Variants)
const GhostCursor = ({ variants, animate, initial }: { variants: Variants, animate: any, initial: any }) => {
    return (
        <motion.div
            variants={variants}
            initial={initial}
            animate={animate}
            className="absolute z-50 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
            style={{ filter: "drop-shadow(0px 0px 10px rgba(255, 165, 0, 0.5))" }}
        >
            <MousePointer2 className="text-orange-500 fill-orange-500/20" size={24} />
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute -top-2 -left-2 w-12 h-12 bg-white/30 rounded-full blur-md"
            />
        </motion.div>
    );
};

// 2. Chat Bubble with Text Morph
const MessageBubble = ({ message, isTranslated, delay }: { message: Message, isTranslated: boolean, delay: number }) => {
    return (
        <div className={`flex w-full mb-3 ${message.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative max-w-[85%] p-3 rounded-xl backdrop-blur-md shadow-sm border ${message.role === 'customer'
                ? 'bg-slate-800/80 text-slate-200 border-slate-700/50 rounded-tl-sm'
                : 'bg-orange-950/30 text-orange-100 border-orange-500/20 rounded-tr-sm'
                }`}>
                {/* Header/Label */}
                <div className="flex justify-between items-center mb-1 opacity-50 text-[9px] uppercase tracking-wider">
                    <span>{message.role === 'customer' ? 'Customer' : 'Agent'}</span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={isTranslated ? 'en' : 'th'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                        >
                            {isTranslated ? 'EN' : 'TH'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Text Content */}
                <div className="relative overflow-hidden min-h-[1.4em] text-sm leading-relaxed">
                    {/* 1. Thai Text */}
                    <motion.div
                        initial={{ opacity: 1, filter: "blur(0px)" }}
                        animate={{
                            opacity: isTranslated ? 0 : 1,
                            filter: isTranslated ? "blur(8px)" : "blur(0px)",
                            y: isTranslated ? -10 : 0
                        }}
                        transition={{ duration: MORPH_DURATION, delay, ease: "easeInOut" }}
                        className="absolute inset-0 origin-left whitespace-nowrap md:whitespace-normal"
                    >
                        {message.thai}
                    </motion.div>

                    {/* 2. English Text */}
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(8px)", y: 10 }}
                        animate={{
                            opacity: isTranslated ? 1 : 0,
                            filter: isTranslated ? "blur(0px)" : "blur(8px)",
                            y: isTranslated ? 0 : 10
                        }}
                        transition={{ duration: MORPH_DURATION, delay, ease: "easeInOut" }}
                        className="relative"
                    >
                        {message.english}
                    </motion.div>
                </div>

                {/* Glow effect when translated */}
                {isTranslated && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ duration: 1, delay: delay, times: [0, 0.2, 1] }}
                        className="absolute inset-0 rounded-xl bg-orange-500/20 pointer-events-none"
                    />
                )}
            </div>
        </div>
    );
};


// --- Main Component ---

type SimulationPhase = 'idle' | 'aiming' | 'clicking' | 'translating' | 'cooldown';

export const TranslationBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<SimulationPhase>('idle');

    // Controls
    const cursorControls = useAnimation();
    const scanlineControls = useAnimation();

    // Timer Refs (for robust cleanup)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // -- Cursor Variants --
    const cursorVariants: Variants = {
        idle: { x: 200, y: 300, opacity: 0, scale: 1 },
        aiming: {
            top: "6%", left: "85%", x: 0, y: 0, opacity: 1, scale: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
        },
        clicking: {
            scale: [1, 0.8, 1],
            transition: { duration: 0.3, times: [0, 0.5, 1] }
        },
        fadeout: { opacity: 0, transition: { duration: 0.5, delay: 0.2 } }
    };

    // -- Clean up timers on unmount/state change --
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // -- Phase Logic Chain --

    // 1. IDLE / RESET
    useEffect(() => {
        if (state === 'idle') {
            setPhase('idle');
            cursorControls.set("idle");
            scanlineControls.set({ top: "-20%", opacity: 0 });
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else if (state === 'paused') {
            // Stop animations in place
            cursorControls.stop();
            scanlineControls.stop();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else if (state === 'playing') {
            // If we just transitioned to playing from idle, kick off Aiming
            if (phase === 'idle') {
                setPhase('aiming');
            } else if (phase === 'cooldown') {
                // Resumed during cooldown, ensure timer is running
                // Simplification: Just let the effect below handle it or restart cooldown
                setPhase('cooldown'); // Re-trigger effect
            } else {
                // Resuming mid-animation:
                // Framer motions 'start' will likely continue from current if parameters match, 
                // BUT 'stop' might have killed it. better to re-issue the command for current phase.
                // This acts as a 'resume' signal for the effects below.
            }
        }
    }, [state, phase]);

    // 2. AIMING
    useEffect(() => {
        if (state === 'playing' && phase === 'aiming') {
            cursorControls.start("aiming").then(() => {
                if (state === 'playing') setPhase('clicking');
            });
        }
    }, [state, phase, cursorControls]);

    // 3. CLICKING
    useEffect(() => {
        if (state === 'playing' && phase === 'clicking') {
            cursorControls.start("clicking").then(() => {
                if (state === 'playing') setPhase('translating');
            });
        }
    }, [state, phase, cursorControls]);

    // 4. TRANSLATING
    useEffect(() => {
        if (state === 'playing' && phase === 'translating') {
            // Fade out cursor
            cursorControls.start("fadeout");

            // Scanline
            scanlineControls.start({
                top: ["0%", "150%"],
                opacity: [0, 1, 1, 0],
                transition: { duration: 2.5, ease: "easeInOut" }
            }).then(() => {
                if (state === 'playing') setPhase('cooldown');
            });
        }
    }, [state, phase, cursorControls, scanlineControls]);

    // 5. COOLDOWN / LOOP
    useEffect(() => {
        if (state === 'playing' && phase === 'cooldown') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                if (state === 'playing') {
                    // LOOP: Reset
                    setPhase('idle');
                    // Wait a tick for renders to flush 'idle' visuals? 
                    // Phase change 'idle' -> 'aiming' happens in state effect above or we force it here
                    // Ideally: Set idle, then immediately set aiming? 
                    // Better: Set idle. The state effect detects playing+idle => aiming.
                }
            }, 5000);
        }
    }, [state, phase]);


    // Derived state for visuals
    const isTranslated = phase === 'translating' || phase === 'cooldown';

    return (
        <ClientOnly>
            {/* Main Container */}
            <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-slate-950 flex flex-col overflow-hidden border border-slate-800">
                {/* Background Decoration */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-black pointer-events-none" />

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                <div className="flex-1 flex flex-col relative z-0">

                    {/* Header */}
                    <div className="h-14 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Globe size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Global Connect</span>
                        </div>

                        {/* The Trigger Button */}
                        <motion.button
                            className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${isTranslated
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isTranslated ? <Check size={14} /> : <Languages size={14} />}
                            <span className="text-xs font-bold">
                                {isTranslated ? 'Translated' : 'Translate'}
                            </span>

                            {isTranslated && (
                                <motion.div
                                    layoutId="glow"
                                    className="absolute inset-0 rounded-lg bg-emerald-400/20 blur-md -z-10"
                                />
                            )}
                        </motion.button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative custom-scrollbar">
                        {CONVERSATION.map((msg, idx) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isTranslated={isTranslated}
                                delay={idx * 0.15 + 0.2}
                            />
                        ))}

                        <div className="h-8" />
                    </div>

                    {/* --- EFFECTS LAYER --- */}

                    {/* 1. Ghost Cursor */}
                    <AnimatePresence>
                        {state !== 'idle' && phase !== 'cooldown' && (
                            <GhostCursor
                                variants={cursorVariants}
                                initial="idle"
                                animate={cursorControls}
                            />
                        )}
                    </AnimatePresence>

                    {/* 2. Scanline */}
                    <motion.div
                        animate={scanlineControls}
                        className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-40 blur-[2px]"
                        style={{
                            boxShadow: "0 0 20px 2px rgba(34, 211, 238, 0.4)",
                            top: "-20%"
                        }}
                    />

                    <motion.div
                        animate={scanlineControls}
                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent z-30 pointer-events-none"
                        style={{ top: "-20%" }}
                    />

                </div>
            </div>
        </ClientOnly>
    );
};
