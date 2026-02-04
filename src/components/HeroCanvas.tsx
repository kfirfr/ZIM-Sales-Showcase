"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useImageSequence } from "@/hooks/useImageSequence";

// Register ScrollTrigger immediately
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface HeroCanvasProps {
    children?: React.ReactNode;
}

export const HeroCanvas = ({ children }: HeroCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const frameRef = useRef(1);
    const frameCount = 240;

    const { getFrame, loadProgress, prioritizeFrame } = useImageSequence(frameCount, "/Hero-Image-Sequence");

    // Refs for loop
    const getFrameRef = useRef(getFrame);
    const prioritizeFrameRef = useRef(prioritizeFrame);

    // Update refs when hooks change
    useEffect(() => {
        getFrameRef.current = getFrame;
        prioritizeFrameRef.current = prioritizeFrame;
    }, [getFrame, prioritizeFrame]);

    // 2. RENDER LOOP (Native RAF for robustness)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false }); // Optimize
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let animationFrameId: number;

        const render = () => {
            const currentFrameIndex = frameRef.current;
            const img = getFrameRef.current(currentFrameIndex);

            prioritizeFrameRef.current(currentFrameIndex);
            prioritizeFrameRef.current(Math.min(frameCount, currentFrameIndex + 1));

            const cw = canvas.width;
            const ch = canvas.height;

            // Clear and fill background
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, cw, ch);

            if (img && img.naturalWidth > 0) {
                const resultAspectRatio = cw / ch;
                const imgAspectRatio = img.width / img.height;
                let renderableHeight, renderableWidth, xStart, yStart;

                if (imgAspectRatio < resultAspectRatio) {
                    renderableWidth = cw;
                    renderableHeight = cw / imgAspectRatio;
                    xStart = 0;
                    yStart = (ch - renderableHeight) / 2;
                } else {
                    renderableHeight = ch;
                    renderableWidth = ch * imgAspectRatio;
                    yStart = 0;
                    xStart = (cw - renderableWidth) / 2;
                }
                ctx.drawImage(img, xStart, yStart, renderableWidth, renderableHeight);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 1. SCROLL TRIGGER (GSAP)
    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=400%",
                pin: true,
                scrub: 0.5,
                // markers: true, // DEBUG
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const SEQUENCE_END = 0.75;
                    const progress = self.progress;
                    if (progress <= SEQUENCE_END) {
                        const targetFrame = Math.max(1, Math.ceil((progress / SEQUENCE_END) * frameCount));
                        frameRef.current = targetFrame;
                    } else {
                        frameRef.current = frameCount;
                    }
                },
            },
        });

        // Timing Constants
        const SEQUENCE_END = 0.75;
        const CONTENT_REVEAL = 0.85;

        // 2. Canvas Fly-In (Starts immediately after sequence)
        tl.to(canvasWrapperRef.current, {
            scale: 10,
            autoAlpha: 0, // Handles opacity + visibility
            filter: "blur(20px)",
            ease: "power3.in",
            duration: (1 - SEQUENCE_END),
        }, SEQUENCE_END);

        // 3. Content Reveal (Starts LATER, after fly-in is well underway)
        tl.fromTo(contentWrapperRef.current,
            { opacity: 0, scale: 0.9, autoAlpha: 0 },
            { opacity: 1, scale: 1, autoAlpha: 1, ease: "power3.out", duration: (1 - CONTENT_REVEAL) },
            CONTENT_REVEAL
        );

    }, { scope: containerRef, dependencies: [] });

    // RESIZE HANDLER
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                ScrollTrigger.refresh();
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-zim-dark">
            {/* CANVAS LAYER
                z-30: Above standard page content.
                REMOVED 'invisible' and enforced 'visible' and 'opacity-100'.
            */}
            <div
                ref={canvasWrapperRef}
                className="absolute inset-0 z-30 will-change-transform pointer-events-none origin-center opacity-100 visible"
            >
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
            </div>

            {/* CONTENT LAYER
                z-40: Sits on top.
                Starts opacity-0 but VISIBLE so it can be animated in without layout shifts or "visibility:hidden" locks.
            */}
            <div
                ref={contentWrapperRef}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center opacity-0"
            >
                {children}
            </div>
        </div>
    );
};
