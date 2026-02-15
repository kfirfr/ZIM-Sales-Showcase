import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface KaraokeTextProps {
    words: { text: string; start: number; end: number }[];
    currentTime: number;
    isAgent: boolean;
}

export const KaraokeText: React.FC<KaraokeTextProps> = ({ words, currentTime, isAgent }) => {
    return (
        <div className="flex flex-wrap items-center justify-center text-2xl md:text-3xl leading-relaxed tracking-wide font-light text-center">
            {words.map((word, index) => {
                const isActive = currentTime >= word.start && currentTime <= word.end;
                const isPast = currentTime > word.end;

                // Determine styling based on state
                let className = "transition-all duration-300 inline-block mx-1.5 my-1";

                if (isActive) {
                    // Active word: Bright, scaled up slightly
                    className += isAgent ? " text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : " text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
                } else if (isPast) {
                    // Past words: Visible but normal weight
                    className += " text-slate-300";
                } else {
                    // Future words: Visible but inactive (User request: text-slate-600 opacity-60)
                    className += " text-slate-600 opacity-60 blur-[0.5px]";
                }

                return (
                    <motion.span
                        key={`${index}-${word.start}`}
                        className={className}
                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        {word.text}
                    </motion.span>
                );
            })}
        </div>
    );
};
