"use client";

import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    color: string;
    vx: number;
    vy: number;
    size: number;
}

interface ParticleTextProps {
    imageSrc: string;
    className?: string; // Allow external usage of class names
}

export const ParticleText: React.FC<ParticleTextProps> = ({ imageSrc, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const requestRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, isActive: false });

    // Configuration
    const gap = 3; // Gap between particles (sample rate)
    const mouseRadius = 3000; // Squared radius for interaction
    const friction = 0.9; // Deceleration
    const ease = 0.1; // Return speed

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        let image: HTMLImageElement;

        const init = () => {
            // Handle high DPI displays
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`; // Maintain aspect ratio based on image if needed, but here we fill container

            ctx.scale(dpr, dpr);

            if (image) {
                createParticles(rect.width, rect.height);
            }
        };

        const createParticles = (width: number, height: number) => {
            particlesRef.current = [];

            // Draw image to canvas to read pixels
            // Calculate aspect ratio to center image
            const imgAspect = image.width / image.height;
            const canvasAspect = width / height;

            let drawWidth = width;
            let drawHeight = height;
            let offsetX = 0;
            let offsetY = 0;

            // Contain logic to fit image within canvas without distortion
            if (canvasAspect > imgAspect) {
                drawWidth = height * imgAspect;
                offsetX = (width - drawWidth) / 2;
            } else {
                drawHeight = width / imgAspect;
                offsetY = (height - drawHeight) / 2;
            }

            // Ideally we'd scale down a bit to have padding
            const paddingScale = 0.8;
            drawWidth *= paddingScale;
            drawHeight *= paddingScale;
            offsetX = (width - drawWidth) / 2;
            offsetY = (height - drawHeight) / 2;

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

            const pixels = ctx.getImageData(0, 0, width * window.devicePixelRatio, height * window.devicePixelRatio).data; // Read from scaled canvas? No, unscaled coordinates for logic
            // Actually, getImageData returns pixels for the physical backing store size.
            // If we scaled the context, drawing coordinates were logical.
            // But `getImageData` acts on physical pixels.
            // Simpler approach: Draw to an offscreen canvas or just calculate conceptual positions?
            // Let's rely on logic coordinates.

            // RE-APPROACH: Draw to the main canvas using logical dims, retrieve data.
            // Since we scaled context by DPR, `drawImage` used logical coords.
            // `getImageData` uses device coords.

            // Simplification: We need to scan logical pixels.
            // It's expensive to scan full resolution.
            // Let's use a temporary small canvas for scanning.

            const scanCanvas = document.createElement('canvas');
            scanCanvas.width = width; // Logical width
            scanCanvas.height = height; // Logical height
            const scanCtx = scanCanvas.getContext('2d');
            if (!scanCtx) return;

            scanCtx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
            const scanData = scanCtx.getImageData(0, 0, width, height).data;

            for (let y = 0; y < height; y += gap) {
                for (let x = 0; x < width; x += gap) {
                    const index = (y * width + x) * 4;
                    const alpha = scanData[index + 3];

                    if (alpha > 0) {
                        particlesRef.current.push({
                            x: x,
                            y: y,
                            originX: x,
                            originY: y,
                            color: 'rgb(255, 255, 255)', // White particles
                            vx: 0,
                            vy: 0,
                            size: 1.5
                        });
                    }
                }
            }

            // Clear the setup drawing
            ctx.clearRect(0, 0, width, height);
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

            particlesRef.current.forEach(p => {
                // Physics
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distanceSq = dx * dx + dy * dy;
                const force = -mouseRadius / distanceSq;

                if (distanceSq < mouseRadius && mouseRef.current.isActive) {
                    const angle = Math.atan2(dy, dx);
                    const f = Math.max(-50, Math.min(50, force)); // Cap force
                    p.vx += f * Math.cos(angle);
                    p.vy += f * Math.sin(angle);
                }

                // Return to origin
                p.vx += (p.originX - p.x) * ease;
                p.vy += (p.originY - p.y) * ease;

                // Friction
                p.vx *= friction;
                p.vy *= friction;

                p.x += p.vx;
                p.y += p.vy;

                // Draw
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        // Load Image
        image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            init();
            animate();
            setIsLoaded(true);
        };

        // Event Listeners
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            mouseRef.current.isActive = true;
        };

        const handleMouseLeave = () => {
            mouseRef.current.isActive = false;
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [imageSrc]);

    return (
        <div ref={containerRef} className={`w-full h-[300px] flex items-center justify-center relative overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};
