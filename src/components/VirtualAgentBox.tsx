"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, MapPin, Navigation, Search, Brain, Loader2 } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Types ---

type BotStatus = 'idle' | 'listening' | 'analyzing' | 'searching' | 'typing' | 'sent';

interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    text: string;
    attachment?: React.ReactNode;
}

interface ScenarioStep {
    action: 'message' | 'status' | 'wait';
    role?: 'bot' | 'user';
    text?: string;
    status?: BotStatus;
    duration?: number; // For wait or typing duration
    component?: 'map';
}

// --- Scenario Definition ---

// 1. User: "I need to return a container..."
// 2. Status: Analyzing -> Searching
// 3. Bot: "Gate 4 open..."
// 4. User: "Yes please."
// 5. Bot: Map Card.

const SCENARIO: ScenarioStep[] = [
    { action: 'status', status: 'listening', duration: 500 },
    { action: 'message', role: 'user', text: "I need to return a container, but the port is closed.", duration: 1000 },
    { action: 'status', status: 'analyzing', duration: 1500 },
    { action: 'status', status: 'searching', duration: 2000 },
    { action: 'status', status: 'typing', duration: 1500 },
    { action: 'message', role: 'bot', text: "I can help with that. According to the Port Schedule, Gate 4 remains open for empties until 20:00. Would you like the directions?", duration: 1000 },
    { action: 'status', status: 'listening', duration: 1000 },
    { action: 'message', role: 'user', text: "Yes, please.", duration: 1000 },
    { action: 'status', status: 'analyzing', duration: 800 },
    { action: 'status', status: 'typing', duration: 1000 },
    { action: 'message', role: 'bot', text: "Sent. Is there anything else?", component: 'map', duration: 2000 },
    { action: 'status', status: 'idle', duration: 0 }
];

// --- Sub-components ---

const StatusPill = ({ status }: { status: BotStatus }) => {
    const config = {
        idle: { label: 'Online', icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
        listening: { label: 'Listening', icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
        analyzing: { label: 'Analyzing Intent...', icon: <Brain size={12} className="animate-pulse" />, color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
        searching: { label: 'Checking Schedules...', icon: <Search size={12} className="animate-bounce" />, color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
        typing: { label: 'Agent Typing...', icon: <Loader2 size={12} className="animate-spin" />, color: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
        sent: { label: 'Sent', icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />, color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
    };

    const current = config[status] || config.idle;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide backdrop-blur-md transition-colors duration-300 ${current.color}`}
            >
                {current.icon}
                <span>{current.label}</span>
            </motion.div>
        </AnimatePresence>
    );
};

const MapCard = () => (
    <div className="mt-3 w-64 rounded-xl overflow-hidden border border-white/10 shadow-xl bg-slate-900/50 backdrop-blur-md group">
        {/* Mock Map Image Header */}
        <div className="h-24 bg-slate-800 relative bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.006,40.7128,12,0/300x150@2x?access_token=pk.mock')] bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white">
                <MapPin size={14} className="text-red-500 fill-red-500/20" />
                <span className="text-xs font-bold shadow-black drop-shadow-md">Port Gate #4</span>
            </div>
        </div>

        {/* Directions Footer */}
        <div className="p-3 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Distance</span>
                <span className="text-xs font-bold text-slate-200">2.4 miles (8 mins)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Navigation size={14} className="text-white" />
            </div>
        </div>
    </div>
);

// --- Main Component ---

export const VirtualAgentBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [botStatus, setBotStatus] = useState<BotStatus>('idle');

    const stepRef = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, botStatus]); // Scroll on new message or status change (like typing)

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (state === 'playing') {
            const processStep = () => {
                const stepIndex = stepRef.current;

                if (stepIndex >= SCENARIO.length) {
                    // Reset after done
                    timer = setTimeout(() => {
                        setMessages([]);
                        setBotStatus('idle');
                        stepRef.current = 0;
                        processStep();
                    }, 5000);
                    return;
                }

                const step = SCENARIO[stepIndex];

                const execute = () => {
                    if (step.action === 'status') {
                        if (step.status) setBotStatus(step.status);
                    } else if (step.action === 'message') {
                        setBotStatus('idle'); // Clear status usually, unless analyzing
                        setMessages(prev => [...prev, {
                            id: Math.random().toString(),
                            role: step.role!,
                            text: step.text!,
                            attachment: step.component === 'map' ? <MapCard /> : undefined
                        }]);
                    }

                    stepRef.current++;
                    processStep();
                };

                // Add explicit wait time
                timer = setTimeout(execute, step.duration || 0);
            };

            processStep();

        } else if (state === 'idle') {
            stepRef.current = 0;
            setMessages([]);
            setBotStatus('idle');
        }

        return () => clearTimeout(timer);
    }, [state]);

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[500px] flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/60 overflow-hidden font-sans rounded-b-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] pointer-events-none" />

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                {/* --- NEO-GLASS HEADER --- */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 shadow-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-slate-900 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white tracking-tight">ZIM Virtual Assistant</div>
                            <div className="text-[10px] text-slate-400">Always-on Support</div>
                        </div>
                    </div>

                    {/* DYNAMIC STATUS PILL */}
                    <StatusPill status={botStatus} />
                </div>

                {/* --- CHAT AREA --- */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
                    {messages.length === 0 && state === 'playing' && botStatus === 'listening' && (
                        <div className="text-center mt-20 opacity-50">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Start speaking...</p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="flex flex-col gap-2 max-w-[85%]">
                                    <div className={`p-4 rounded-2xl relative shadow-sm backdrop-blur-md border ${msg.role === 'user'
                                            ? 'bg-blue-600/90 text-white rounded-br-sm border-blue-500/30'
                                            : 'bg-slate-800/80 text-slate-100 rounded-bl-sm border-white/10'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>

                                    {/* Attachment (Map) */}
                                    {msg.attachment && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            {msg.attachment}
                                        </motion.div>
                                    )}

                                    <span className={`text-[10px] opacity-40 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.role === 'user' ? 'You' : 'Assistant'} • Just now
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing/Processing Indicator in Chat Stream */}
                    {(botStatus === 'typing' || botStatus === 'searching' || botStatus === 'analyzing') && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-slate-800/40 border border-white/5 p-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 backdrop-blur-sm">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
                                    {botStatus === 'searching' ? 'Searching' : 'Thinking'}
                                </span>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* --- FOOTER INPUT --- */}
                <div className="p-4 border-t border-white/5 bg-slate-900/30 backdrop-blur-sm z-20">
                    <div className="relative">
                        <div className="w-full bg-slate-950/50 border border-white/10 rounded-full h-12 flex items-center px-4 text-sm text-slate-500 shadow-inner">
                            {state === 'playing' ? "Type a message..." : "Start simulation to interact"}
                        </div>
                        <div className="absolute right-2 top-2 bottom-2 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                            <Send size={14} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
};
