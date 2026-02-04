import React from 'react';
import { Play, Square, Zap, Activity, ShieldCheck, Globe, CheckSquare, AlertTriangle, ArrowUp, ThumbsUp, Loader2, Check } from 'lucide-react';

// Map of icon names to Lucide components
const IconMap: { [key: string]: React.ElementType } = {
    Play, Square, Zap, Activity, ShieldCheck, Globe, CheckSquare, AlertTriangle, ArrowUp, ThumbsUp, Loader2, Check
};

interface BoxHeaderProps {
    title: string;
    sub: string;
    icon: string;
    color: string;
    isPlaying: boolean;
    onToggle: () => void;
}

export const BoxHeader: React.FC<BoxHeaderProps> = ({ title, sub, icon, color, isPlaying, onToggle }) => {
    const IconComponent = IconMap[icon] || Zap;

    // Map color names to Tailwind classes dynamically is tricky with full purge, 
    // so we'll use a safer approach or just inline styles if needed, 
    // but the original code used string interpolation like `from-${color}-900`.
    // In Tailwind, dynamic class names like `bg-${color}-500` don't work if the full class isn't scanned.
    // For this specific set (green, blue, purple, orange), I'll use a lookup or just standard styles.
    // However, since the user wants to keep the design "stunning", I should try to preserve the logic.
    // I will use a lookup for the specific color variations to be safe.

    const colorStyles: { [key: string]: { border: string, bgIcon: string, textIcon: string, sub: string, gradient: string } } = {
        green: {
            border: 'border-emerald-500/50',
            bgIcon: 'bg-emerald-500/20',
            textIcon: 'text-emerald-400',
            sub: 'text-emerald-300',
            gradient: 'from-emerald-900/40'
        },
        blue: {
            border: 'border-blue-500/50',
            bgIcon: 'bg-blue-500/20',
            textIcon: 'text-blue-400',
            sub: 'text-blue-300',
            gradient: 'from-blue-900/40'
        },
        purple: {
            border: 'border-purple-500/50',
            bgIcon: 'bg-purple-500/20',
            textIcon: 'text-purple-400',
            sub: 'text-purple-300',
            gradient: 'from-purple-900/40'
        },
        orange: {
            border: 'border-orange-500/50',
            bgIcon: 'bg-orange-500/20',
            textIcon: 'text-orange-400',
            sub: 'text-orange-300',
            gradient: 'from-orange-900/40'
        }
    };

    const style = colorStyles[color] || colorStyles['green'];

    return (
        <div className={`p-5 border-b border-white/5 bg-gradient-to-r ${style.gradient} to-transparent flex justify-between items-center relative z-20`}>
            <div className="flex items-center gap-3">
                <div className={`p-2.5 ${style.bgIcon} rounded-xl ${style.textIcon} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                    <IconComponent size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white shadow-black drop-shadow-md">{title}</h3>
                    <p className={`text-[9px] ${style.sub} uppercase tracking-wider font-bold`}>{sub}</p>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`btn-play w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-50 ${isPlaying ? 'active' : 'text-white'}`}
            >
                {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="none" />}
            </button>
        </div>
    );
};
