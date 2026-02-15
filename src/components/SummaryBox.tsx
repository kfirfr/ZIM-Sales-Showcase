"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { Phone, Mic, Database, Check, Bot, User, Headphones, Sparkles } from 'lucide-react';
import CallPlayerModal from './CallPlayerModal';

// --- Types ---
type Phase = 'idle' | 'dialing' | 'interview' | 'processing' | 'crm_update';

interface ChatLine {
    role: 'ai' | 'user';
    text: string;
}

// --- Data ---
const TRANSCRIPT: ChatLine[] = [
    { role: 'ai', text: "Hi David. I see you just left Nike HQ. Is this about the Q4 Logistics Contract?" },
    { role: 'user', text: "Yes, they want a discount on the Asia-Pacific route." },
    { role: 'ai', text: "Got it. Did they mention a specific volume?" },
    { role: 'user', text: "500 TEUs per month." },
];

const ENTITIES = ["Nike", "Q4 Logistics", "500 TEUs", "Asia-Pacific"];

const CRM_FIELDS = [
    { label: "Account", value: "Nike" },
    { label: "Opportunity", value: "Q4 Logistics Contract" },
    { label: "Volume", value: "500 TEUs / month" },
    { label: "Route", value: "Asia-Pacific" },
];

// --- Component ---
export const PostMeetingAutopilotBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
    const [currentTyping, setCurrentTyping] = useState("");
    const [typingRole, setTypingRole] = useState<'ai' | 'user' | null>(null);
    const [visibleEntities, setVisibleEntities] = useState<string[]>([]);
    const [visibleCrmFields, setVisibleCrmFields] = useState<number>(0);
    const [crmSuccess, setCrmSuccess] = useState(false);
    const [processingText, setProcessingText] = useState("");
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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

    const typeMessage = async (text: string, role: 'ai' | 'user') => {
        setTypingRole(role);
        const words = text.split(" ");
        let current = "";
        for (const word of words) {
            await waitForPlay();
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            current += (current ? " " : "") + word;
            setCurrentTyping(current);
            await wait(role === 'ai' ? 120 : 80);
        }
        // Commit finished message to chat log
        setChatMessages(prev => [...prev, { role, text }]);
        setCurrentTyping("");
        setTypingRole(null);
        await wait(400);
    };

    // --- Reset State ---
    const resetAll = () => {
        setPhase('idle');
        setChatMessages([]);
        setCurrentTyping("");
        setTypingRole(null);
        setVisibleEntities([]);
        setVisibleCrmFields(0);
        setCrmSuccess(false);
        setProcessingText("");
    };

    // --- Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            resetAll();
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // === PHASE 1: DIALING ===
                        resetAll();
                        setPhase('dialing');
                        await wait(2500);

                        // === PHASE 2: INTERVIEW ===
                        await waitForPlay();
                        setPhase('interview');
                        setChatMessages([]);
                        setCurrentTyping("");
                        for (const line of TRANSCRIPT) {
                            await waitForPlay();
                            await typeMessage(line.text, line.role);
                        }
                        await wait(800);

                        // === PHASE 3: PROCESSING ===
                        await waitForPlay();
                        setPhase('processing');
                        setProcessingText("Analyzing Conversation...");
                        await wait(1500);
                        setProcessingText("Extracting Entities...");
                        await wait(500);
                        for (const entity of ENTITIES) {
                            await waitForPlay();
                            setVisibleEntities(prev => [...prev, entity]);
                            await wait(600);
                        }
                        await wait(800);

                        // === PHASE 4: CRM UPDATE ===
                        await waitForPlay();
                        setPhase('crm_update');
                        setVisibleCrmFields(0);
                        setCrmSuccess(false);
                        await wait(400);
                        for (let i = 0; i < CRM_FIELDS.length; i++) {
                            await waitForPlay();
                            setVisibleCrmFields(i + 1);
                            await wait(500);
                        }
                        await wait(300);
                        setCrmSuccess(true);
                        await wait(5000); // Hold success

                        // Reset for next loop
                        setVisibleEntities([]);
                        setVisibleCrmFields(0);
                        setCrmSuccess(false);
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

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">

                {/* Play Recording Trigger */}
                <button
                    onClick={() => setIsPlayerOpen(true)}
                    className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all text-xs font-medium group"
                    aria-label="Experience Voice AI Interactive Demo"
                >
                    <Sparkles size={14} className="group-hover:text-cyan-400 transition-colors" />
                    <span>Experience Voice AI</span>
                </button>

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-0 mr-4"
                />

                <AnimatePresence mode="wait">

                    {/* === IDLE STATE === */}
                    {state === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                <Phone size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Ready to Dictate</p>
                        </motion.div>
                    )}

                    {/* === DIALING STATE === */}
                    {state !== 'idle' && phase === 'dialing' && (
                        <motion.div
                            key="dialing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-6"
                        >
                            {/* Pulsing Phone Icon */}
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]"
                                >
                                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                                        <Phone size={28} className="text-emerald-400" />
                                    </div>
                                </motion.div>
                                {/* Expanding ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                                    animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-full border border-emerald-400/20"
                                    animate={{ scale: [1, 2.8], opacity: [0.4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.3 }}
                                />
                            </div>
                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="text-emerald-400 text-lg font-semibold tracking-wide"
                            >
                                Calling Genesys AI...
                            </motion.p>
                        </motion.div>
                    )}

                    {/* === INTERVIEW STATE === */}
                    {state !== 'idle' && phase === 'interview' && (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-md flex flex-col px-5 py-4 gap-2"
                        >
                            {/* Audio wave bar at top */}
                            <div className="flex items-center justify-center gap-1 mb-3 h-6">
                                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 16 + Math.random() * 8, 4] }}
                                        transition={{ repeat: Infinity, duration: 0.6 + i * 0.08, ease: "easeInOut" }}
                                        className="w-1 bg-emerald-500/60 rounded-full"
                                    />
                                ))}
                                <span className="ml-3 text-[10px] text-emerald-400/70 font-mono uppercase tracking-widest">Live</span>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex flex-col gap-2.5 overflow-hidden max-h-[280px]">
                                {chatMessages.map((msg, i) => (
                                    <ChatBubble key={`committed-${i}`} role={msg.role} text={msg.text} />
                                ))}
                                {/* Currently typing message */}
                                {typingRole && currentTyping && (
                                    <ChatBubble role={typingRole} text={currentTyping} isTyping />
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* === PROCESSING STATE === */}
                    {state !== 'idle' && phase === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            {/* Spinner */}
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                            </div>

                            {/* Processing text */}
                            <p className="text-emerald-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                                {processingText}
                            </p>

                            {/* Entity Chips */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                                <AnimatePresence>
                                    {visibleEntities.map((entity, i) => (
                                        <motion.span
                                            key={entity}
                                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                            className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-semibold tracking-wide"
                                        >
                                            {entity}
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* === CRM UPDATE STATE === */}
                    {state !== 'idle' && phase === 'crm_update' && (
                        <motion.div
                            key="crm-card"
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="w-full max-w-sm mx-auto"
                        >
                            <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                                {/* CRM Header */}
                                <div className="bg-[#002050] text-white px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-blue-300" />
                                        <span className="font-semibold text-sm">Dynamics 365</span>
                                    </div>
                                    <AnimatePresence>
                                        {crmSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-[10px] text-green-300 font-bold uppercase tracking-wider"
                                            >
                                                <Check size={10} /> Updated
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* CRM Fields */}
                                <div className="p-4 space-y-3">
                                    {CRM_FIELDS.map((field, i) => (
                                        <motion.div
                                            key={field.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={i < visibleCrmFields ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="flex items-baseline gap-3"
                                        >
                                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider w-24 shrink-0">
                                                {field.label}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {field.value}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Success checkmark bar */}
                                <AnimatePresence>
                                    {crmSuccess && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="border-t border-slate-100 px-4 py-3 flex items-center gap-2"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.15 }}
                                                className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"
                                            >
                                                <Check size={12} className="text-emerald-600" />
                                            </motion.div>
                                            <span className="text-xs font-semibold text-slate-600">CRM record updated automatically</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                <CallPlayerModal
                    isOpen={isPlayerOpen}
                    onClose={() => setIsPlayerOpen(false)}
                />
            </div>
        </ClientOnly>
    );
};

// --- Chat Bubble Sub-Component ---
const ChatBubble: React.FC<{ role: 'ai' | 'user'; text: string; isTyping?: boolean }> = ({ role, text, isTyping }) => {
    const isAI = role === 'ai';
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
        >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAI
                ? 'bg-emerald-500/20 border border-emerald-500/40'
                : 'bg-blue-500/20 border border-blue-500/40'
                }`}>
                {isAI ? <Bot size={14} className="text-emerald-400" /> : <User size={14} className="text-blue-400" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isAI
                ? 'bg-slate-800/90 text-slate-200 rounded-tl-sm border border-slate-700/50'
                : 'bg-blue-600/20 text-blue-100 rounded-tr-sm border border-blue-500/20'
                }`}>
                {text}
                {isTyping && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="inline-block ml-0.5 w-[2px] h-[14px] bg-current align-middle"
                    />
                )}
            </div>
        </motion.div>
    );
};
