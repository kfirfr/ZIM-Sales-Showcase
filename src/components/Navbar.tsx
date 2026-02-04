"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    // Dynamic width/padding based on scroll for that "pill" effect
    const widthResult = useTransform(scrollY, [0, 100], ["100%", "80%"]);
    const topResult = useTransform(scrollY, [0, 100], ["0px", "20px"]);
    const borderResult = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pt-4 pointer-events-none">
            <motion.nav
                style={{
                    width: widthResult,
                    top: topResult,
                    borderColor: borderResult,
                }}
                className={cn(
                    "pointer-events-auto flex items-center justify-between px-6 py-3 transition-all duration-300",
                    scrolled
                        ? "bg-black/60 backdrop-blur-xl rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        : "bg-transparent border-transparent w-full"
                )}
            >
                <div className="flex items-center gap-3">
                    <img
                        src="/zim80-logo.png"
                        alt="ZIM Logo"
                        className="h-10 w-auto object-contain"
                    />
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <span className="text-white font-semibold tracking-tight text-sm">AI SHOWCASE</span>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <a
                        href="#deployments"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('deployments')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group relative px-4 py-2 rounded-full text-xs font-bold text-white/90 hover:text-white uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                        <span className="relative z-10">2025 AI</span>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-all duration-300" />
                        <div className="absolute inset-0 bg-zim-teal/0 group-hover:bg-zim-teal/20 rounded-full blur-md transition-all duration-300" />
                    </a>
                    <a
                        href="#innovations"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('innovations')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group relative px-4 py-2 rounded-full text-xs font-bold text-white/90 hover:text-white uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 hover:scale-105"
                    >
                        <span className="relative z-10">2026 AI</span>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-all duration-300" />
                        <div className="absolute inset-0 bg-zim-teal/0 group-hover:bg-zim-teal/20 rounded-full blur-md transition-all duration-300" />
                    </a>
                    <a
                        href="#roadmap"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group relative px-4 py-2 rounded-full text-xs font-bold text-white/90 hover:text-white uppercase tracking-[0.15em] cursor-pointer transition-all duration-300 hover:scale-105 whitespace-nowrap"
                    >
                        <span className="relative z-10">Strategic AI Roadmap</span>
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-all duration-300" />
                        <div className="absolute inset-0 bg-zim-teal/0 group-hover:bg-zim-teal/20 rounded-full blur-md transition-all duration-300" />
                    </a>
                </div>

                <a
                    href="https://zimuccc.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative px-5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-zim-teal/50 text-[11px] text-slate-300 hover:text-white uppercase tracking-widest font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] flex items-center gap-2"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-zim-teal animate-pulse group-hover:shadow-[0_0_8px_#22d3ee]"></span>
                    Digital Solutions
                </a>
            </motion.nav>
        </div>
    );
};
