import React from 'react';

interface AudioOrbProps {
    isActive: boolean;
    volume: number;
    speaker: 'agent' | 'user';
}

export const AudioOrb = ({ isActive, volume, speaker }: AudioOrbProps) => {
    const isAgent = speaker === 'agent';
    const baseColor = isAgent ? 'bg-cyan-400' : 'bg-blue-500';
    const volumeBoost = Math.max(volume, 0.1);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Liquid Filter Container */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ filter: 'blur(8px) contrast(20)' }}>
                {/* Background Blob */}
                <div className={`absolute w-16 h-16 rounded-full ${baseColor} opacity-50`} />
                {/* Moving Blobs */}
                <div
                    className={`absolute w-14 h-14 rounded-full ${baseColor} animate-[spin_3s_linear_infinite]`}
                    style={{
                        transform: `translate(${Math.sin(Date.now() / 500) * 20 * volumeBoost}px, ${Math.cos(Date.now() / 500) * 20 * volumeBoost}px)`,
                        opacity: 0.8
                    }}
                />
                <div
                    className={`absolute w-12 h-12 rounded-full ${baseColor} animate-[spin_4s_reverse_linear_infinite]`}
                    style={{
                        transform: `translate(${Math.cos(Date.now() / 600) * -20 * volumeBoost}px, ${Math.sin(Date.now() / 600) * -20 * volumeBoost}px)`,
                        opacity: 0.7
                    }}
                />
            </div>

            {/* Ring & Shockwave */}
            <div className={`absolute inset-0 rounded-full border border-white/10 shadow-inner`} />
            <div
                className={`absolute inset-[-10%] rounded-full border border-${isAgent ? 'cyan' : 'blue'}-500/30 transition-all duration-75`}
                style={{ transform: `scale(${1 + volume})`, opacity: volume }}
            />
        </div>
    );
};
