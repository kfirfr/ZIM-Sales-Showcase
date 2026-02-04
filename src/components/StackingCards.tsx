"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

interface CardProps {
    i: number;
    progress: MotionValue<number>;
    range: [number, number];
    targetScale: number;
    children: React.ReactNode;
}

const Card = ({ i, progress, range, targetScale, children }: CardProps) => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "start start"],
    });

    const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
            <motion.div
                style={{ scale, top: `calc(-5% + ${i * 25}px)` }}
                className="relative -top-[25%] h-[600px] w-[1000px] rounded-3xl p-10 origin-top bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-xl"
            >
                {/* Noise Texture on Card */}
                <div className="absolute inset-0 opacity-[0.03] bg-noise pointer-events-none rounded-3xl" />

                {/* Inner Content */}
                <div className="h-full w-full relative z-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

interface StackingCardsProps {
    items: React.ReactNode[];
}

export default function StackingCards({ items }: StackingCardsProps) {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start start", "end end"],
    });

    return (
        <div ref={container} className="relative mt-[20vh]">
            {items.map((item, i) => {
                // Calculate scale factor: Previous cards scale down slightly as new ones arrive
                const targetScale = 1 - (items.length - i) * 0.05;
                return (
                    <Card
                        key={i}
                        i={i}
                        progress={scrollYProgress}
                        range={[i * 0.25, 1]}
                        targetScale={targetScale}
                    >
                        {item}
                    </Card>
                );
            })}
        </div>
    );
}
