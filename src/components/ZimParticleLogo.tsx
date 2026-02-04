"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Physics configuration matching ParticleSlider.js (ps-0.9.js)
const CONFIG = {
    ptlGap: 1,           // 0 in CodePen (desktop), 1 is safe/solid for us. Current was 2.
    ptlSize: 1,          // Particle render size (original default: 1)
    mouseForce: 10000,   // Force magnitude (original default: 1e4)
    restless: true,      // Continuous micro-jitter (original default: true)
    formationDelay: 0,   // Removed global delay, using per-particle TTL instead
};

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    ttl: number; // Time To Live (delay frames before forming)
}

export const ZimParticleLogo = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999, active: false });
    const animationIdRef = useRef<number>(0);
    const isInViewRef = useRef(false);

    // Track visibility to pause/resume
    const [isVisible, setIsVisible] = useState(false);

    // Initialize particles from image
    const initParticles = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        // CodePen uses 1:1 canvas pixels, not DPR scaled necessarily. use simple rect.
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const w = canvas.width;
        const h = canvas.height;

        const image = new Image();
        image.src = "/particle-text-target.png";

        image.onload = () => {
            // Calculate draw dimensions maintaining aspect ratio
            const imgAspect = image.width / image.height;
            const canvasAspect = w / h;

            let drawW, drawH, startX, startY;

            if (imgAspect > canvasAspect) {
                drawW = w * 0.95;  // Fill nearly full width
                drawH = drawW / imgAspect;
            } else {
                drawH = h * 0.8;
                drawW = drawH * imgAspect;
            }

            startX = (w - drawW) / 2;
            startY = (h - drawH) / 2;

            // Draw image to sample pixels
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(image, startX, startY, drawW, drawH);

            const imageData = ctx.getImageData(startX, startY, drawW, drawH);
            const data = imageData.data;

            // Clear canvas after sampling
            ctx.clearRect(0, 0, w, h);

            const newParticles: Particle[] = [];

            for (let y = 0; y < drawH; y += CONFIG.ptlGap + 1) { // Gap+1 stride
                for (let x = 0; x < drawW; x += CONFIG.ptlGap + 1) {
                    const index = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
                    const a = data[index + 3];
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // Check for visible white/light pixels
                    if (a > 128 && (r + g + b) > 300) {
                        newParticles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            originX: startX + x,
                            originY: startY + y,
                            vx: (Math.random() - 0.5) * 10, // Initial scatter velocity? CodePen particles have some v
                            vy: (Math.random() - 0.5) * 10,
                            ttl: Math.floor(Math.random() * 10) * 5, // Random start delay (0-50 frames)
                        });
                    }
                }
            }

            particlesRef.current = newParticles;
        };
    }, []);

    // Animation loop - using EXACT physics from ParticleSlider ps-0.9.js
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        // Performance: Skip heavy computation when not in view
        if (!isInViewRef.current) {
            animationIdRef.current = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        particles.forEach((p) => {
            // TTL Logic: Delay start
            if (p.ttl > 0) {
                p.ttl--;
                // While waiting, just draw at random pos (already set) or don't draw?
                // Visual preference: Don't draw until they "spawn".
                // CodePen swap logic implies they might not exist in loop?
                // Let's NOT draw them if TTL > 0 to create "appearing" effect
                return;
            }

            // EXACT ParticleSlider physics (ps-0.9.js psParticle.prototype.move)
            const dx = p.originX - p.x;  // gravityX - x
            const dy = p.originY - p.y;  // gravityY - y
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // g = distance * 0.01 (original value)
            let gravity = distance * 0.01;

            // Restless mode: add jitter to gravity, not position
            if (CONFIG.restless) {
                gravity += Math.random() * 0.1 - 0.05;
            } else if (gravity < 0.01) {
                p.x = p.originX + 0.25;
                p.y = p.originY + 0.25;
            }

            // Mouse repulsion (original formula)
            let mouseForce = 0;
            let mouseAngle = 0;
            if (mouse.active && CONFIG.mouseForce) {
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mouseDistSq = mdx * mdx + mdy * mdy;

                mouseForce = Math.min(CONFIG.mouseForce / mouseDistSq, CONFIG.mouseForce);
                mouseAngle = Math.atan2(mdy, mdx);
            }

            // Apply forces to velocity
            p.vx += gravity * Math.cos(angle) + mouseForce * Math.cos(mouseAngle);
            p.vy += gravity * Math.sin(angle) + mouseForce * Math.sin(mouseAngle);

            // Friction (original: *= 0.92)
            p.vx *= 0.92;
            p.vy *= 0.92;

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Draw particle
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, CONFIG.ptlSize, 0, Math.PI * 2);
            ctx.fill();
        });

        animationIdRef.current = requestAnimationFrame(animate);
    }, []);

    // Handle mouse movement
    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.active = true;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current.active = false;
    }, []);

    // Handle resize
    const handleResize = useCallback(() => {
        initParticles();
    }, [initParticles]);

    // Intersection Observer for scroll-triggered animation
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    isInViewRef.current = true;
                    setIsVisible(true);
                } else {
                    isInViewRef.current = false;
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    // Initialize and start animation
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        initParticles();

        // Start animation loop
        animationIdRef.current = requestAnimationFrame(animate);

        // Event listeners
        window.addEventListener("resize", handleResize);
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationIdRef.current);
        };
    }, [initParticles, animate, handleResize, handleMouseMove, handleMouseLeave]);

    return (
        <div
            ref={containerRef}
            className="w-full max-w-4xl mx-auto h-[300px] flex items-center justify-center relative bg-transparent overflow-hidden my-16"
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block"
            />
        </div>
    );
};
