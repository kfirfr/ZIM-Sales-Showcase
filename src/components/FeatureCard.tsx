"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";

import { FeatureCardProvider } from "./FeatureCardContext";

export type FeatureColor = 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'gold' | 'rose' | 'indigo' | 'teal';

interface FeatureCardProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    badge?: string;
    color?: FeatureColor;
}

const colorVariants: Record<FeatureColor, {
    borderColor: string;
    glowColor: string;
    badgeClass: string;
    separatorClass: string;
    titleGradientClass: string;
}> = {
    blue: {
        borderColor: "rgba(59, 130, 246, 0.5)", // blue-500
        glowColor: "rgba(59, 130, 246, 0.15)",
        badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        separatorClass: "from-blue-500",
        titleGradientClass: "from-blue-400 to-blue-200"
    },
    green: {
        borderColor: "rgba(16, 185, 129, 0.5)", // emerald-500
        glowColor: "rgba(16, 185, 129, 0.15)",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        separatorClass: "from-emerald-500",
        titleGradientClass: "from-emerald-400 to-emerald-200"
    },
    purple: {
        borderColor: "rgba(168, 85, 247, 0.5)", // purple-500
        glowColor: "rgba(168, 85, 247, 0.15)",
        badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        separatorClass: "from-purple-500",
        titleGradientClass: "from-purple-400 to-purple-200"
    },
    orange: {
        borderColor: "rgba(249, 115, 22, 0.5)", // orange-500
        glowColor: "rgba(249, 115, 22, 0.15)",
        badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        separatorClass: "from-orange-500",
        titleGradientClass: "from-orange-400 to-orange-200"
    },
    cyan: {
        borderColor: "rgba(6, 182, 212, 0.5)", // cyan-500
        glowColor: "rgba(6, 182, 212, 0.15)",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        separatorClass: "from-cyan-500",
        titleGradientClass: "from-cyan-400 to-cyan-200"
    },
    gold: {
        borderColor: "rgba(234, 179, 8, 0.5)", // yellow-500
        glowColor: "rgba(234, 179, 8, 0.15)",
        badgeClass: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
        separatorClass: "from-yellow-500",
        titleGradientClass: "from-yellow-400 to-yellow-200"
    },
    rose: {
        borderColor: "rgba(244, 63, 94, 0.5)", // rose-500
        glowColor: "rgba(244, 63, 94, 0.15)",
        badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        separatorClass: "from-rose-500",
        titleGradientClass: "from-rose-400 to-rose-200"
    },
    indigo: {
        borderColor: "rgba(99, 102, 241, 0.5)", // indigo-500
        glowColor: "rgba(99, 102, 241, 0.15)",
        badgeClass: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
        separatorClass: "from-indigo-500",
        titleGradientClass: "from-indigo-400 to-indigo-200"
    },
    teal: {
        borderColor: "rgba(45, 212, 191, 0.5)", // teal-400
        glowColor: "rgba(45, 212, 191, 0.15)",
        badgeClass: "bg-zim-teal/10 text-zim-teal border border-zim-teal/20",
        separatorClass: "from-zim-teal",
        titleGradientClass: "from-zim-teal to-teal-200"
    }
};

export const FeatureCard = ({ title, description, badge, children, color = 'teal' }: FeatureCardProps) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const variant = colorVariants[color] || colorVariants.teal;

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            className="group relative rounded-2xl border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.02] flex flex-col"
            onMouseMove={handleMouseMove}
            whileHover={{ borderColor: variant.borderColor }}
        >
            <FeatureCardProvider>
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                              800px circle at ${mouseX}px ${mouseY}px,
                              ${variant.glowColor},
                              transparent 80%
                            )
                          `,
                    }}
                />

                <div className="relative flex flex-col h-full z-10">
                    <div className="p-8 pb-0">
                        <div className="flex items-center justify-between mb-4">
                            {badge && (
                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${variant.badgeClass}`}>
                                    {badge}
                                </span>
                            )}
                            <div className={`w-8 h-1 rounded bg-gradient-to-r ${variant.separatorClass} to-transparent opacity-50`} />
                        </div>

                        <AnimatedTitle className={`text-2xl mb-2 bg-clip-text text-transparent bg-gradient-to-r ${variant.titleGradientClass}`} as="h3">
                            {title}
                        </AnimatedTitle>

                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            {description}
                        </p>
                    </div>

                    {/* Simulation Container - Edge to Edge */}
                    <div className="mt-auto overflow-hidden relative w-full h-auto min-h-[420px] flex flex-col rounded-b-2xl">
                        <div className="flex-1 w-full relative">
                            {children}
                        </div>
                    </div>
                </div>
            </FeatureCardProvider>
        </motion.div>
    );
};
