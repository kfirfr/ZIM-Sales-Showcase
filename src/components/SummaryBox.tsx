"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, ArrowRight, Mic, X } from 'lucide-react';

// --- Types ---
type SimulationState = 'IDLE' | 'INTERVIEW' | 'PROCESSING' | 'CRM_INJECTION';

interface Message {
    id: string;
    role: 'ai' | 'user';
    text: string;
}

// --- Components ---

const ControlBar = ({
    isPlaying,
    isPaused,
    onPlayPause,
    onReset
}: {
    isPlaying: boolean;
    isPaused: boolean;
    onPlayPause: () => void;
    onReset: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/40 backdrop-blur-md rounded-full p-1.5 border border-white/10 z-50 pointer-events-auto"
    >
        <button
            onClick={onPlayPause}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title={isPaused ? "Resume" : "Pause"}
        >
            {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
        <button
            onClick={onReset}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Reset"
        >
            <RotateCcw size={16} />
        </button>
    </motion.div>
);

const WaveformVisual = () => (
    <div className="flex items-center justify-center gap-1 h-12">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="w-1.5 bg-[#FF4F1F] rounded-full"
                animate={{
                    height: [12, 32, 12],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                }}
            />
        ))}
    </div>
);

// --- Main Component ---
export const PostMeetingAutopilotBox = () => {
    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [simState, setSimState] = useState<SimulationState>('IDLE');
    const [turnIndex, setTurnIndex] = useState(0);
    const [transcript, setTranscript] = useState<Message[]>([]);

    // Refs for pausing logic
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const stateRef = useRef({ simState, turnIndex, transcript });

    // Sync refs
    useEffect(() => {
        stateRef.current = { simState, turnIndex, transcript };
    }, [simState, turnIndex, transcript]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // --- Logic ---

    const startSimulation = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setSimState('INTERVIEW');
        setTurnIndex(0);
        setTranscript([]);

        // Start the flow
        processTurn(0);
    };

    const processTurn = (turn: number) => {
        // Initial AI Message
        const dialogue = [
            {
                ai: "Welcome back, Alex. I detected you just left the 'Nike Renewal' meeting. How did it go overall?",
                options: [
                    { label: "It was intense. They're pushing back on rates.", next: "rates" }
                ]
            },
            {
                ai: "Understood. Specific competitors or budget?",
                options: [
                    { label: "Mainly Maersk. 10% lower spot rate.", next: "comp" }
                ]
            },
            {
                ai: "Got it. Final sentiment & next steps?",
                options: [
                    { label: "Review fuel surcharges. Proposal due Friday.", next: "next" }
                ]
            }
        ];

        if (turn < dialogue.length) {
            // Add AI message
            const currentTurn = dialogue[turn];
            setTranscript(prev => [...prev, { id: `ai-${turn}`, role: 'ai', text: currentTurn.ai }]);

            // Wait for user interaction (simulated here as we need controls)
            // But requirement says "User clicks". So we wait for user click.
        } else {
            // End of dialogue -> Processing
            setSimState('PROCESSING');
            timerRef.current = setTimeout(() => {
                setSimState('CRM_INJECTION');
            }, 2500); // 2.5s for processing animation
        }
    };

    const handleUserChoice = (text: string) => {
        if (isPaused) return;

        // Add User message
        setTranscript(prev => [...prev, { id: `user-${turnIndex}`, role: 'user', text }]);

        // Advance turn
        const nextTurn = turnIndex + 1;
        setTurnIndex(nextTurn);

        // Small delay before AI responds
        timerRef.current = setTimeout(() => {
            processTurn(nextTurn);
        }, 800);
    };

    const handlePauseToggle = () => {
        if (isPaused) {
            // Resume
            setIsPaused(false);
            // Logic to resume timers would be complex, simplified here:
            // If in processing, we'd need to restart the timeout. 
            // For this demo, let's just allow pause to block interactions and state transitions.
            if (simState === 'PROCESSING') {
                timerRef.current = setTimeout(() => {
                    setSimState('CRM_INJECTION');
                }, 2500);
            }
        } else {
            // Pause
            setIsPaused(true);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setSimState('IDLE');
        setTurnIndex(0);
        setTranscript([]);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    // --- Render Helpers ---

    return (
        <div className="w-full h-[500px] flex items-center justify-center relative overflow-hidden bg-slate-900 rounded-xl border border-slate-800/50 group select-none">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950" />

            {/* Controls */}
            {isPlaying && (
                <ControlBar
                    isPlaying={isPlaying}
                    isPaused={isPaused}
                    onPlayPause={handlePauseToggle}
                    onReset={handleReset}
                />
            )}

            {/* Play Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startSimulation}
                            className="group relative flex items-center gap-3 px-8 py-4 bg-[#FF4F1F] text-white rounded-full font-bold text-lg shadow-[0_0_40px_-10px_#FF4F1F]"
                        >
                            <Play fill="currentColor" size={24} />
                            PLAY SIMULATION
                        </motion.button>
                        <div className="absolute inset-0 z-[-1]">
                            <WaveformVisual />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Stage */}
            <div className={`relative w-full h-full p-6 flex flex-col transition-all duration-500 ${!isPlaying ? 'blur-sm scale-95 opacity-50' : 'blur-0 scale-100 opacity-100'}`}>

                {simState === 'INTERVIEW' && (
                    <div className="flex flex-col h-full max-w-lg mx-auto w-full">
                        {/* Header */}
                        <div className="flex items-center justify-center mb-8 pt-8">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shadow-lg relative">
                                <div className="absolute inset-0 rounded-full border border-[#FF4F1F]/30 animate-ping opacity-20" />
                                <WaveformVisual />
                            </div>
                        </div>

                        {/* Transcript */}
                        <div className="flex-1 space-y-4 overflow-hidden relative">
                            <AnimatePresence mode="popLayout">
                                {transcript.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20, x: msg.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-slate-800 text-slate-200 rounded-tr-none'
                                                : 'bg-[#FF4F1F]/10 text-[#FF4F1F] border border-[#FF4F1F]/20 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* User Inputs */}
                        <div className="h-32 pt-6">
                            <AnimatePresence mode="wait">
                                {turnIndex === 0 && transcript.length > 0 && transcript[transcript.length - 1].role === 'ai' && (
                                    <motion.button
                                        key="opt1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        onClick={() => handleUserChoice("It was intense. They're pushing back on rates.")}
                                        className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border-l-4 border-[#FF4F1F] rounded-r-lg text-left text-sm text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md"
                                        disabled={isPaused}
                                    >
                                        It was intense. They're pushing back on rates.
                                    </motion.button>
                                )}
                                {turnIndex === 1 && transcript.length > 0 && transcript[transcript.length - 1].role === 'ai' && (
                                    <motion.button
                                        key="opt2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        onClick={() => handleUserChoice("Mainly Maersk. 10% lower spot rate.")}
                                        className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border-l-4 border-[#FF4F1F] rounded-r-lg text-left text-sm text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md"
                                        disabled={isPaused}
                                    >
                                        Mainly Maersk. 10% lower spot rate.
                                    </motion.button>
                                )}
                                {turnIndex === 2 && transcript.length > 0 && transcript[transcript.length - 1].role === 'ai' && (
                                    <motion.button
                                        key="opt3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        onClick={() => handleUserChoice("Review fuel surcharges. Proposal due Friday.")}
                                        className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border-l-4 border-[#FF4F1F] rounded-r-lg text-left text-sm text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md"
                                        disabled={isPaused}
                                    >
                                        Review fuel surcharges. Proposal due Friday.
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {simState === 'PROCESSING' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <motion.div
                                className="w-20 h-20 bg-[#FF4F1F] rounded-2xl flex items-center justify-center shadow-[0_0_50px_-10px_#FF4F1F] z-10 relative"
                                animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles className="text-white w-10 h-10" />
                            </motion.div>

                            {/* Particles */}
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute inset-0 bg-[#FF4F1F] rounded-full w-2 h-2"
                                    initial={{ x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 200,
                                        y: (Math.random() - 0.5) * 200,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
                                />
                            ))}
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 text-[#FF4F1F] font-mono tracking-widest text-sm"
                        >
                            GENERATING CRM RECORD...
                        </motion.p>
                    </motion.div>
                )}

                {simState === 'CRM_INJECTION' && (
                    <motion.div
                        className="w-full h-full flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl">
                            {/* CRM Header */}
                            <div className="bg-[#002050] p-4 flex items-center justify-between">
                                <span className="font-bold text-white text-xs tracking-wider">DYNAMICS 365</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-slate-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-slate-500/50" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-slate-50 space-y-6">
                                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold">
                                            NI
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Nike International</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">Opportunity: Global Renewal</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
                                        Active
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-400 font-bold">Competitor</label>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="text-sm font-medium text-slate-700"
                                            >
                                                Maersk
                                            </motion.div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-slate-400 font-bold">Pain Point</label>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.8 }}
                                                className="text-sm font-medium text-slate-700"
                                            >
                                                Spot Rate Pricing
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-slate-400 font-bold">Action Item</label>
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "100%", opacity: 1 }}
                                            transition={{ delay: 1.2, duration: 0.8 }}
                                            className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900 overflow-hidden whitespace-nowrap"
                                        >
                                            Prepare fuel surcharge proposal by Friday
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Success Toast */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 2, type: 'spring' }}
                                    className="flex items-center gap-2 text-green-600 text-xs font-bold justify-end pt-2"
                                >
                                    <CheckCircle2 size={14} />
                                    SAVED TO CLOUD
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
