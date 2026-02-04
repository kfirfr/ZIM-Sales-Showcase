"use client";

import React, { useEffect, useRef } from 'react';

// Performance: Track page visibility to pause when tab is hidden
const usePageVisibility = () => {
    const isVisibleRef = useRef(true);
    useEffect(() => {
        const handleVisibility = () => {
            isVisibleRef.current = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);
    return isVisibleRef;
};

// Define 3 zones for balanced distribution
const ZONES = 3;

interface Star {
    x: number;
    y: number;
    maxSize: number; // The size when fully bright
    maxOpacity: number; // The opacity when fully bright
    phase: number; // Current lifecycle phase (0 to PI)
    speed: number; // Speed of phase increment
    zone: number; // Assigned zone (0, 1, or 2)
}

interface BackgroundNeuralStarsProps {
    className?: string;
}

export const BackgroundNeuralStars = ({ className }: BackgroundNeuralStarsProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isVisibleRef = usePageVisibility();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let width = 0;
        let height = 0;

        // Helper to generate a random position within a specific zone
        const getRandomPosInZone = (zoneIndex: number, areaWidth: number, areaHeight: number) => {
            const zoneWidth = areaWidth / ZONES;
            const minX = zoneIndex * zoneWidth;
            // Pad slightly so they don't hug the exact edge lines perfectly
            const x = minX + (Math.random() * zoneWidth);
            const y = Math.random() * areaHeight;
            return { x, y };
        };

        const initStars = () => {
            width = canvas.clientWidth || window.innerWidth;
            height = canvas.clientHeight || window.innerHeight;

            canvas.width = width;
            canvas.height = height;

            // Total stars: 30-50. Let's aim for ~45 (15 per zone) to be safe and balanced.
            const starsPerZone = 15;
            const totalStars = starsPerZone * ZONES;

            stars = [];

            for (let i = 0; i < totalStars; i++) {
                const zone = i % ZONES; // 0, 1, 2
                const { x, y } = getRandomPosInZone(zone, width, height);

                // Randomize initial phase so they don't all start fading in at once
                // Phase goes from 0 to PI.
                // Speed calculation based on user request: "full bright to disappearing" (half cycle) = 3s to 4s.
                // Total cycle (0 to PI) = 6s to 8s.
                // speed = PI / (TotalSeconds * 60)
                // Min Speed (8s): ~0.0065
                // Max Speed (6s): ~0.0087
                stars.push({
                    x,
                    y,
                    maxSize: Math.random() * (6 - 2) + 2, // 2px - 6px
                    maxOpacity: Math.random() * (1.0 - 0.4) + 0.4, // 0.4 - 1.0 peak brightness
                    phase: Math.random() * Math.PI,
                    speed: (Math.random() * (0.0087 - 0.0065)) + 0.0065, // ~6s - 8s total lifecycle
                    zone
                });
            }
        };

        const drawStar = (ctx: CanvasRenderingContext2D, opacity: number) => {
            ctx.beginPath();
            // Star shape: M 0,-1 L 0.2,-0.2 L 1,0 L 0.2,0.2 L 0,1 L -0.2,0.2 L -1,0 L -0.2,-0.2 Z
            ctx.moveTo(0, -1);
            ctx.lineTo(0.2, -0.2);
            ctx.lineTo(1, 0);
            ctx.lineTo(0.2, 0.2);
            ctx.lineTo(0, 1);
            ctx.lineTo(-0.2, 0.2);
            ctx.lineTo(-1, 0);
            ctx.lineTo(-0.2, -0.2);
            ctx.closePath();

            ctx.fillStyle = `rgba(226, 232, 240, ${opacity})`; // slate-200
            ctx.fill();
        };

        const render = () => {
            if (!canvas || !ctx) return;

            // Performance: Skip rendering when page is hidden
            if (!isVisibleRef.current) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                // Update phase
                star.phase += star.speed;

                // Lifecycle check: If phase > PI, star has faded out.
                // Respawn in a NEW location within its zone.
                if (star.phase > Math.PI) {
                    star.phase = 0;
                    const { x, y } = getRandomPosInZone(star.zone, width, height);
                    star.x = x;
                    star.y = y;
                    // Randomize traits again for variety
                    star.maxSize = Math.random() * (6 - 2) + 2;
                    star.maxOpacity = Math.random() * (1.0 - 0.4) + 0.4;
                    star.speed = (Math.random() * (0.0087 - 0.0065)) + 0.0065;
                }

                // Calculate current opacity based on sine of phase (0 -> 1 -> 0)
                const sineValue = Math.sin(star.phase); // 0 at start, 1 at peak, 0 at end

                // Opacity pulses from 0 to maxOpacity
                const currentOpacity = star.maxOpacity * sineValue;

                // Size pulses from 0 to maxSize (or slight offset)
                // Let's make it grow from 0 for a true "appearing" effect
                const currentSize = star.maxSize * sineValue;

                // Only draw if visible
                if (currentOpacity > 0.01) {
                    ctx.save();
                    ctx.translate(star.x, star.y);
                    ctx.scale(currentSize, currentSize);
                    drawStar(ctx, currentOpacity);
                    ctx.restore();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        initStars();
        window.addEventListener('resize', initStars);
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', initStars);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={className || "fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"}
        />
    );
};
