"use client";

import React from "react";
import Image from "next/image";

export default function Header() {
    return (
        <header className="glass-header h-20 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative w-32 h-10">
                    <Image
                        src="https://npkyfnkpkuovnplylxot.supabase.co/storage/v1/object/public/ZIM/zim80-logo-313x112-white.png"
                        alt="ZIM Logo"
                        fill
                        className="object-contain"
                        priority
                        unoptimized
                    />
                </div>
                <div className="h-6 w-px bg-white/20" />
                <span className="text-zim-teal font-mono text-sm tracking-widest uppercase">
                    AI Showcase
                </span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
                <span className="text-xs text-zinc-500 font-mono">
                    SYSTEM STATUS: <span className="text-emerald-400">ONLINE</span>
                </span>
            </nav>
        </header>
    );
}
