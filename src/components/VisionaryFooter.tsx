"use client";

import React from 'react';
import dynamic from 'next/dynamic';





const ZIM_LOGO_URL = "https://npkyfnkpkuovnplylxot.supabase.co/storage/v1/object/public/ZIM/zim80-logo-313x112-white.png";

// THE KEY DATA - Aligned with User Request & "Quattro Gradient" Logic
// Roadmap data removed

export const VisionaryFooter = () => {
    // Hover state for interactive "hologram" cards
    // State removed

    return (
        <footer id="roadmap" className="relative w-full pt-32 pb-12 overflow-hidden">
            {/* 1. SEAMLESS BACKGROUND BLEND */}
            {/* Fully transparent at top, gradually darkening only at the very bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#030712] to-transparent pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to top, #030712 0%, rgba(3, 7, 18, 0.6) 15%, transparent 30%)' }}
            />

            {/* Noise texture only at bottom to avoid any visual artifacts */}
            <div className="absolute bottom-0 left-0 right-0 h-[30%] opacity-10 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
            />




            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">


                {/* 6. FOOTER SIGNATURE */}
                <div className="w-full flex flex-col md:flex-row justify-between items-end border-t border-white/5 pt-12 pb-4 opacity-50 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex flex-col gap-4">
                        <div className="h-8 flex items-center">
                            <img src={ZIM_LOGO_URL} alt="ZIM" className="h-full w-auto object-contain opacity-80" />
                        </div>
                        <div className="text-sm md:text-base font-bold tracking-tight quattro-gradient">
                            Kfir Frank · Kfir@Frank.ky
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 text-right">
                        <h4 className="text-lg md:text-xl font-light text-white/90 italic leading-relaxed">
                            "The Future is a Choice.<br />
                            <span className="quattro-gradient not-italic font-black text-2xl md:text-3xl tracking-tight">Let's Orchestrate it.</span>"
                        </h4>
                    </div>
                </div>

            </div>


            {/* Global Animation Styles for this component only */}
            <style jsx global>{`
                @keyframes gradient-flow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animate-gradient-flow {
                    animation: gradient-flow 3s linear infinite;
                }
            `}</style>
        </footer >
    );
};
