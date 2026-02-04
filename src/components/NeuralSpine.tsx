"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const NeuralSpine = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    // The Pure Beam: A straight, surgical line of data.
    const gradId = "spine-flow-beam";

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="relative w-full h-[180px] flex justify-center items-start overflow-visible z-0 pointer-events-none -mt-4"
        >
            {/* 
               We use a simple 2px wide SVG for maximum precision and performance.
               No arrow. Just the stream.
            */}
            <svg
                width="2"
                height="180"
                viewBox="0 0 2 180"
                className="overflow-visible"
            >
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="100%">
                        {/* 
                            VIBRANT QUATTRO GRADIENT (Title Match)
                            High saturation, matching "AI CX Orchestration".
                            Blue -> Green -> Purple -> Orange
                        */}
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />

                        <stop offset="15%" stopColor="#60a5fa" stopOpacity="1" /> {/* Blue */}
                        <stop offset="40%" stopColor="#34d399" stopOpacity="1" /> {/* Green */}

                        <stop offset="60%" stopColor="#a78bfa" stopOpacity="1" /> {/* Purple */}
                        <stop offset="85%" stopColor="#fb923c" stopOpacity="1" /> {/* Orange */}

                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                    </linearGradient>

                    {/* Restored Glow for "Effect" Match */}
                    <filter id="glow-beam" x="-50%" y="-50%" width="300%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 1. The Track (faint guide) */}
                <rect
                    x="0" y="0" width="2" height="180"
                    fill="rgba(255,255,255,0.02)"
                    rx="1"
                />

                {/* 2. The Flowing BEAM */}
                <g filter="url(#glow-beam)">
                    <mask id="beam-mask">
                        <rect x="0" y="0" width="2" height="180" rx="1" fill="white" />
                    </mask>

                    <g mask="url(#beam-mask)">
                        {/* 
                            Infinite Scroll: Top to Bottom.
                            Two rects looping y: -180 -> 0 and 0 -> 180.
                        */}
                        <motion.rect
                            x="0"
                            width="2" height="180"
                            fill={`url(#${gradId})`}
                            initial={{ y: -180 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.rect
                            x="0"
                            width="2" height="180"
                            fill={`url(#${gradId})`}
                            initial={{ y: 0 }}
                            animate={{ y: 180 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                    </g>
                </g>

                {/* 3. The Terminal Node (Optional: A tiny fading dot at bottom?) 
                    The user said "stay just with the spine". 
                    So we end cleanly. 
                    Maybe a tiny "emitter" flare at the top?
                    No, keep it minimal.
                */}
            </svg>
        </motion.div>
    );
};
