"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SimulationControls, SimulationState } from './SimulationControls';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientOnly } from './ClientOnly';
import { Globe, FileText, Zap, Languages } from 'lucide-react';

// --- Types ---
type Phase = 'idle' | 'inbox' | 'select' | 'translate' | 'translated' | 'insight';

interface InboxEntry {
    flag: string;
    rep: string;
    client: string;
    lang: string;
}

interface TranscriptLine {
    thai: string;
    en: string;
}

// --- Data ---
const INBOX_ENTRIES: InboxEntry[] = [
    { flag: "🇹🇭", rep: "Somchai R.", client: "Siam Cement", lang: "Thai" },
    { flag: "🇨🇳", rep: "Wei L.", client: "COSCO", lang: "Chinese" },
    { flag: "🇧🇷", rep: "Carlos M.", client: "Vale SA", lang: "Portuguese" },
];

const TRANSCRIPT_LINES: TranscriptLine[] = [
    { thai: "ลูกค้าขอเพิ่ม TEU 200 ตู้สำหรับเส้นทางกรุงเทพฯ", en: "Client requested 200 additional TEUs for the Bangkok route" },
    { thai: "มีข้อกังวลเรื่องราคา — คู่แข่งเสนอถูกกว่า 15%", en: "Pricing concern raised — competitor quoted 15% lower" },
    { thai: "ตกลงนัดประชุมติดตามผลวันพฤหัสบดีหน้า", en: "Follow-up meeting scheduled for next Thursday" },
    { thai: "ลูกค้าสนใจสัญญาระยะยาวหากราคาแข่งขันได้", en: "Client interested in long-term contract if pricing competitive" },
];

const INSIGHT_TEXT = "Price objection detected. Recommend battlecard #12.";

// --- Shimmer Keyframes (injected once) ---
const SHIMMER_STYLE_ID = 'translation-shimmer-style';

const injectShimmerStyle = () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(SHIMMER_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = SHIMMER_STYLE_ID;
    style.textContent = `
        @keyframes shimmer-sweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .shimmer-overlay {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            border-radius: inherit;
        }
        .shimmer-overlay::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(129, 140, 248, 0.25) 40%,
                rgba(129, 140, 248, 0.5) 50%,
                rgba(129, 140, 248, 0.25) 60%,
                transparent 100%
            );
            animation: shimmer-sweep 1.2s ease-in-out forwards;
        }
    `;
    document.head.appendChild(style);
};

// --- Component ---
export const TranslationBox = () => {
    const [state, setState] = useState<SimulationState>('idle');
    const [phase, setPhase] = useState<Phase>('idle');
    const [visibleInbox, setVisibleInbox] = useState(0);
    const [selectedEntry, setSelectedEntry] = useState(-1);
    const [visibleThaiLines, setVisibleThaiLines] = useState(0);
    const [translatedLines, setTranslatedLines] = useState(0);
    const [showTranslateBtn, setShowTranslateBtn] = useState(false);
    const [shimmerActive, setShimmerActive] = useState(false);
    const [showInsight, setShowInsight] = useState(false);

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

    // --- Reset ---
    const resetAll = () => {
        setPhase('idle');
        setVisibleInbox(0);
        setSelectedEntry(-1);
        setVisibleThaiLines(0);
        setTranslatedLines(0);
        setShowTranslateBtn(false);
        setShimmerActive(false);
        setShowInsight(false);
    };

    // --- Inject shimmer CSS ---
    useEffect(() => {
        injectShimmerStyle();
    }, []);

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

                        // Reset for loop
                        resetAll();
                        await wait(400);

                        // === PHASE 1: INBOX ===
                        await waitForPlay();
                        setPhase('inbox');
                        // Reveal inbox entries one by one
                        for (let i = 0; i < INBOX_ENTRIES.length; i++) {
                            await waitForPlay();
                            setVisibleInbox(i + 1);
                            await wait(600);
                        }
                        await wait(1500);

                        // === PHASE 2: SELECT ===
                        await waitForPlay();
                        setPhase('select');
                        setSelectedEntry(0); // Thai transcript
                        await wait(800);
                        // Reveal Thai lines one by one
                        for (let i = 0; i < TRANSCRIPT_LINES.length; i++) {
                            await waitForPlay();
                            setVisibleThaiLines(i + 1);
                            await wait(700);
                        }
                        await wait(1200);

                        // === PHASE 3: TRANSLATE ===
                        await waitForPlay();
                        setPhase('translate');
                        setShowTranslateBtn(true);
                        await wait(1500);
                        // "Click" the translate button
                        setShimmerActive(true);
                        await wait(1500);

                        // === PHASE 4: TRANSLATED ===
                        await waitForPlay();
                        setPhase('translated');
                        setShimmerActive(false);
                        // Morph lines one by one
                        for (let i = 0; i < TRANSCRIPT_LINES.length; i++) {
                            await waitForPlay();
                            setTranslatedLines(i + 1);
                            await wait(800);
                        }
                        await wait(1000);

                        // === PHASE 5: INSIGHT ===
                        await waitForPlay();
                        setPhase('insight');
                        setShowInsight(true);
                        await wait(5000);
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
    const showViewer = phase === 'select' || phase === 'translate' || phase === 'translated' || phase === 'insight';

    return (
        <ClientOnly>
            <div className="relative w-full h-full min-h-[400px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">

                <SimulationControls
                    state={state}
                    onPlay={() => setState('playing')}
                    onPause={() => setState('paused')}
                    onStop={() => setState('idle')}
                    className="mt-0 mr-4"
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
                                <Languages size={32} className="text-slate-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                                Transcript Translation Hub
                            </p>
                        </motion.div>
                    )}

                    {/* === INBOX === */}
                    {isActive && phase === 'inbox' && (
                        <motion.div
                            key="inbox"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1.15 }}
                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                            className="w-full max-w-md px-4 origin-center"
                        >
                            {/* Inbox Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">
                                    <FileText size={11} className="text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    Transcript Inbox
                                </span>
                                <div className="flex-1 h-px bg-slate-800" />
                                <span className="text-[9px] text-slate-500 font-mono">
                                    {visibleInbox} new
                                </span>
                            </div>

                            {/* Inbox List */}
                            <div className="flex flex-col gap-1.5">
                                {INBOX_ENTRIES.map((entry, i) => (
                                    <AnimatePresence key={entry.rep}>
                                        {i < visibleInbox && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -15 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-colors cursor-pointer group"
                                            >
                                                <span className="text-xl shrink-0">{entry.flag}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">
                                                        {entry.rep} <span className="text-slate-500">→</span>{' '}
                                                        <span className="text-slate-300">Client: {entry.client}</span>
                                                    </p>
                                                </div>
                                                <span
                                                    className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        background: 'rgba(129, 140, 248, 0.1)',
                                                        color: '#818cf8',
                                                        border: '1px solid rgba(129, 140, 248, 0.2)',
                                                    }}
                                                >
                                                    {entry.lang}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* === SELECT / TRANSLATE / TRANSLATED / INSIGHT === */}
                    {isActive && showViewer && (
                        <motion.div
                            key="viewer"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1.15 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-md px-4 flex flex-col gap-3 origin-center"
                        >
                            {/* Selected Transcript Header */}
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🇹🇭</span>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white">
                                        Somchai R. → <span className="text-slate-400">Siam Cement</span>
                                    </p>
                                    <p className="text-[9px] text-slate-500 mt-0.5">
                                        {phase === 'translated' || phase === 'insight'
                                            ? 'Translated to English'
                                            : 'Original — Thai'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">
                                        {phase === 'translate' ? 'Translating' : phase === 'insight' ? 'Insights' : 'Viewing'}
                                    </span>
                                </div>
                            </div>

                            {/* Transcript Body */}
                            <div
                                className="relative rounded-xl p-4 flex flex-col gap-2.5 overflow-hidden border"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.7)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    borderColor: phase === 'insight'
                                        ? 'rgba(52, 211, 153, 0.3)'
                                        : 'rgba(129, 140, 248, 0.2)',
                                    boxShadow: phase === 'insight'
                                        ? '0 0 30px rgba(52, 211, 153, 0.08)'
                                        : '0 0 30px rgba(129, 140, 248, 0.06)',
                                }}
                            >
                                {/* Shimmer Overlay */}
                                {shimmerActive && <div className="shimmer-overlay" />}

                                {/* Transcript Lines */}
                                <div className="flex flex-col gap-2">
                                    {TRANSCRIPT_LINES.map((line, i) => (
                                        <AnimatePresence key={i} mode="wait">
                                            {i < visibleThaiLines && (
                                                <motion.div
                                                    key={i < translatedLines ? `en-${i}` : `th-${i}`}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    transition={{ duration: 0.35 }}
                                                    className="flex items-start gap-2.5"
                                                >
                                                    <span className="text-[9px] text-slate-600 font-mono shrink-0 mt-1 w-4 text-right">
                                                        {i + 1}
                                                    </span>
                                                    <p
                                                        className={`text-[11px] leading-relaxed ${i < translatedLines
                                                            ? 'text-emerald-300 font-medium'
                                                            : 'text-slate-300'
                                                            }`}
                                                        style={{
                                                            fontFamily: i < translatedLines ? 'Inter, sans-serif' : 'inherit',
                                                        }}
                                                    >
                                                        {i < translatedLines ? line.en : line.thai}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    ))}
                                </div>

                                {/* Translate Button */}
                                <AnimatePresence>
                                    {showTranslateBtn && phase === 'translate' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex justify-center mt-2"
                                        >
                                            <motion.button
                                                animate={shimmerActive
                                                    ? { scale: [1, 0.97, 1], opacity: 0.7 }
                                                    : { scale: 1, opacity: 1 }
                                                }
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider transition-all"
                                                style={{
                                                    background: shimmerActive
                                                        ? 'rgba(99, 102, 241, 0.3)'
                                                        : 'rgba(99, 102, 241, 0.6)',
                                                    border: '1px solid rgba(129, 140, 248, 0.4)',
                                                    boxShadow: shimmerActive
                                                        ? '0 0 20px rgba(99, 102, 241, 0.3)'
                                                        : '0 0 15px rgba(99, 102, 241, 0.15)',
                                                    cursor: 'default',
                                                }}
                                            >
                                                <Globe size={14} className={shimmerActive ? "animate-spin" : ""} />
                                                {shimmerActive ? 'Translating...' : 'Translate to English'}
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* === INSIGHT CARD === */}
                            <AnimatePresence>
                                {showInsight && phase === 'insight' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 350, damping: 22 }}
                                        className="rounded-xl p-3.5 flex items-start gap-3"
                                        style={{
                                            background: 'rgba(251, 191, 36, 0.06)',
                                            border: '1px solid rgba(251, 191, 36, 0.25)',
                                            boxShadow: '0 0 25px rgba(251, 191, 36, 0.08), inset 0 1px 0 rgba(251, 191, 36, 0.05)',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 8, -8, 0] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                            className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5"
                                        >
                                            <Zap size={16} className="text-amber-400" />
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest mb-1">
                                                Key Insight
                                            </p>
                                            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                                                {INSIGHT_TEXT}
                                            </p>
                                        </div>
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
