"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Hash, Heart, Repeat2, Share, AlertTriangle, CheckCircle2, User, ThumbsDown, Ticket } from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// --- Configuration ---
interface SocialPost {
    id: string;
    author: string;
    handle: string;
    avatar: string;
    content: string;
    timestamp: string;
    hashtags?: string[];
    isNegative?: boolean;
    verified?: boolean;
}

const SOCIAL_FEED_POSTS: SocialPost[] = [
    {
        id: '1',
        author: 'Kfir',
        handle: '@kfir',
        avatar: 'SC',
        verified: true,
        content: 'Just received my shipment from @ZIMShipping! Super fast delivery to Singapore. Amazing service! 🚢',
        timestamp: '2m',
    },
    {
        id: '2',
        author: 'Global Trader',
        handle: '@globaltrader',
        avatar: 'GT',
        content: 'Tracking system on @ZIMShipping is so smooth. Real-time updates are a game changer.',
        timestamp: '5m',
    },
];

const ANGRY_POST: SocialPost = {
    id: '3',
    author: 'Marcus Rivera',
    handle: '@marcusrivera',
    avatar: 'MR',
    content: '@ZIMShipping where is my container? It was supposed to arrive yesterday! #angry #frustrated',
    timestamp: 'Just now',
    hashtags: ['#angry', '#frustrated'],
    isNegative: true,
};

export const SocialListeningBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<"idle" | "feed" | "new-post" | "ai-detect" | "ticket-convert" | "ticket-accepted">("idle");
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [showTicket, setShowTicket] = useState(false);

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
        setPhase("idle");
        setPosts([]);
        setShowTicket(false);
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

                        // 1. Reset
                        reset();
                        await wait(500);

                        // 2. Show feed with existing posts
                        await waitForPlay();
                        setPhase("feed");
                        setPosts(SOCIAL_FEED_POSTS);
                        await wait(2000);

                        // 3. New angry post appears
                        await waitForPlay();
                        setPhase("new-post");
                        setPosts([...SOCIAL_FEED_POSTS, ANGRY_POST]);
                        await wait(1500);

                        // 4. AI Detection - flag as negative
                        await waitForPlay();
                        setPhase("ai-detect");
                        await wait(2000);

                        // 5. Convert to ticket
                        await waitForPlay();
                        setPhase("ticket-convert");
                        setShowTicket(true);
                        await wait(2000);

                        // 6. Agent accepts ticket
                        await waitForPlay();
                        setPhase("ticket-accepted");
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
            <div className="relative w-full h-full min-h-[450px] bg-slate-950 flex flex-col overflow-hidden border border-blue-500/20 font-sans group">

                {/* Twitter/X Dark Mode Background */}
                <div className="absolute inset-0 bg-[#15202b]" />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                />

                {/* --- HEADER --- */}
                <div className="relative z-10 w-full h-14 bg-[#1e2732]/90 backdrop-blur-md border-b border-blue-500/20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <img src="/ZIM80Logo.png" alt="ZIM" className="h-7 w-auto object-contain" />
                        <div className="h-4 w-px bg-white/20" />
                        <span className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">Social Listening</span>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-300">
                            <MessageCircle size={10} className="animate-pulse" />
                            MONITORING
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="relative z-10 flex-1 flex gap-4 p-4 overflow-hidden">

                    {/* Social Feed Column */}
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <Hash size={14} className="text-blue-400" />
                            <h3 className="text-sm font-bold text-white">Live Social Feed</h3>
                        </div>

                        {/* Posts */}
                        <AnimatePresence mode="popLayout">
                            {posts.map((post, idx) => {
                                const isAngry = post.id === ANGRY_POST.id;
                                const showNegativeBadge = isAngry && (phase === "ai-detect" || phase === "ticket-convert" || phase === "ticket-accepted");

                                return (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                                        className={`relative bg-[#192734] border rounded-xl p-4 transition-all duration-300 ${isAngry && showNegativeBadge
                                            ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                            : 'border-white/10'
                                            }`}
                                    >
                                        {/* Negative Badge */}
                                        <AnimatePresence>
                                            {showNegativeBadge && (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute -top-2 -right-2 z-20"
                                                >
                                                    <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg">
                                                        <ThumbsDown size={10} />
                                                        NEGATIVE
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Post Header */}
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {post.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-white">{post.author}</span>
                                                    <span className="text-xs text-slate-500">{post.handle}</span>
                                                    <span className="text-xs text-slate-500">· {post.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                                                    {post.content}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Post Actions */}
                                        <div className="flex items-center gap-6 mt-3 text-slate-500">
                                            <div className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors cursor-pointer">
                                                <MessageCircle size={14} />
                                                <span>{Math.floor(Math.random() * 20)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors cursor-pointer">
                                                <Repeat2 size={14} />
                                                <span>{Math.floor(Math.random() * 50)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors cursor-pointer">
                                                <Heart size={14} />
                                                <span>{Math.floor(Math.random() * 100)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Ticket Conversion Panel */}
                    <AnimatePresence>
                        {showTicket && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="w-72 flex flex-col"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Ticket size={14} className="text-blue-400" />
                                    <h3 className="text-sm font-bold text-white">Support Ticket</h3>
                                </div>

                                {/* Ticket Card */}
                                <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                    {/* Ticket Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-xs font-mono text-blue-400">#1024</div>
                                        <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${phase === "ticket-accepted"
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            }`}>
                                            {phase === "ticket-accepted" ? 'IN PROGRESS' : 'NEW'}
                                        </div>
                                    </div>

                                    {/* Ticket Details */}
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Source</div>
                                            <div className="text-xs text-white flex items-center gap-2">
                                                <MessageCircle size={12} className="text-blue-400" />
                                                Social Media (Twitter/X)
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Customer</div>
                                            <div className="text-xs text-white">Marcus Rivera</div>
                                            <div className="text-xs text-slate-400">@marcusrivera</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Issue</div>
                                            <div className="text-xs text-white leading-relaxed">
                                                Container delivery delay - expected yesterday
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Sentiment</div>
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle size={12} className="text-red-400" />
                                                <span className="text-xs text-red-400 font-bold">Negative (Angry)</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Priority</div>
                                            <div className="text-xs font-bold text-red-400">HIGH</div>
                                        </div>
                                    </div>

                                    {/* Agent Assignment */}
                                    <AnimatePresence>
                                        {phase === "ticket-accepted" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-white/10"
                                            >
                                                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                                                        JD
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-white">Jessica Davis</div>
                                                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle2 size={10} />
                                                            Ticket Accepted
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* AI Conversion Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-3 flex items-center justify-center gap-2 text-[10px] text-blue-400"
                                >
                                    <Ticket size={10} />
                                    <span>Auto-converted by AI</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </ClientOnly>
    );
};
