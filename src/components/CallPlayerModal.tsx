'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Mic, Headphones, ArrowLeft } from 'lucide-react';
import { Howl } from 'howler';
import { AudioOrb } from '@/components/ui/AudioOrb';
import { TranscriptLine } from '@/types/CallTranscript';
import rawTranscript from '@/data/elevenlabs_demo.json';
import { KaraokeText } from '@/components/ui/KaraokeText';

// --- Types ---
type ViewState = 'MENU' | 'DEMO' | 'LIVE';

interface CallPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- Helper: Map Transcript ---
const mapTranscript = (raw: any): TranscriptLine[] => {
    if (!raw.segments) return [];
    return raw.segments.map((seg: any) => ({
        start: seg.start_time,
        end: seg.end_time,
        speaker: seg.speaker.id === 'speaker_0' ? 'agent' : 'user',
        text: seg.text,
        words: seg.words ? seg.words.map((w: any) => ({
            text: w.text,
            start: w.start_time,
            end: w.end_time
        })) : []
    }));
};

// --- Sub-Component: Menu View ---
const MenuView = ({ onSelect }: { onSelect: (view: ViewState) => void }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-6 md:gap-12 p-6 md:p-12">
            <div className="text-center space-y-4 mb-4">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">Experience Genesys AI</h2>
                <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto">
                    Choose how you want to explore our voice capabilities.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch perspective-1000">
                {/* Card 1: Recorded Demo */}
                {/* Card 1: Recorded Demo */}
                <motion.button
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('DEMO')}
                    className="group relative flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 p-8 md:p-12 h-auto min-h-[350px] md:h-[450px] rounded-[2rem] md:rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950/80 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(6,182,212,0.2)] text-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-32 h-32 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-500 group-hover:scale-110 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                        <Headphones size={64} className="text-slate-300 group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>

                    <div className="relative space-y-4 max-w-xs">
                        <h3 className="text-3xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">Play Recorded Demo</h3>
                        <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-300">Experience a fully analyzed call with real-time sentiment tracking.</p>
                    </div>
                </motion.button>

                {/* Card 2: Live Agent */}
                {/* Card 2: Live Agent */}
                <motion.button
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('LIVE')}
                    className="group relative flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 p-8 md:p-12 h-auto min-h-[350px] md:h-[450px] rounded-[2rem] md:rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950/80 backdrop-blur-xl transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_60px_rgba(168,85,247,0.2)] text-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-32 h-32 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-purple-500/20 transition-all duration-500 group-hover:scale-110 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                        <Mic size={64} className="text-slate-300 group-hover:text-purple-400 transition-colors duration-300" />
                    </div>

                    <div className="relative space-y-4 max-w-xs">
                        <h3 className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">Talk to AI Sales Agent</h3>
                        <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-300">Interact with our generative AI in real-time conversation.</p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

// --- Sub-Component: Reactive Waveform ---
const ReactiveWaveform = ({ isActive }: { isActive: boolean }) => (
    <div className="flex items-center gap-1 h-4">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="w-1 bg-cyan-500/80 rounded-full"
                animate={isActive ? { height: ['20%', '100%', '20%'] } : { height: '20%' }}
                transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.1,
                    ease: "easeInOut"
                }}
            />
        ))}
    </div>
);

// --- Sub-Component: Live View (ElevenLabs) ---
const LiveView = () => {
    const scriptRef = useRef<HTMLScriptElement | null>(null);

    useEffect(() => {
        const scriptId = 'elevenlabs-convai-widget-script';

        // Prevent duplicate script injection
        if (document.getElementById(scriptId) || document.querySelector(`script[src*="convai-widget"]`)) {
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);
        scriptRef.current = script;

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            {/* Holographic Containment Unit */}
            {/* transform-gpu is CRITICAL here to create a new stacking context that constrains fixed children */}
            {/* Holographic Containment Unit */}
            {/* transform-gpu is CRITICAL here to create a new stacking context that constrains fixed children */}
            <div className="relative w-full max-w-[400px] h-[600px] max-h-[85vh] rounded-3xl overflow-hidden flex flex-col transform-gpu bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:border-cyan-500/30">

                {/* Header */}
                <div className="flex-none p-6 border-b border-white/5 bg-gradient-to-r from-slate-900/50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                        <h4 className="text-lg font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient-x">
                            Live Interface
                        </h4>
                    </div>
                </div>

                {/* Widget Area - Flexible Center */}
                <div className="flex-1 relative w-full h-full bg-slate-950/30" aria-label="ElevenLabs Conversation AI Widget">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* @ts-ignore - Custom Element */}
                        <elevenlabs-convai agent-id="agent_5901khehzx57esxahpydfjr8wnpd"></elevenlabs-convai>
                    </div>
                </div>

                {/* Decorative Footer Scanline */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
            </div>
        </div>
    );
};

// --- Main Component ---
export default function CallPlayerModal({ isOpen, onClose }: CallPlayerModalProps) {
    const [view, setView] = useState<ViewState>('MENU');
    const [mounted, setMounted] = useState(false);

    // Demo Player State
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

    // Seeking State
    const [isSeeking, setIsSeeking] = useState(false);

    const soundRef = useRef<Howl | null>(null);
    const requestRef = useRef<number>(0);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    // Mount check for Portal
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Playing Ref for Loop
    const playingRef = useRef(false);

    // Sync state to ref
    useEffect(() => {
        playingRef.current = playing;
        if (playing) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
        }
    }, [playing]);

    // Reset view on open
    useEffect(() => {
        if (isOpen) {
            setView('MENU');
        } else {
            // Stop audio when closed
            soundRef.current?.stop();
            setPlaying(false);
        }
    }, [isOpen]);

    // Cleanup Audio
    useEffect(() => {
        return () => {
            if (soundRef.current) soundRef.current.unload();
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // --- Demo Logic ---
    useEffect(() => {
        const data = mapTranscript(rawTranscript);
        setTranscript(data);
    }, []);

    useEffect(() => {
        if (view !== 'DEMO' || !isOpen) {
            soundRef.current?.stop();
            setPlaying(false);
            return;
        }

        soundRef.current = new Howl({
            src: ['/assets/audio/elevenlabs_demo.mp3'],
            html5: true,
            preload: true,
            onload: () => setDuration(soundRef.current?.duration() || 0),
            onend: () => {
                setPlaying(false);
                setCurrentTime(0);
            },
            // Update time on seek if not dragging
            onseek: () => {
                if (!isSeeking) setCurrentTime(soundRef.current?.seek() as number);
            }
        });

        return () => {
            soundRef.current?.unload();
        };
    }, [view, isOpen]);

    const animate = () => {
        // Read REF, NOT STATE for loop reliability
        if (playingRef.current && soundRef.current) {
            // Only update time from audio if USER is not dragging the slider
            if (!isSeeking) {
                const seek = soundRef.current.seek();
                // Safety check for 'loading' state returning 0 or obj
                const time = typeof seek === 'number' ? seek : 0;

                setCurrentTime(time);

                // --- VISUALIZER MAGIC ---
                // If audio is playing but quiet, FORCE movement so it looks alive
                const isSpeaking = transcript.some(t => t.start <= time && t.end >= time);

                // Base volume from "speaking" status
                let rawVol = isSpeaking ? 0.4 + Math.random() * 0.4 : 0.05;

                // Artificial "Life" - Ensure it never hits 0
                const minVol = 0.2 + Math.random() * 0.1;
                setVolumeLevel(Math.max(rawVol, minVol));
            }
        } else {
            setVolumeLevel(0.1 + Math.random() * 0.05); // Idle breathing
        }
        requestRef.current = requestAnimationFrame(animate);
    };

    // Auto-scroll logic removed as kinetic typography doesn't need it

    const togglePlay = () => {
        if (!soundRef.current) return;
        if (playing) {
            soundRef.current.pause();
        } else {
            soundRef.current.play();
        }
        setPlaying(!playing);
    };

    const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSeeking(true);
        setCurrentTime(Number(e.target.value));
    };

    const onSliderCommit = () => {
        setIsSeeking(false);
        if (soundRef.current) {
            soundRef.current.seek(currentTime);
        }
    };

    const seekBackward = () => {
        const newTime = Math.max(0, currentTime - 10);
        setCurrentTime(newTime);
        if (soundRef.current) soundRef.current.seek(newTime);
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Identify current active segment
    const currentSegment = transcript.find(t => currentTime >= t.start && currentTime <= t.end);

    // Handle Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (view !== 'MENU') setView('MENU');
                else onClose();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, view]);


    if (!mounted) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full h-full max-w-[95vw] max-h-[95vh] rounded-2xl overflow-hidden flex flex-col z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button & Back Button */}
                        <div className="absolute top-6 right-6 z-50 flex gap-4">
                            {view !== 'MENU' && (
                                <button
                                    onClick={() => setView('MENU')}
                                    className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95 flex items-center gap-2 px-6"
                                    aria-label="Back to Menu"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Back to Menu</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95"
                                aria-label="Close Modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* VIEWS */}
                        <AnimatePresence mode="wait">
                            {view === 'MENU' && (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full h-full"
                                >
                                    <MenuView onSelect={setView} />
                                </motion.div>
                            )}

                            {view === 'LIVE' && (
                                <motion.div
                                    key="live"
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full h-full"
                                >
                                    <LiveView />
                                </motion.div>
                            )}

                            {view === 'DEMO' && (
                                <motion.div
                                    key="demo"
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-full h-full"
                                >
                                    <div className="flex h-full w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex-col shadow-2xl relative">
                                        {/* Cinematic Background */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20 pointer-events-none" />

                                        {/* Header */}
                                        <div className="flex items-center justify-between px-8 py-6 z-10">
                                            <h2 className="text-xl font-medium text-white/80 tracking-wide flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                                Call Recording Intelligence
                                            </h2>
                                        </div>

                                        {/* Cinematic Stage */}
                                        <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 md:px-24">
                                            {/* ... existing demo content ... */}


                                            {/* 1. Top Section: Avatars */}
                                            <div className="flex items-center justify-center gap-16 md:gap-32 w-full mb-16 relative">
                                                {/* Spectrum Background */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-32 flex items-center justify-center gap-1 opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
                                                    {Array.from({ length: 60 }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-1.5 rounded-full transition-all duration-75 ease-linear ${i % 3 === 0 ? 'bg-blue-500' : 'bg-cyan-400'}`}
                                                            style={{
                                                                height: `${Math.max(10, Math.random() * 80 * (volumeLevel * 4))}%`,
                                                                opacity: Math.max(0.2, volumeLevel)
                                                            }}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Connector Line */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                                                {/* Agent Avatar */}
                                                <div className={`relative flex flex-col items-center gap-4 transition-all duration-500 ${currentSegment?.speaker === 'agent' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 grayscale-[0.3]'}`}>
                                                    <div className="relative">
                                                        <div className={`absolute inset-0 bg-cyan-500/20 blur-xl rounded-full transition-opacity duration-300 ${currentSegment?.speaker === 'agent' ? 'opacity-100' : 'opacity-0'}`} />
                                                        <div className="w-24 h-24 rounded-full border border-cyan-500/30 bg-slate-900 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                                            {/* AudioOrb - Siri Style */}
                                                            <div className="scale-125">
                                                                <AudioOrb isActive={true} volume={currentSegment?.speaker === 'agent' ? volumeLevel : 0.1} speaker="agent" />
                                                            </div>
                                                        </div>
                                                        {currentSegment?.speaker === 'agent' && (
                                                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/50 shadow-lg uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                                                <span>Speaking</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-cyan-400 font-medium tracking-wide transition-opacity ${currentSegment?.speaker === 'agent' ? 'opacity-100' : 'opacity-50'}`}>AI Agent</span>
                                                    </div>
                                                </div>

                                                {/* Sales Manager Avatar */}
                                                <div className={`relative flex flex-col items-center gap-4 transition-all duration-500 ${currentSegment?.speaker === 'user' ? 'scale-110 opacity-100' : 'scale-100 opacity-60 grayscale-[0.3]'}`}>
                                                    <div className="relative">
                                                        <div className={`absolute inset-0 bg-white/20 blur-xl rounded-full transition-opacity duration-300 ${currentSegment?.speaker === 'user' ? 'opacity-100' : 'opacity-0'}`} />
                                                        <div className="w-24 h-24 rounded-full border border-white/30 bg-slate-900 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden">
                                                            {/* AudioOrb - User Style */}
                                                            <div className="scale-125">
                                                                <AudioOrb isActive={true} volume={currentSegment?.speaker === 'user' ? volumeLevel : 0.1} speaker="user" />
                                                            </div>
                                                        </div>
                                                        {currentSegment?.speaker === 'user' && (
                                                            <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/50 shadow-lg uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                                <span>Speaking</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-white font-medium tracking-wide transition-opacity ${currentSegment?.speaker === 'user' ? 'opacity-100' : 'opacity-50'}`}>Sales Manager</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Center Section: Kinetic Typography */}
                                            <div className="min-h-[160px] w-full max-w-4xl flex items-center justify-center text-center">
                                                <AnimatePresence mode='wait'>
                                                    {currentSegment ? (
                                                        <motion.div
                                                            key={currentSegment.start} // Key change triggers animation
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="w-full"
                                                        >
                                                            <KaraokeText
                                                                words={currentSegment.words}
                                                                currentTime={currentTime}
                                                                isAgent={currentSegment.speaker === 'agent'}
                                                            />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 0.5 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex gap-2"
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }} />
                                                            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Controls */}
                                        <div className="h-32 border-t border-white/5 bg-slate-900/50 backdrop-blur-md px-8 md:px-12 flex flex-col justify-center gap-6 z-20">
                                            {/* Slider */}
                                            <div className="relative h-2 group w-full">
                                                <div className="absolute inset-0 bg-slate-800/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full relative"
                                                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                                    />
                                                </div>
                                                {/* Thumb (Visual) */}
                                                <div
                                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none"
                                                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: `translate(-50%, -50%) scale(${isSeeking ? 1.2 : 1})` }}
                                                />

                                                {/* Input (Interactable) */}
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={duration}
                                                    step={0.1}
                                                    value={currentTime}
                                                    onChange={onSliderChange}
                                                    onMouseUp={onSliderCommit}
                                                    onTouchEnd={onSliderCommit}
                                                    className="absolute inset-0 w-full h-8 -top-3 cursor-pointer opacity-0 z-10"
                                                />
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono text-slate-400 w-16">{formatTime(currentTime)}</span>

                                                <div className="flex items-center gap-6">
                                                    <button onClick={seekBackward} className="p-4 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-full" aria-label="Seek Backward 10 Seconds">
                                                        <RotateCcw size={20} />
                                                    </button>

                                                    <button
                                                        onClick={togglePlay}
                                                        className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                        aria-label={playing ? "Pause Demo" : "Play Demo"}
                                                    >
                                                        {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                                    </button>
                                                </div>

                                                <span className="text-xs font-mono text-slate-400 w-16 text-right">{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div >
            )}
        </AnimatePresence >,
        document.body
    );
}
