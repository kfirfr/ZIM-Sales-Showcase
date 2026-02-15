"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useInView } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";
import { FeatureCardProvider } from "./FeatureCardContext";

export type FeatureColor = 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'gold' | 'rose' | 'indigo' | 'teal';

interface ObsidianFeatureCardProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    badge?: string;
    color?: FeatureColor;
    className?: string; // Allow custom classes for responsive sizing
}

const colorVariants: Record<FeatureColor, {
    glowColor: string;
    badgeClass: string;
    titleGradientClass: string;
    borderGlow: string;
}> = {
    blue: {
        glowColor: "rgba(59, 130, 246, 0.15)",
        badgeClass: "bg-blue-900/40 text-blue-300 border border-blue-500/30",
        titleGradientClass: "from-blue-100 to-blue-400",
        borderGlow: "group-hover:border-blue-500/30"
    },
    green: {
        glowColor: "rgba(16, 185, 129, 0.15)",
        badgeClass: "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30",
        titleGradientClass: "from-emerald-100 to-emerald-400",
        borderGlow: "group-hover:border-emerald-500/30"
    },
    purple: {
        glowColor: "rgba(168, 85, 247, 0.15)",
        badgeClass: "bg-purple-900/40 text-purple-300 border border-purple-500/30",
        titleGradientClass: "from-purple-100 to-purple-400",
        borderGlow: "group-hover:border-purple-500/30"
    },
    orange: {
        glowColor: "rgba(249, 115, 22, 0.15)",
        badgeClass: "bg-orange-900/40 text-orange-300 border border-orange-500/30",
        titleGradientClass: "from-orange-100 to-orange-400",
        borderGlow: "group-hover:border-orange-500/30"
    },
    cyan: {
        glowColor: "rgba(6, 182, 212, 0.15)",
        badgeClass: "bg-cyan-900/40 text-cyan-300 border border-cyan-500/30",
        titleGradientClass: "from-cyan-100 to-cyan-400",
        borderGlow: "group-hover:border-cyan-500/30"
    },
    gold: {
        glowColor: "rgba(234, 179, 8, 0.15)",
        badgeClass: "bg-yellow-900/40 text-yellow-300 border border-yellow-500/30",
        titleGradientClass: "from-yellow-100 to-yellow-400",
        borderGlow: "group-hover:border-yellow-500/30"
    },
    rose: {
        glowColor: "rgba(244, 63, 94, 0.15)",
        badgeClass: "bg-rose-900/40 text-rose-300 border border-rose-500/30",
        titleGradientClass: "from-rose-100 to-rose-400",
        borderGlow: "group-hover:border-rose-500/30"
    },
    indigo: {
        glowColor: "rgba(99, 102, 241, 0.15)",
        badgeClass: "bg-indigo-900/40 text-indigo-300 border border-indigo-500/30",
        titleGradientClass: "from-indigo-100 to-indigo-400",
        borderGlow: "group-hover:border-indigo-500/30"
    },
    teal: {
        glowColor: "rgba(45, 212, 191, 0.15)",
        badgeClass: "bg-teal-900/40 text-teal-300 border border-teal-500/30",
        titleGradientClass: "from-teal-100 to-teal-400",
        borderGlow: "group-hover:border-teal-500/30"
    }
};

export const ObsidianFeatureCard = ({ title, description, badge, children, color = 'teal', className = '' }: ObsidianFeatureCardProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const variant = colorVariants[color] || colorVariants.teal;
    const containerRef = useRef<HTMLDivElement>(null);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative rounded-3xl obsidian-glass overflow-hidden transition-all duration-500 ${className} ${variant.borderGlow}`}
            onMouseMove={handleMouseMove}
        >
            {/* Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100 z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          600px circle at ${mouseX}px ${mouseY}px,
                          ${variant.glowColor},
                          transparent 60%
                        )
                      `,
                }}
            />

            {/* Inner Content */}
            <FeatureCardProvider>
                <div className="relative z-20 flex flex-col h-full">

                    {/* Header Portion */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            {badge && (
                                <span className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold ${variant.badgeClass} backdrop-blur-md`}>
                                    {badge}
                                </span>
                            )}
                            {/* Decorative dot */}
                            <div className={`w-1.5 h-1.5 rounded-full ${variant.badgeClass.replace('bg-', 'bg-').split(' ')[0]} animate-pulse`} />
                        </div>

                        <AnimatedTitle className={`text-3xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${variant.titleGradientClass}`} as="h3">
                            {title}
                        </AnimatedTitle>

                        <p className="text-slate-400/90 leading-relaxed text-sm font-light">
                            {description}
                        </p>
                    </div>

                    {/* Content/Simulation Area - Grows to fill */}
                    <div ref={containerRef} className="flex-1 w-full relative min-h-[400px] mt-4 overflow-hidden rounded-b-3xl transform-gpu will-change-transform bg-slate-950/20">
                        {/* Subtle gradient overlay at top of sim area to blend with header */}
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />

                        <div className="w-full h-full">
                            {children}
                        </div>
                    </div>
                </div>
            </FeatureCardProvider>

        </div>
    );
};
