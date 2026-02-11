"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { BarChart2, TrendingUp, AlertTriangle, Search } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'scanning' | 'word_cloud' | 'topics' | 'alert';

interface TranscriptLine {
    time: string;
    speaker: 'Rep' | 'Client';
    text: string;
    keywords?: { word: string; category: 'competitor' | 'pricing' | 'timeline' }[];
}

interface WordCloudItem {
    word: string;
    size: number; // font-size in px
    color: string;
    x: number; // % offset
    y: number; // % offset
}

interface TopicCard {
    icon: React.ReactNode;
    title: string;
    stat: string;
    detail: string;
    barWidths: number[]; // 3 bars, widths as %
    color: string;
}

// --- Constants ---
const CATEGORY_COLORS: Record<string, string> = {
    competitor: '#ef4444',
    pricing: '#f59e0b',
    timeline: '#3b82f6',
};

const TRANSCRIPT_LINES: TranscriptLine[] = [
    { time: "00:12", speaker: "Client", text: "We've been looking at Maersk for the Asia-Pacific corridor.", keywords: [{ word: "Maersk", category: "competitor" }] },
    { time: "00:18", speaker: "Rep", text: "Understood. Let me pull up our volume discount options.", keywords: [{ word: "discount", category: "pricing" }] },
    { time: "00:26", speaker: "Client", text: "We need commitments locked by next quarter at the latest.", keywords: [{ word: "next quarter", category: "timeline" }] },
    { time: "00:33", speaker: "Rep", text: "Our price per TEU is very competitive against MSC right now.", keywords: [{ word: "price", category: "pricing" }, { word: "MSC", category: "competitor" }] },
    { time: "00:41", speaker: "Client", text: "Evergreen offered us priority loading last week.", keywords: [{ word: "Evergreen", category: "competitor" }] },
    { time: "00:48", speaker: "Rep", text: "We can match that. Volume commitment unlocks premium slots.", keywords: [{ word: "Volume", category: "pricing" }] },
    { time: "00:55", speaker: "Client", text: "The deadline is tight — board review is in two weeks.", keywords: [{ word: "deadline", category: "timeline" }] },
    { time: "01:02", speaker: "Rep", text: "I'll get the proposal with container pricing to you by Friday.", keywords: [{ word: "pricing", category: "pricing" }] },
];

const WORD_CLOUD_ITEMS: WordCloudItem[] = [
    // Top Band
    { word: "Maersk", size: 14, color: "#ef4444", x: 65, y: 15 },
    { word: "Deadline", size: 12, color: "#3b82f6", x: 25, y: 20 },

    // Upper Middle
    { word: "Containers", size: 13, color: "#3b82f6", x: 15, y: 38 },
    { word: "Evergreen", size: 11, color: "#ef4444", x: 78, y: 32 },

    // Center / Lower Middle
    { word: "Price", size: 16, color: "#f59e0b", x: 45, y: 50 },
    { word: "MSC", size: 11, color: "#ef4444", x: 75, y: 58 },
    { word: "Quarter", size: 12, color: "#3b82f6", x: 10, y: 65 },

    // Bottom Band
    { word: "Discount", size: 13, color: "#f59e0b", x: 25, y: 82 },
    { word: "Volume", size: 15, color: "#f59e0b", x: 55, y: 85 },
    { word: "Delay", size: 12, color: "#f59e0b", x: 80, y: 78 },
];

const TOPIC_CARDS: TopicCard[] = [
    {
        icon: <BarChart2 size={16} />,
        title: "Pricing Discussions",
        stat: "67%",
        detail: "of calls mention pricing",
        barWidths: [67, 45, 30],
        color: "#f59e0b",
    },
    {
        icon: <TrendingUp size={16} />,
        title: "Competitor Mentions",
        stat: "20 total",
        detail: "Maersk 12x · MSC 5x · Evergreen 3x",
        barWidths: [90, 38, 23],
        color: "#ef4444",
    },
    {
        icon: <AlertTriangle size={16} />,
        title: "Urgency Signals",
        stat: "8 calls",
        detail: "flagged \"deadline\" this week",
        barWidths: [80, 55, 40],
        color: "#3b82f6",
    },
];

// --- Component ---
export const CommandCenterBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [visibleLines, setVisibleLines] = useState(0);
    const [highlightedKeywords, setHighlightedKeywords] = useState<Set<string>>(new Set());
    const [visibleCloudWords, setVisibleCloudWords] = useState(0);
    const [visibleTopics, setVisibleTopics] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [scanlineY, setScanlineY] = useState(0);

    // --- Refs ---
    const stateRef = useRef(state);
    stateRef.current = state;
    const isLoopingRef = useRef(false);
    const scanlineProgressRef = useRef(0);
    const lastFrameTimeRef = useRef<number | null>(null);

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

    const resetAll = () => {
        setPhase('idle');
        setVisibleLines(0);
        setHighlightedKeywords(new Set());
        setVisibleCloudWords(0);
        setVisibleTopics(0);
        setShowAlert(false);
        setScanlineY(0);
        scanlineProgressRef.current = 0;
        lastFrameTimeRef.current = null;
    };

    // --- Scanline animation with persistence ---
    useEffect(() => {
        // Reset timing if we completely stop or switch phases (except when just pausing)
        if (state === 'idle') {
            scanlineProgressRef.current = 0;
            lastFrameTimeRef.current = null;
        }

        if (phase !== 'scanning') return;

        let raf: number;
        const duration = 6000; // ms for full scan

        const animate = (timestamp: number) => {
            if (stateRef.current !== 'playing') {
                lastFrameTimeRef.current = null; // Reset frame time so we don't jump on resume
                return;
            }

            if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
            const delta = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;

            // Increment progress
            scanlineProgressRef.current += delta / duration;

            if (scanlineProgressRef.current >= 1) {
                scanlineProgressRef.current = 1;
                setScanlineY(100);
            } else {
                setScanlineY(scanlineProgressRef.current * 100);
                raf = requestAnimationFrame(animate);
            }
        };

        if (state === 'playing') {
            raf = requestAnimationFrame(animate);
        } else {
            // When paused, ensure we don't lose position visually
            setScanlineY(scanlineProgressRef.current * 100);
        }

        return () => {
            cancelAnimationFrame(raf);
            // Don't reset refs here to allow resuming
        };
    }, [phase, state]);

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

                        // Reset
                        resetAll();
                        await wait(400);

                        // === PHASE 1: SCANNING ===
                        await waitForPlay();
                        setPhase('scanning');
                        // Reset scanline specifically for new phase start
                        scanlineProgressRef.current = 0;
                        setScanlineY(0);

                        // Reveal transcript lines one by one and highlight keywords
                        for (let i = 0; i < TRANSCRIPT_LINES.length; i++) {
                            await waitForPlay();
                            setVisibleLines(i + 1);
                            await wait(400);

                            // Highlight keywords in this line
                            const line = TRANSCRIPT_LINES[i];
                            if (line.keywords) {
                                for (const kw of line.keywords) {
                                    await waitForPlay();
                                    setHighlightedKeywords(prev => new Set([...prev, kw.word]));
                                    await wait(300);
                                }
                            }
                            await wait(200);
                        }
                        await wait(800);

                        // === PHASE 2: WORD CLOUD ===
                        await waitForPlay();
                        setPhase('word_cloud');

                        for (let i = 0; i < WORD_CLOUD_ITEMS.length; i++) {
                            await waitForPlay();
                            setVisibleCloudWords(i + 1);
                            await wait(250);
                        }
                        await wait(1500);

                        // === PHASE 3: TOPICS ===
                        await waitForPlay();
                        setPhase('topics');

                        for (let i = 0; i < TOPIC_CARDS.length; i++) {
                            await waitForPlay();
                            setVisibleTopics(i + 1);
                            await wait(700);
                        }
                        await wait(1200);

                        // === PHASE 4: ALERT ===
                        await waitForPlay();
                        setPhase('alert');
                        setShowAlert(true);
                        await wait(4000);

                        // Loop restart
                        setShowAlert(false);
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

    const isActive = state !== 'idle';

    // --- Render keyword-highlighted text ---
    const renderHighlightedText = (line: TranscriptLine) => {
        if (!line.keywords || line.keywords.length === 0) {
            return <span className="text-slate-300 text-[10px] leading-relaxed">{line.text}</span>;
        }

        let remaining = line.text;
        const parts: React.ReactNode[] = [];
        let keyIndex = 0;

        for (const kw of line.keywords) {
            const idx = remaining.indexOf(kw.word);
            if (idx === -1) continue;

            // Text before keyword
            if (idx > 0) {
                parts.push(<span key={`t-${keyIndex}`} className="text-slate-300 text-[10px]">{remaining.substring(0, idx)}</span>);
            }

            // The keyword itself
            const isHighlighted = highlightedKeywords.has(kw.word);
            parts.push(
                <motion.span
                    key={`kw-${keyIndex}`}
                    initial={{ backgroundColor: 'transparent' }}
                    animate={isHighlighted ? {
                        backgroundColor: `${CATEGORY_COLORS[kw.category]}22`,
                    } : {}}
                    className="text-[10px] rounded px-0.5 inline-block"
                    style={isHighlighted ? {
                        color: CATEGORY_COLORS[kw.category],
                        fontWeight: 700,
                        border: `1px solid ${CATEGORY_COLORS[kw.category]}40`,
                        boxShadow: `0 0 8px ${CATEGORY_COLORS[kw.category]}30`,
                    } : { color: '#cbd5e1' }}
                >
                    {kw.word}
                </motion.span>
            );

            remaining = remaining.substring(idx + kw.word.length);
            keyIndex++;
        }

        // Remaining text
        if (remaining) {
            parts.push(<span key="rest" className="text-slate-300 text-[10px]">{remaining}</span>);
        }

        return <span className="leading-relaxed">{parts}</span>;
    };

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-0 mr-0"
                />

                <AnimatePresence mode="wait">

                    {/* === IDLE === */}
                    {!isActive && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                                <Search size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                                Analytics Ready
                            </p>
                        </motion.div>
                    )}

                    {/* === SCANNING === */}
                    {isActive && phase === 'scanning' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col p-4 relative"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center">
                                    <Search size={11} className="text-amber-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    Scanning Transcripts
                                </span>
                                <div className="flex-1" />
                                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Analyzing</span>
                                </div>
                            </div>

                            {/* Transcript area with scanline */}
                            <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                                {/* Scanline */}
                                <motion.div
                                    className="absolute left-0 right-0 h-[2px] z-10 pointer-events-none"
                                    style={{
                                        top: `${scanlineY}%`,
                                        background: 'linear-gradient(90deg, transparent, #f59e0b, #f59e0b, transparent)',
                                        boxShadow: '0 0 15px #f59e0b60, 0 0 30px #f59e0b30',
                                    }}
                                />

                                {/* Transcript Lines */}
                                <div className="flex flex-col gap-1.5">
                                    {TRANSCRIPT_LINES.map((line, i) => (
                                        <AnimatePresence key={i}>
                                            {i < visibleLines && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex gap-2 items-start"
                                                >
                                                    <span className="text-[9px] text-slate-600 font-mono shrink-0 mt-0.5 w-8">
                                                        {line.time}
                                                    </span>
                                                    <span className={`text-[9px] font-bold shrink-0 mt-0.5 w-7 ${line.speaker === 'Rep' ? 'text-blue-400' : 'text-slate-400'}`}>
                                                        {line.speaker === 'Rep' ? 'REP' : 'CLI'}
                                                    </span>
                                                    {renderHighlightedText(line)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 mt-2 justify-center">
                                {[
                                    { label: 'Competitor', color: '#ef4444' },
                                    { label: 'Pricing', color: '#f59e0b' },
                                    { label: 'Timeline', color: '#3b82f6' },
                                ].map(l => (
                                    <div key={l.label} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                        <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider">{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* === WORD CLOUD === */}
                    {isActive && phase === 'word_cloud' && (
                        <motion.div
                            key="word_cloud"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full relative overflow-hidden flex-1"
                        >
                            {/* Header - Absolute Top Left */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                                <div className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center">
                                    <BarChart2 size={11} className="text-purple-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    Keyword Cloud
                                </span>
                            </div>

                            {/* Cloud Items - Distributed across full space */}
                            <div className="absolute inset-0 top-12 bottom-4 left-4 right-4">
                                {WORD_CLOUD_ITEMS.map((item, i) => (
                                    <AnimatePresence key={item.word}>
                                        {i < visibleCloudWords && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 200,
                                                    damping: 18,
                                                }}
                                                className="absolute flex items-center justify-center px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg"
                                                style={{
                                                    left: `${item.x}%`,
                                                    top: `${item.y}%`,
                                                    backgroundColor: `${item.color}15`, // 15% opacity background
                                                    borderColor: `${item.color}30`, // 30% opacity border
                                                    boxShadow: `0 4px 20px ${item.color}20`,
                                                    transform: 'translate(-50%, -50%)',
                                                    willChange: 'transform, opacity',
                                                }}
                                            >
                                                <span
                                                    className="font-bold text-white tracking-wide"
                                                    style={{
                                                        fontSize: `${item.size}px`,
                                                        textShadow: `0 0 10px ${item.color}80`,
                                                    }}
                                                >
                                                    {item.word}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* === TOPICS === */}
                    {isActive && phase === 'topics' && (
                        <motion.div
                            key="topics"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col p-4 gap-3"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp size={11} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    Detected Topics
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="flex flex-col gap-2.5 flex-1 justify-center">
                                {TOPIC_CARDS.map((card, i) => (
                                    <AnimatePresence key={card.title}>
                                        {i < visibleTopics && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 350,
                                                    damping: 25,
                                                }}
                                                className="rounded-xl p-3 border"
                                                style={{
                                                    background: 'rgba(15, 23, 42, 0.6)',
                                                    backdropFilter: 'blur(12px)',
                                                    WebkitBackdropFilter: 'blur(12px)',
                                                    borderColor: `${card.color}25`,
                                                    boxShadow: `0 0 20px ${card.color}10`,
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon */}
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: `${card.color}15`, color: card.color }}
                                                    >
                                                        {card.icon}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[11px] font-bold text-white">{card.title}</span>
                                                            <span
                                                                className="text-[11px] font-black"
                                                                style={{ color: card.color }}
                                                            >
                                                                {card.stat}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-400 mb-2">{card.detail}</p>

                                                        {/* Mini bar chart */}
                                                        <div className="flex gap-1 items-end h-4">
                                                            {card.barWidths.map((w, bi) => (
                                                                <motion.div
                                                                    key={bi}
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${(w / 100) * 16}px` }}
                                                                    transition={{ duration: 0.6, delay: bi * 0.15 }}
                                                                    className="w-3 rounded-sm"
                                                                    style={{
                                                                        backgroundColor: card.color,
                                                                        opacity: 1 - bi * 0.25,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* === ALERT === */}
                    {isActive && phase === 'alert' && (
                        <motion.div
                            key="alert"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col items-center justify-center p-6"
                        >
                            {/* Alert Card */}
                            <AnimatePresence>
                                {showAlert && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="w-full max-w-sm"
                                    >
                                        {/* Pulsing outer glow */}
                                        <motion.div
                                            animate={{
                                                boxShadow: [
                                                    '0 0 20px rgba(239, 68, 68, 0.2)',
                                                    '0 0 40px rgba(239, 68, 68, 0.4)',
                                                    '0 0 20px rgba(239, 68, 68, 0.2)',
                                                ]
                                            }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                            className="rounded-2xl border border-red-500/30 overflow-hidden"
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.8)',
                                                backdropFilter: 'blur(16px)',
                                                WebkitBackdropFilter: 'blur(16px)',
                                            }}
                                        >
                                            {/* Red accent strip */}
                                            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />

                                            <div className="p-5">
                                                {/* Icon + Badge */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                        className="w-10 h-10 rounded-full bg-red-500/15 border-2 border-red-400/40 flex items-center justify-center"
                                                    >
                                                        <AlertTriangle size={20} className="text-red-400" />
                                                    </motion.div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Trend Alert</p>
                                                        <p className="text-white text-sm font-bold mt-0.5">Competitor Activity Spike</p>
                                                    </div>
                                                </div>

                                                {/* Alert message */}
                                                <div className="bg-red-500/8 border border-red-500/15 rounded-lg p-3 mb-4">
                                                    <p className="text-slate-200 text-xs leading-relaxed">
                                                        <span className="font-bold text-red-400">&quot;Maersk&quot;</span> mentions up{" "}
                                                        <span className="font-black text-red-400">40%</span> this week across all sales calls.
                                                    </p>
                                                </div>

                                                {/* Stats row */}
                                                <div className="flex gap-3">
                                                    {[
                                                        { label: "This Week", value: "28", trend: "↑" },
                                                        { label: "Last Week", value: "20", trend: "" },
                                                        { label: "Avg/Month", value: "18", trend: "" },
                                                    ].map(s => (
                                                        <div key={s.label} className="flex-1 text-center bg-slate-800/50 rounded-lg py-2 border border-slate-700/30">
                                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
                                                            <p className="text-white font-black text-sm mt-0.5">
                                                                {s.value}
                                                                {s.trend && <span className="text-red-400 text-[10px] ml-0.5">{s.trend}</span>}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </ClientOnly>
    );
};
