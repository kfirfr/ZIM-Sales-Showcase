"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Sparkles, Send, User, ChevronRight, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Types ---
type Step = 'idle' | 'customer_typing' | 'analyzing' | 'suggestion_ready' | 'agent_review' | 'resolving' | 'resolved';

interface Message {
    id: string;
    role: 'customer' | 'agent';
    text: string;
}

const KNOWLEDGE_ARTICLES = [
    { id: 'kb1', title: 'HazMat Handling (Class 3)', category: 'Safety Protocol', match: 98, summary: "Flammable liquids requires DG-404 declaration 24h prior. distinct labeling required." },
    { id: 'kb2', title: 'Restricted Cargo List', category: 'Compliance', match: 45, summary: "General list of restricted items for trans-pacific routes." },
];

export const KnowledgeAIBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [step, setStep] = useState<Step>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [agentInput, setAgentInput] = useState("");

    // Refs for safe async loop access
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);

    // --- Robust Wait Logic ---
    const wait = async (ms: number) => {
        let passed = 0;
        while (passed < ms) {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            if (stateRef.current === 'playing') passed += 100;
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const waitForPlay = async () => {
        while (stateRef.current !== 'playing') {
            if (stateRef.current === 'idle') throw new Error("STOPPED");
            await new Promise(r => setTimeout(r, 100));
        }
    };

    const reset = () => {
        setStep('idle');
        setMessages([]);
        setShowSuggestion(false);
        setAgentInput("");
    };

    // --- Main Simulation Loop ---
    useEffect(() => {
        if (state === 'idle') {
            reset();
            return;
        }

        if (state === 'playing' && !isLoopingRef.current) {
            isLoopingRef.current = true;

            const loop = async () => {
                try {
                    while (true) {
                        if (stateRef.current === 'idle') break;

                        // 1. Reset for new loop
                        reset();
                        await wait(500);

                        // 2. Customer typing
                        await waitForPlay();
                        setStep('customer_typing');
                        await wait(1000);

                        // 3. Customer message arrives
                        await waitForPlay();
                        setMessages([{ id: 'm1', role: 'customer', text: "We have a shipment of industrial solvents (Class 3). What documents do I need?" }]);
                        setStep('analyzing');

                        // 4. AI analyzing
                        await waitForPlay();
                        await wait(1500);

                        // 5. Suggestion ready
                        await waitForPlay();
                        setStep('suggestion_ready');
                        setShowSuggestion(true);
                        await wait(1500);

                        // 6. Agent review (hovering)
                        await waitForPlay();
                        setStep('agent_review');
                        await wait(1000);

                        // 7. Agent using answer
                        await waitForPlay();
                        setStep('resolving');
                        const answer = "For Class 3 Flammable Liquids, you'll need to submit the DG-404 declaration 24 hours before the cut-off time. Please ensure packages have the red diamond labels.";
                        setAgentInput(answer);
                        await wait(1500);

                        // 8. Send message
                        await waitForPlay();
                        setMessages(prev => [...prev, { id: 'm2', role: 'agent', text: answer }]);
                        setAgentInput("");
                        setStep('resolved');

                        // 9. Show result before looping
                        await waitForPlay();
                        await wait(3000);
                    }
                } catch (e) {
                    if (e instanceof Error && e.message === "STOPPED") {
                        // Clean exit
                    } else {
                        console.error(e);
                    }
                } finally {
                    isLoopingRef.current = false;
                }
            };
            loop();
        }
    }, [state]);

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[500px] bg-slate-950 flex flex-col overflow-hidden border border-indigo-500/20 font-sans">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                <div className="flex-1 flex overflow-hidden relative z-10">

                    {/* LEFT PANE: Chat Interface */}
                    <div className="flex-1 flex flex-col border-r border-indigo-500/10 bg-slate-900/30">
                        {/* Chat Header */}
                        <div className="h-12 border-b border-indigo-500/10 flex items-center px-4 justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold">
                                    JD
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-200">Kfir</div>
                                    <div className="text-[10px] text-slate-400">Logistics Manager</div>
                                </div>
                            </div>
                            <div className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded border border-indigo-500/20">
                                Ticket #8992
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'customer'
                                        ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                                        : 'bg-indigo-600 text-white rounded-tr-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {step === 'customer_typing' && (
                                <div className="flex items-center gap-1 ml-2">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-indigo-500/10 bg-slate-900/50">
                            <div className="relative">
                                <input
                                    disabled
                                    value={agentInput}
                                    placeholder="Type a message..."
                                    className="w-full bg-slate-950 border border-slate-700/50 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-md text-white opacity-50">
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANE: Contextual Compass (Knowledge) */}
                    <div className="w-[340px] flex flex-col bg-slate-950/50 backdrop-blur-sm">
                        {/* Header */}
                        <div className="h-12 border-b border-indigo-500/10 flex items-center px-4 gap-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Smart Assist</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col gap-4">

                            {/* Analyzing State */}
                            {step === 'analyzing' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="relative w-12 h-12 mb-4">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Search size={16} className="text-indigo-400" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">Analyzing conversation context...</p>
                                </motion.div>
                            )}

                            {/* Suggestion Card */}
                            <AnimatePresence>
                                {(step === 'suggestion_ready' || step === 'agent_review' || step === 'resolving' || step === 'resolved') && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="relative group"
                                    >
                                        <div className={`
                                            absolute inset-0 bg-indigo-500/20 blur-xl rounded-xl transition-opacity duration-500
                                            ${step === 'agent_review' ? 'opacity-100' : 'opacity-0'}
                                         `} />

                                        <div className="relative bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-xl hover:border-indigo-400/50 transition-colors">
                                            {/* Badge */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={14} className="text-indigo-400" />
                                                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                                        REL 98%
                                                    </span>
                                                </div>
                                                <ExternalLink size={12} className="text-slate-500 hover:text-indigo-400 cursor-pointer" />
                                            </div>

                                            {/* Title */}
                                            <h4 className="text-sm font-bold text-white mb-2">SOP: DG - Flammable Liquids</h4>

                                            {/* Summary */}
                                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                                "For Class 3 shipments, DG-404 must be filed 24h pre-cutoff. Packaging requires red diamond labels and proper ventilation."
                                            </p>

                                            {/* Action */}
                                            <button className={`
                                                w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300
                                                ${step === 'agent_review' || step === 'resolving'
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                                             `}>
                                                {step === 'resolving' ? (
                                                    <>Generating Response...</>
                                                ) : (
                                                    <>
                                                        <ArrowRight size={12} />
                                                        Use Answer
                                                    </>
                                                )}
                                            </button>

                                            {/* Pointer simulating agent cursor */}
                                            {(step === 'agent_review' || step === 'resolving') && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: 20, y: 20 }}
                                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                                    className="absolute bottom-2 right-12 pointer-events-none"
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19135L11.7841 12.3673H5.65376Z" fill="white" stroke="black" strokeWidth="1" />
                                                    </svg>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Secondary Suggestion (Faded) */}
                            {(step === 'suggestion_ready' || step === 'agent_review') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 0.4, y: 0 }}
                                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 grayscale"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen size={14} className="text-slate-400" />
                                        <div className="h-3 w-16 bg-slate-700/50 rounded" />
                                    </div>
                                    <div className="h-3 w-3/4 bg-slate-700/50 rounded mb-2" />
                                    <div className="h-3 w-1/2 bg-slate-700/50 rounded" />
                                </motion.div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </ClientOnly>
    );
};
