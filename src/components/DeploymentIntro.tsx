"use client";

import React, { useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { AnimatedTitle } from "./AnimatedTitle";

interface DeploymentIntroProps {
    onReached?: () => void;
}

const features = [
    { label: "Sales Meeting AI Summary", color: "from-green-400 to-emerald-500" },
    { label: "Transcript Translation Hub", color: "from-indigo-400 to-blue-500" },
    { label: "Call Recording Intelligence", color: "from-purple-400 to-violet-500" },
    { label: "Speech & Text Analytics", color: "from-amber-400 to-yellow-500" },
    { label: "Supervisor Performance Dashboard", color: "from-pink-400 to-rose-500" },
    { label: "AI Post-Call Summary", color: "from-cyan-400 to-blue-500" },
    { label: "Sales Direct Genesys Lines", color: "from-blue-400 to-sky-500" },
    { label: "Automated Sales Evaluation", color: "from-yellow-400 to-orange-500" },
];

export const DeploymentIntro = ({ onReached }: DeploymentIntroProps) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { margin: "-100px 0px", amount: 0.5 });

    useEffect(() => {
        if (isInView && onReached) {
            onReached();
        }
    }, [isInView, onReached]);

    return (
        <section id="deployments" ref={ref} className="relative py-20 flex flex-col items-center justify-center overflow-visible w-full text-center px-4">

            {/* Title Block */}
            <div className="mb-8">
                <AnimatedTitle as="h2" className="text-4xl md:text-6xl lg:text-7xl mb-2 tracking-tight">
                    Genesys AI for Sales
                </AnimatedTitle>
            </div>

            {/* Subtext */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12"
            >
                Accelerate revenue with native AI that unifies voice, digital, and CRM workflows for the modern sales team.
            </motion.p>

            {/* Holographic Feature Modules */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-7xl px-4 z-10">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                        className="group relative"
                    >
                        {/* Glow Behind */}
                        <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} opacity-20 group-hover:opacity-60 blur-lg transition-opacity duration-500`} />

                        {/* Glass Module */}
                        <div className="relative px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-300 transform group-hover:-translate-y-1">

                            {/* Scanline Effect */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]" />

                            {/* Content */}
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} animate-pulse`} />
                                <span className="text-sm font-bold text-slate-200 tracking-wide whitespace-nowrap">
                                    {feature.label}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
