"use client";

import React from "react";
import { motion } from "framer-motion";

interface SimulationContainerProps {
    title: string;
    description: string;
    children: React.ReactNode;
    kpiPanel: React.ReactNode;
    status: "live" | "future";
}

export default function SimulationContainer({
    title,
    description,
    children,
    kpiPanel,
    status,
}: SimulationContainerProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Header Info (Inside Card) */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className={`w-2 h-2 rounded-full ${status === "live" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gen-orange shadow-[0_0_10px_#f97316]"
                                }`}
                        />
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                            {status === "live" ? "System Active" : "In Development"}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{title}</h3>
                    <p className="text-zinc-400 text-sm max-w-md">{description}</p>
                </div>
                <div className="hidden md:block">
                    {/* Optional Top-Right Action/Status */}
                    <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-mono text-zim-teal">
                        AI_MODULE_V4.2
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Column: The Engine */}
                <div className="lg:col-span-8 h-full min-h-[400px]">
                    <div className="h-full w-full rounded-2xl border border-white/5 bg-black/40 overflow-hidden relative group">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <div className="w-2 h-2 border-t-2 border-r-2 border-zim-teal" />
                        </div>
                        <div className="absolute bottom-0 left-0 p-2 opacity-50">
                            <div className="w-2 h-2 border-b-2 border-l-2 border-zim-teal" />
                        </div>

                        <div className="h-full overflow-y-auto custom-scrollbar p-4">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Right Column: The Value (KPIs) */}
                <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                    {kpiPanel}
                </div>
            </div>
        </div>
    );
}
