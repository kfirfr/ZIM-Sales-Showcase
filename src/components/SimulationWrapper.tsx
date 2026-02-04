'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulationWrapperProps {
    children: (props: { isRunning: boolean }) => ReactNode;
    label: string;
}

export default function SimulationWrapper({ children, label }: SimulationWrapperProps) {
    const [isRunning, setIsRunning] = useState(false);

    const toggleSimulation = () => {
        setIsRunning(!isRunning);
    };

    return (
        <div className="w-full h-full flex flex-col relative group">
            {/* Simulation Content */}
            <div className="flex-grow w-full h-full relative overflow-hidden">
                {children({ isRunning })}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                <button
                    onClick={toggleSimulation}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-sm font-mono font-bold text-white hover:bg-slate-800 transition-colors shadow-lg"
                >
                    {isRunning ? <Pause size={14} className="text-teal-400" /> : <Play size={14} className="text-teal-400" />}
                    {isRunning ? 'PAUSE' : 'START SIM'}
                </button>
                <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-gray-400 font-mono">
                    {label}
                </div>
            </div>
        </div>
    );
}
