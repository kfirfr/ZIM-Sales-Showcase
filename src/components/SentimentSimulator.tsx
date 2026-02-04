'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCRIPT = [
    { sender: 'bot', text: "Hello! I'm your ZIM virtual assistant. How can I help you today?" },
    { sender: 'user', text: "Where is my shipment? It's been stuck for 5 days!" },
    { sender: 'bot', text: "I apologize for the wait. Let me check your tracking ID." },
    { sender: 'user', text: "This delay is unacceptable. I'm very upset with this service." }, // Risk trigger
    { sender: 'bot', text: "I completely understand your frustration. I've escalated this to a priority agent immediately." },
    { sender: 'user', text: "Okay, thank you. I just need it resolved." },
    { sender: 'bot', text: "We are on it. An agent will contact you within 15 minutes." }
];

interface SentimentSimulatorProps {
    isRunning: boolean;
    onRiskUpdate: (count: number) => void;
}

export default function SentimentSimulator({ isRunning, onRiskUpdate }: SentimentSimulatorProps) {
    const [messages, setMessages] = useState<typeof SCRIPT>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRiskHigh, setIsRiskHigh] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && currentIndex < SCRIPT.length) {
            interval = setInterval(() => {
                const nextMsg = SCRIPT[currentIndex];
                setMessages(prev => [...prev, nextMsg]);
                setCurrentIndex(prev => prev + 1);

                // Check for risk keywords
                if (nextMsg.sender === 'user' && (nextMsg.text.toLowerCase().includes('delay') || nextMsg.text.toLowerCase().includes('upset'))) {
                    setIsRiskHigh(true);
                    onRiskUpdate(1); // Increment risk counter
                }

                // Resolve risk later
                if (nextMsg.sender === 'bot' && nextMsg.text.includes('escalated')) {
                    setTimeout(() => setIsRiskHigh(false), 2000);
                }

            }, 2000);
        }

        return () => clearInterval(interval);
    }, [isRunning, currentIndex, onRiskUpdate]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={`w-full h-full flex flex-col p-4 transition-colors duration-500 ${isRiskHigh ? 'border-4 border-rose-500/50 bg-rose-500/10' : ''}`}>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'bot'
                                    ? 'bg-slate-700 text-white rounded-tl-sm'
                                    : 'bg-teal-600 text-white rounded-tr-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isRunning && currentIndex < SCRIPT.length && (
                    <div className="text-xs text-gray-500 animate-pulse ml-2">Typewriter...</div>
                )}
            </div>

            {/* Status Overlay */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">STATUS: {isRunning ? 'LIVE LISTENING' : 'PAUSED'}</span>
                <span className={`${isRiskHigh ? 'text-rose-400 animate-pulse font-bold' : 'text-emerald-400'}`}>
                    {isRiskHigh ? '⚠ NEGATIVE SENTIMENT DETECTED' : '● SENTIMENT STABLE'}
                </span>
            </div>
        </div>
    );
}
