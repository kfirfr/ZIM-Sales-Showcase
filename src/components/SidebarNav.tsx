"use client";

import React from "react";
import { motion } from "framer-motion";

interface SidebarNavProps {
    activeSection: string;
}

const sections = [
    { id: "hero", label: "Overview", status: "live" },
    { id: "speech-analytics", label: "Speech Analytics", status: "live" },
    { id: "auto-evals", label: "Auto Evals", status: "live" },
    { id: "predictive-routing", label: "Predictive Routing", status: "future" },
];

export default function SidebarNav({ activeSection }: SidebarNavProps) {
    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6">
            <div className="absolute right-[11px] top-0 bottom-0 w-px bg-white/10 -z-10" />

            {sections.map((section) => (
                <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center justify-end gap-4 relative"
                >
                    <span
                        className={`text-xs font-mono transition-all duration-300 ${activeSection === section.id
                                ? "text-white opacity-100"
                                : "text-zinc-500 opacity-0 group-hover:opacity-100"
                            }`}
                    >
                        {section.label}
                    </span>

                    <div className="relative flex items-center justify-center w-6 h-6">
                        <motion.div
                            className={`w-3 h-3 rounded-full border border-white/20 transition-colors duration-500 ${activeSection === section.id
                                    ? section.status === "live" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gen-orange shadow-[0_0_10px_#f97316]"
                                    : "bg-zinc-800"
                                }`}
                            animate={{
                                scale: activeSection === section.id ? 1.2 : 1,
                            }}
                        />
                        {section.status === "live" && (
                            <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-20" />
                        )}
                    </div>
                </a>
            ))}
        </div>
    );
}
