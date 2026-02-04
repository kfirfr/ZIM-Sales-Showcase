"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { CXOrchestratorVisual } from "./CXOrchestratorVisual";
import { BackgroundNeuralStars } from "./BackgroundNeuralStars";

export const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1.1, 0.9]);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section
            ref={containerRef}
            className="relative flex flex-col items-center justify-start pt-32 pb-8 perspective-1000 overflow-visible z-10"
        >
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-zim-teal/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Unified "Futuristic Box" Container */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-4">
                <motion.div
                    ref={boxRef}
                    onMouseMove={handleMouseMove}
                    className="relative w-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] group"
                >
                    <BackgroundNeuralStars className="absolute inset-0 w-full h-full -z-10 opacity-50" />

                    {/* Holographic Gradient Hover Effect (Quattro Colors) - Mouse Follow */}
                    <motion.div
                        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            background: useMotionTemplate`
                                radial-gradient(
                                  600px circle at ${mouseX}px ${mouseY}px,
                                  rgba(45, 212, 191, 0.2), 
                                  transparent 80%
                                ),
                                radial-gradient(
                                  450px circle at ${mouseX}px ${mouseY}px,
                                  rgba(59, 130, 246, 0.2),
                                  transparent 60%
                                ),
                                radial-gradient(
                                  300px circle at ${mouseX}px ${mouseY}px,
                                  rgba(168, 85, 247, 0.2),
                                  transparent 40%
                                ),
                                radial-gradient(
                                   150px circle at ${mouseX}px ${mouseY}px,
                                   rgba(249, 115, 22, 0.15),
                                   transparent 30%
                                )
                              `,
                        }}
                    />

                    {/* Border Glow Follow */}
                    <div className="absolute inset-0 rounded-3xl z-0 pointer-events-none transition-opacity duration-300">
                        {/* Static low opacity border */}
                        <div className="absolute inset-0 rounded-3xl border border-white/5" />
                    </div>

                    {/* Left Side: Text Content (60%) */}
                    <div className="w-full lg:w-[60%] text-left space-y-6 z-30 relative pr-0 lg:pr-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="relative z-20"
                        >
                            {/* Optical alignment nudge to match the paragraph text below */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white mb-6 -ml-[4px]">
                                <span className="quattro-gradient">AI & CX<br />Orchestration</span>
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed relative z-20"
                        >
                            Identifying and creating the ideal end-to-end journey for each customer, improving both their experience and our business outcomes.
                        </motion.p>
                    </div>

                    {/* Right Side: Visual (40%) */}
                    <div className="w-full lg:w-[40%] h-[400px] lg:h-[500px] relative z-20 mt-8 lg:mt-0 flex items-center justify-center">
                        <div className="w-full h-full relative scale-110">
                            <CXOrchestratorVisual />
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};
