'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

interface AutoEvalSimulatorProps {
    isRunning: boolean;
    onComplete: () => void;
}

const CRITERIA = [
    { id: 1, label: "Greeting Standard Met", score: 10 },
    { id: 2, label: "Empathy Displayed", score: 10 },
    { id: 3, label: "Solution Proposed", score: 20 },
    { id: 4, label: "Closing Standard Met", score: 10 },
    { id: 5, label: "Sentiment Positive", score: 10 },
];

export default function AutoEvalSimulator({ isRunning, onComplete }: AutoEvalSimulatorProps) {
    const [checkedItems, setCheckedItems] = useState<number[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setCheckedItems(prev => {
                    if (prev.length < CRITERIA.length) {
                        const nextId = CRITERIA[prev.length].id;
                        // Check if this fulfills the eval
                        if (prev.length + 1 === CRITERIA.length) {
                            onComplete();
                        }
                        return [...prev, nextId];
                    }
                    // Reset for loop effect
                    if (prev.length === CRITERIA.length) {
                        return [];
                    }
                    return prev;
                });
            }, 800);
        }

        return () => clearInterval(interval);
    }, [isRunning, onComplete]);

    return (
        <div className="w-full h-full flex flex-row gap-4 p-4">
            {/* Fake Transcript Scrolling */}
            <div className="w-1/2 h-full overflow-hidden bg-black/20 rounded-lg p-3 space-y-2 opacity-50 relative">
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-900/50 to-transparent z-10" />
                <div className={`space-y-3 transition-transform duration-[2000ms] ease-linear ${isRunning ? '-translate-y-full' : ''}`}>
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-4 bg-white/10 rounded w-full animate-pulse" style={{ width: `${Math.random() * 50 + 40}%` }} />
                    ))}
                </div>
            </div>

            {/* Evaluation Form */}
            <div className="w-1/2 h-full flex flex-col gap-3">
                <h4 className="text-sm font-mono text-gray-400 border-b border-white/10 pb-2">AI QUALITY SCORECARD</h4>
                {CRITERIA.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                        <motion.div
                            key={item.id}
                            initial={false}
                            animate={{ opacity: isChecked ? 1 : 0.4 }}
                            className="flex items-center gap-2 text-sm"
                        >
                            {isChecked ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    <CheckCircle2 size={16} className="text-teal-400" />
                                </motion.div>
                            ) : (
                                <Circle size={16} className="text-gray-600" />
                            )}
                            <span className={isChecked ? 'text-white' : 'text-gray-500'}>{item.label}</span>
                            {isChecked && <span className="ml-auto text-xs font-mono text-emerald-400">+{item.score}</span>}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
