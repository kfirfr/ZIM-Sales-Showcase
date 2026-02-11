"use client";

import React, { useEffect, useRef, useState } from "react";
import "./CardStream.css";

// Performance: Track visibility to pause animations when offscreen
const useIntersectionObserver = (ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0, rootMargin: "100px", ...options });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, options]);
    return isVisible;
};

// -----------------------------------------------------------------------------
// Card Stream Controller Logic (Refactored for React)
// -----------------------------------------------------------------------------

export const CardStream = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardLineRef = useRef<HTMLDivElement>(null);

    // Performance: Only animate when visible in viewport
    const isVisible = useIntersectionObserver(wrapperRef);
    const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
    const speedValueRef = useRef<HTMLSpanElement>(null);

    // Cached DOM references for performance (avoids querySelectorAll in animation loops)
    const cachedWrappers = useRef<HTMLElement[]>([]);
    const visibleCards = useRef<Set<number>>(new Set());

    // State for toggles
    const [isAnimating, setIsAnimating] = useState(true);
    const [direction, setDirection] = useState(-1);

    // Refs for animation state (mutable without re-render)
    const state = useRef({
        position: 0,
        velocity: 120,
        direction: -1,
        isAnimating: true,
        isDragging: false,
        lastTime: 0,
        lastMouseX: 0,
        mouseVelocity: 0,
        friction: 0.95,
        minVelocity: 30,
        containerWidth: 0,
        cardLineWidth: 0,
        animationId: 0,
        scannerActive: false,
        isVisible: true, // Track visibility for animation pause
    });

    // ---------------------------------------------------------------------
    // 1. CARD STREAM LOGIC
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (!containerRef.current || !cardLineRef.current) return;

        // --- Helpers ---
        const calculateDimensions = () => {
            if (!containerRef.current || !cardLineRef.current) return;
            state.current.containerWidth = containerRef.current.offsetWidth;
            const cardWidth = 400;
            const cardGap = 60;
            const cardCount = cardLineRef.current.children.length;
            state.current.cardLineWidth = (cardWidth + cardGap) * cardCount;

            // Cache wrappers on dimension calculation (runs on mount and resize)
            cachedWrappers.current = Array.from(document.querySelectorAll(".card-wrapper")) as HTMLElement[];
        };

        const updateSpeedIndicator = () => {
            if (speedValueRef.current) {
                speedValueRef.current.textContent = Math.round(state.current.velocity).toString();
            }
        };

        const updateCardClipping = () => {
            const scannerX = window.innerWidth / 2;
            const scannerWidth = 8;
            const scannerLeft = scannerX - scannerWidth / 2;
            const scannerRight = scannerX + scannerWidth / 2;
            let anyScanningActive = false;

            // Use cached wrappers instead of querySelectorAll per frame
            const wrappers = cachedWrappers.current;
            const wrappersLength = wrappers.length;

            for (let i = 0; i < wrappersLength; i++) {
                const wrapper = wrappers[i];
                // const rect = wrapper.getBoundingClientRect(); // Wrapper is fixed 400px, inaccurate for interaction

                const normalCard = wrapper.querySelector(".card-normal") as HTMLElement;
                const scannedCard = wrapper.querySelector(".card-scanned") as HTMLElement;

                if (!normalCard || !scannedCard) continue;

                // FIX: Use the actual rendered dimensions of the card (handles scaling automatically)
                const cardRect = normalCard.getBoundingClientRect();
                const visualWidth = cardRect.width;
                const visualLeft = cardRect.left;
                const visualRight = cardRect.right;

                // Use visual boundaries for intersection logic
                if (visualLeft < scannerRight && visualRight > scannerLeft) {
                    anyScanningActive = true;
                    if (visualWidth > 0) {
                        const scannerIntersectLeft = Math.max(scannerLeft - visualLeft, 0);
                        // Clip percentage based on visual width
                        const clipPercentage = (scannerIntersectLeft / visualWidth) * 100;

                        normalCard.style.setProperty("--clip-right", `${clipPercentage}%`);
                        scannedCard.style.setProperty("--clip-left", `${clipPercentage}%`);

                        if (!wrapper.hasAttribute("data-scanned") && scannerIntersectLeft > 0) {
                            wrapper.setAttribute("data-scanned", "true");

                            // Add Scan Effect (Light Burst)
                            const scanEffect = document.createElement("div");
                            scanEffect.className = "scan-effect";
                            wrapper.appendChild(scanEffect);
                            setTimeout(() => {
                                if (scanEffect.parentNode) {
                                    scanEffect.parentNode.removeChild(scanEffect);
                                }
                            }, 600);
                        }
                    }
                } else {
                    // Fully projected/scanned state (to the left of scanner)
                    if (visualRight < scannerLeft) {
                        normalCard.style.setProperty("--clip-right", "100%");
                        scannedCard.style.setProperty("--clip-left", "100%");

                        // Force visibility persistence
                        // Why? Because relying on data-scanned attribute transition might trigger a fade out if logic flickers.
                        scannedCard.style.opacity = "1";
                        anyScanningActive = true;
                    }
                    // Reset state (to the right of scanner) - only remove if it's actually reset/before scanner
                    else if (visualLeft > scannerRight) {
                        normalCard.style.setProperty("--clip-right", "0%");
                        scannedCard.style.setProperty("--clip-left", "0%");
                        wrapper.removeAttribute("data-scanned");
                    }
                }
            }

            // Sync with Scanner Particle System
            state.current.scannerActive = anyScanningActive;
        };

        const updateCardPosition = () => {
            const { containerWidth, cardLineWidth } = state.current;
            if (cardLineWidth === 0) return;

            if (state.current.position < -cardLineWidth) {
                state.current.position = containerWidth;
            } else if (state.current.position > containerWidth) {
                state.current.position = -cardLineWidth;
            }

            if (cardLineRef.current) {
                cardLineRef.current.style.transform = `translateX(${state.current.position}px)`;
            }
            updateCardClipping();
        };

        const animate = () => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - state.current.lastTime) / 1000;
            state.current.lastTime = currentTime;

            // Performance: Skip animation if offscreen
            if (!state.current.isVisible) {
                state.current.animationId = requestAnimationFrame(animate);
                return;
            }

            if (state.current.isAnimating && !state.current.isDragging) {
                if (state.current.velocity > state.current.minVelocity) {
                    state.current.velocity *= state.current.friction;
                } else {
                    state.current.velocity = Math.max(state.current.minVelocity, state.current.velocity);
                }

                state.current.position += state.current.velocity * state.current.direction * deltaTime;
                updateCardPosition();
                updateSpeedIndicator();
            }

            state.current.animationId = requestAnimationFrame(animate);
        };

        // --- Dragging Events ---
        const startDrag = (clientX: number) => {
            state.current.isDragging = true;
            state.current.isAnimating = false;
            state.current.lastMouseX = clientX;
            state.current.mouseVelocity = 0;

            if (cardLineRef.current) {
                cardLineRef.current.classList.add("dragging");
                const transform = window.getComputedStyle(cardLineRef.current).transform;
                if (transform !== "none") {
                    const matrix = new DOMMatrix(transform);
                    state.current.position = matrix.m41;
                }
            }
            document.body.style.userSelect = "none";
            document.body.style.cursor = "grabbing";
        };

        const onDrag = (clientX: number) => {
            if (!state.current.isDragging) return;
            const deltaX = clientX - state.current.lastMouseX;
            state.current.position += deltaX;
            state.current.mouseVelocity = deltaX * 60;
            state.current.lastMouseX = clientX;

            if (cardLineRef.current) {
                cardLineRef.current.style.transform = `translateX(${state.current.position}px)`;
            }
            updateCardClipping();
        };

        const endDrag = () => {
            if (!state.current.isDragging) return;
            state.current.isDragging = false;
            if (cardLineRef.current) cardLineRef.current.classList.remove("dragging");

            if (Math.abs(state.current.mouseVelocity) > state.current.minVelocity) {
                state.current.velocity = Math.abs(state.current.mouseVelocity);
                state.current.direction = state.current.mouseVelocity > 0 ? 1 : -1;
                setDirection(state.current.direction); // Sync React state
            } else {
                state.current.velocity = 120;
            }

            state.current.isAnimating = true; // Resume animation
            setIsAnimating(true); // Sync React state
            updateSpeedIndicator();

            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };

        // --- Event Listeners ---
        const handleMouseDown = (e: MouseEvent) => { startDrag(e.clientX); };
        const handleMouseMove = (e: MouseEvent) => { onDrag(e.clientX); };
        const handleMouseUp = () => { endDrag(); };

        const handleTouchStart = (e: TouchEvent) => { startDrag(e.touches[0].clientX); };
        const handleTouchMove = (e: TouchEvent) => { onDrag(e.touches[0].clientX); };
        const handleTouchEnd = () => { endDrag(); };
        const handleResize = () => { calculateDimensions(); };


        // Attach
        const el = cardLineRef.current;
        el.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        el.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("resize", handleResize);

        // Init
        calculateDimensions();
        animate();

        return () => {
            cancelAnimationFrame(state.current.animationId);
            el.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            el.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Sync React Controls to Ref State
    useEffect(() => {
        state.current.isAnimating = isAnimating;
    }, [isAnimating]);

    useEffect(() => {
        state.current.direction = direction;
    }, [direction]);

    const handleReset = () => {
        state.current.position = state.current.containerWidth;
        state.current.velocity = 120;
        state.current.direction = -1;
        setDirection(-1);
        setIsAnimating(true);
        state.current.isAnimating = true;
    };


    // ---------------------------------------------------------------------
    // 3. SCANNER LOGIC (ParticleScanner with Beam)
    // ---------------------------------------------------------------------
    useEffect(() => {
        const canvas = scannerCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d") as any;
        if (!ctx) return;

        let animationId: number;
        let w = window.innerWidth;
        const h = 300;

        // State corresponding to ParticleScanner class
        const scannerState = {
            particles: [] as any[],
            count: 0,
            maxParticles: 800,
            intensity: 0.8,
            lightBarX: w / 2,
            lightBarWidth: 3,
            fadeZone: 60,

            // Targets for transition
            scanTargetIntensity: 1.8,
            scanTargetParticles: 2500,
            scanTargetFadeZone: 35,

            // Current interpolated values
            currentIntensity: 0.8,
            currentMaxParticles: 800,
            currentFadeZone: 60,
            currentGlowIntensity: 1,

            transitionSpeed: 0.05,
            gradientCanvas: null as HTMLCanvasElement | null,
            greenGradientCanvas: null as HTMLCanvasElement | null // Added for Green Particles
        };

        // Initialize Canvas
        canvas.width = w;
        canvas.height = h;

        // Create Gradient Cache (ZIM RED)
        const createGradientCache = () => {
            const gc = document.createElement("canvas");
            gc.width = 16;
            gc.height = 16;
            const gCtx = gc.getContext("2d");
            if (!gCtx) return null;

            const half = 8;
            const grad = gCtx.createRadialGradient(half, half, 0, half, half, half);
            grad.addColorStop(0, "rgba(255, 255, 255, 1)");
            grad.addColorStop(0.3, "rgba(255, 100, 100, 0.8)"); // Light Red
            grad.addColorStop(0.7, "rgba(220, 38, 38, 0.4)");  // ZIM Red #dc2626
            grad.addColorStop(1, "transparent");

            gCtx.fillStyle = grad;
            gCtx.beginPath();
            gCtx.arc(half, half, half, 0, Math.PI * 2);
            gCtx.fill();
            return gc;
        };
        scannerState.gradientCanvas = createGradientCache();

        // Create Green Gradient Cache (Money Green)
        const createGreenGradientCache = () => {
            const gc = document.createElement("canvas");
            gc.width = 16;
            gc.height = 16;
            const gCtx = gc.getContext("2d");
            if (!gCtx) return null;

            const half = 8;
            const grad = gCtx.createRadialGradient(half, half, 0, half, half, half);
            grad.addColorStop(0, "rgba(255, 255, 255, 1)");
            grad.addColorStop(0.3, "rgba(100, 255, 100, 0.8)"); // Light Green
            grad.addColorStop(0.7, "rgba(34, 197, 94, 0.4)");   // Green #22c55e
            grad.addColorStop(1, "transparent");

            gCtx.fillStyle = grad;
            gCtx.beginPath();
            gCtx.arc(half, half, half, 0, Math.PI * 2);
            gCtx.fill();
            return gc;
        };
        scannerState.greenGradientCanvas = createGreenGradientCache();


        const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

        const createParticle = () => {
            const intensityRatio = scannerState.intensity / 0.8;
            const speedMultiplier = 1 + (intensityRatio - 1) * 1.2;
            const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7;

            // Determine type: 'red' (right) or 'green' (left)
            const isRed = Math.random() > 0.5;
            const direction = isRed ? 1 : -1;

            return {
                x: scannerState.lightBarX + randomFloat(-scannerState.lightBarWidth / 2, scannerState.lightBarWidth / 2),
                y: randomFloat(0, h),
                vx: randomFloat(0.2, 1.0) * speedMultiplier * direction, // Direction based on color
                vy: randomFloat(-0.15, 0.15) * speedMultiplier,
                radius: randomFloat(0.4, 1) * sizeMultiplier,
                alpha: randomFloat(0.6, 1),
                decay: randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5),
                originalAlpha: 0,
                life: 1.0,
                time: 0,
                twinkleSpeed: randomFloat(0.02, 0.08) * speedMultiplier,
                twinkleAmount: randomFloat(0.1, 0.25),
                type: isRed ? 'red' : 'green'
            };
        };

        const initParticles = () => {
            scannerState.particles = [];
            scannerState.count = 0;
            for (let i = 0; i < scannerState.maxParticles; i++) {
                const p = createParticle();
                p.originalAlpha = p.alpha;
                scannerState.particles.push(p);
                scannerState.count++;
            }
        };
        initParticles();

        const drawLightBar = () => {
            // Vertical fade mask
            const vertGrad = ctx.createLinearGradient(0, 0, 0, h);
            vertGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            vertGrad.addColorStop(scannerState.fadeZone / h, "rgba(255, 255, 255, 1)");
            vertGrad.addColorStop(1 - scannerState.fadeZone / h, "rgba(255, 255, 255, 1)");
            vertGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.globalCompositeOperation = "lighter";

            const targetGlow = state.current.scannerActive ? 3.5 : 1;
            scannerState.currentGlowIntensity += (targetGlow - scannerState.currentGlowIntensity) * scannerState.transitionSpeed;

            const glow = scannerState.currentGlowIntensity;
            const lw = scannerState.lightBarWidth;

            // ZIM RED Colors
            const colorPrimary = "220, 38, 38"; // #dc2626
            const colorSecondary = "239, 68, 68"; // #ef4444

            // Core Beam
            const coreGrad = ctx.createLinearGradient(scannerState.lightBarX - lw / 2, 0, scannerState.lightBarX + lw / 2, 0);
            coreGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
            coreGrad.addColorStop(0.3, `rgba(255, 255, 255, ${0.9 * glow})`);
            coreGrad.addColorStop(0.5, `rgba(255, 255, 255, ${1 * glow})`);
            coreGrad.addColorStop(0.7, `rgba(255, 255, 255, ${0.9 * glow})`);
            coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.globalAlpha = 1;
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(scannerState.lightBarX - lw / 2, 0, lw, h, 15);
            else ctx.rect(scannerState.lightBarX - lw / 2, 0, lw, h);
            ctx.fill();

            // Glow 1
            const glow1Grad = ctx.createLinearGradient(scannerState.lightBarX - lw * 2, 0, scannerState.lightBarX + lw * 2, 0);
            glow1Grad.addColorStop(0, `rgba(${colorPrimary}, 0)`);
            glow1Grad.addColorStop(0.5, `rgba(${colorSecondary}, ${0.8 * glow})`);
            glow1Grad.addColorStop(1, `rgba(${colorPrimary}, 0)`);

            ctx.globalAlpha = state.current.scannerActive ? 1.0 : 0.8;
            ctx.fillStyle = glow1Grad;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(scannerState.lightBarX - lw * 2, 0, lw * 4, h, 25);
            else ctx.rect(scannerState.lightBarX - lw * 2, 0, lw * 4, h);
            ctx.fill();

            // Glow 2
            const glow2Grad = ctx.createLinearGradient(scannerState.lightBarX - lw * 4, 0, scannerState.lightBarX + lw * 4, 0);
            glow2Grad.addColorStop(0, `rgba(${colorPrimary}, 0)`);
            glow2Grad.addColorStop(0.5, `rgba(${colorPrimary}, ${0.4 * glow})`);
            glow2Grad.addColorStop(1, `rgba(${colorPrimary}, 0)`);

            ctx.globalAlpha = state.current.scannerActive ? 0.8 : 0.6;
            ctx.fillStyle = glow2Grad;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(scannerState.lightBarX - lw * 4, 0, lw * 8, h, 35);
            else ctx.rect(scannerState.lightBarX - lw * 4, 0, lw * 8, h);
            ctx.fill();

            // Glow 3 (Active Only)
            if (state.current.scannerActive) {
                const glow3Grad = ctx.createLinearGradient(scannerState.lightBarX - lw * 8, 0, scannerState.lightBarX + lw * 8, 0);
                glow3Grad.addColorStop(0, `rgba(${colorPrimary}, 0)`);
                glow3Grad.addColorStop(0.5, `rgba(${colorPrimary}, 0.2)`);
                glow3Grad.addColorStop(1, `rgba(${colorPrimary}, 0)`);

                ctx.globalAlpha = 0.6;
                ctx.fillStyle = glow3Grad;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(scannerState.lightBarX - lw * 8, 0, lw * 16, h, 45);
                else ctx.rect(scannerState.lightBarX - lw * 8, 0, lw * 16, h);
                ctx.fill();
            }

            // Mask top/bottom with fade
            ctx.globalCompositeOperation = "destination-in";
            ctx.globalAlpha = 1;
            ctx.fillStyle = vertGrad;
            ctx.fillRect(0, 0, w, h);
        };

        const render = () => {
            const isActive = state.current.scannerActive;
            const targetIntensity = isActive ? scannerState.scanTargetIntensity : 0.8;
            const targetMax = isActive ? scannerState.scanTargetParticles : 800;
            const targetZone = isActive ? scannerState.scanTargetFadeZone : 60;

            scannerState.currentIntensity += (targetIntensity - scannerState.currentIntensity) * scannerState.transitionSpeed;
            scannerState.currentMaxParticles += (targetMax - scannerState.currentMaxParticles) * scannerState.transitionSpeed;
            scannerState.currentFadeZone += (targetZone - scannerState.currentFadeZone) * scannerState.transitionSpeed;

            scannerState.intensity = scannerState.currentIntensity;
            scannerState.maxParticles = Math.floor(scannerState.currentMaxParticles);
            scannerState.fadeZone = scannerState.currentFadeZone;

            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, w, h);

            drawLightBar();

            ctx.globalCompositeOperation = "lighter";

            // Render Particles
            for (let i = 0; i < scannerState.count; i++) {
                const p = scannerState.particles[i];
                if (!p || p.life <= 0) {
                    // Respawn
                    if (Math.random() < scannerState.intensity) {
                        const np = createParticle();
                        np.originalAlpha = np.alpha;
                        scannerState.particles[i] = np;
                    }
                    continue;
                }

                // Update
                p.x += p.vx;
                p.y += p.vy;
                p.time++;
                p.life -= p.decay;
                p.alpha = p.originalAlpha * p.life + Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount;

                // Kill if off screen (Left or Right)
                if (p.x > w + 10 || p.x < -10) p.life = 0;

                // Draw with fade
                let fade = 1;
                if (p.y < scannerState.fadeZone) fade = p.y / scannerState.fadeZone;
                else if (p.y > h - scannerState.fadeZone) fade = (h - p.y) / scannerState.fadeZone;
                fade = Math.max(0, Math.min(1, fade));

                ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha * fade));

                // Select gradient based on particle type
                const canvasToDraw = p.type === 'green' ? scannerState.greenGradientCanvas : scannerState.gradientCanvas;

                if (canvasToDraw) {
                    ctx.drawImage(canvasToDraw, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
                }
            }

            // Spawn extra if needed
            if (scannerState.count < scannerState.maxParticles && Math.random() < 0.5) {
                const np = createParticle();
                np.originalAlpha = np.alpha;
                scannerState.particles.push(np);
                scannerState.count++;
            }
        };

        const animateScanner = () => {
            if (!state.current.isVisible) {
                animationId = requestAnimationFrame(animateScanner);
                return;
            }
            render();
            animationId = requestAnimationFrame(animateScanner);
        };
        animateScanner();

        const handleResize = () => {
            w = window.innerWidth;
            scannerState.lightBarX = w / 2;
            canvas.width = w;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // ---------------------------------------------------------------------
    // RENDER HELPERS
    // ---------------------------------------------------------------------
    // Helpers for code generation
    const calculateCodeDimensions = (cardWidth: number, cardHeight: number) => {
        const fontSize = 11;
        const lineHeight = 13;
        const charWidth = 6;
        const width = Math.floor(cardWidth / charWidth);
        const height = Math.floor(cardHeight / lineHeight);
        return { width, height, fontSize, lineHeight };
    };

    const generateCode = (width: number, height: number) => {
        const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        const pick = (arr: string[]) => arr[randInt(0, arr.length - 1)];

        const prefixes = ["ZIMU", "ZCSU", "ZMLU", "ZCIU"];
        const ports = ["Shanghai", "Ashdod", "Haifa", "Piraeus", "Barcelona", "Rotterdam", "Ningbo", "Singapore", "Genoa", "Valencia"];
        const vessels = ["ZIM ATLANTIC", "ZIM PACIFIC", "ZIM MUMBAI", "ZIM ANTWERP", "ZIM TARRAGONA"];

        const header = [
            "// ZIM Container Revenue Pipeline",
            "/* Freight rate computation engine */",
            "const TEU_RATE = 2450; // USD per TEU",
            "const FEU_RATE = 4200; // USD per FEU",
            "const BUNKER_SURCHARGE = 385;",
            "const CURRENCY = 'USD';",
        ];

        const tracking = [
            `container.id = "${pick(prefixes)}${randInt(100000, 999999)}${randInt(0, 9)}";`,
            `vessel.name = "${pick(vessels)}";`,
            `route.origin = "${pick(ports)}";`,
            `route.destination = "${pick(ports)}";`,
            `container.status = "IN_TRANSIT";`,
            `booking.ref = "ZIM${randInt(10000000, 99999999)}";`,
        ];

        const revenueBlock = [
            "function calcFreightRevenue(teu, route) {",
            "  const base = teu * TEU_RATE;",
            "  const surcharge = teu * BUNKER_SURCHARGE;",
            "  const demurrage = getDemurrageFees(route);",
            "  return base + surcharge + demurrage;",
            "}",
        ];

        const cashFlow = [
            `totalRevenue += calcFreightRevenue(${randInt(50, 500)}, route);`,
            `cashPosition = totalRevenue - operatingCosts;`,
            `margin = (cashPosition / totalRevenue * 100).toFixed(2);`,
            `forecast.q${randInt(1, 4)} = totalRevenue * ${(1 + Math.random() * 0.3).toFixed(2)};`,
            `yieldPerTEU = totalRevenue / totalTEU;`,
            `ebitda = cashPosition - depreciation - interest;`,
        ];

        const routeCalc = [
            "function optimizeRoute(origin, dest, constraints) {",
            "  const legs = getRouteLegs(origin, dest);",
            "  const fuelCost = legs.reduce((s, l) => s + l.nm * fuelRate, 0);",
            "  const transitDays = legs.reduce((s, l) => s + l.days, 0);",
            "  return { legs, fuelCost, transitDays, revenue: estimateRevenue(legs) };",
            "}",
        ];

        const misc = [
            `containerCount = ${randInt(1200, 8500)};`,
            `utilizationRate = ${(85 + Math.random() * 14).toFixed(1)}%;`,
            `avgDwellTime = ${randInt(2, 8)} days;`,
            `berthWindow = "${String(randInt(0, 23)).padStart(2, '0')}:00-${String(randInt(0, 23)).padStart(2, '0')}:00";`,
            `invoiceTotal = $${(randInt(50000, 500000)).toLocaleString()};`,
            `paymentTerms = "NET ${pick(["30", "45", "60"])} DAYS";`,
        ];

        const library: string[] = [];
        header.forEach((l) => library.push(l));
        tracking.forEach((l) => library.push(l));
        revenueBlock.forEach((l) => library.push(l));
        cashFlow.forEach((l) => library.push(l));
        routeCalc.forEach((l) => library.push(l));
        misc.forEach((l) => library.push(l));

        for (let i = 0; i < 20; i++) {
            library.push(`container["${pick(prefixes)}${randInt(100000, 999999)}${randInt(0, 9)}"].revenue = $${randInt(2000, 15000)};`);
        }
        for (let i = 0; i < 10; i++) {
            library.push(`route("${pick(ports)}", "${pick(ports)}").freight = $${randInt(1500, 6000)}/TEU;`);
        }

        let flow = library.join(" ");
        flow = flow.replace(/\s+/g, " ").trim();
        const totalChars = width * height;
        while (flow.length < totalChars + width) {
            const extra = pick(library).replace(/\s+/g, " ").trim();
            flow += " " + extra;
        }

        let out = "";
        let offset = 0;
        for (let row = 0; row < height; row++) {
            let line = flow.slice(offset, offset + width);
            if (line.length < width) line = line + " ".repeat(width - line.length);
            out += line + (row < height - 1 ? "\n" : "");
            offset += width;
        }
        return out;
    };

    // Text Scramble Effect with IntersectionObserver and pre-generated variations
    useEffect(() => {
        // Pre-generate code variations to avoid generating new code each frame
        const { width, height } = calculateCodeDimensions(400, 250);
        const codeVariations: string[] = [];
        const VARIATION_COUNT = 10;
        for (let i = 0; i < VARIATION_COUNT; i++) {
            codeVariations.push(generateCode(width, height));
        }
        let variationIndex = 0;

        // Track which cards are visible using IntersectionObserver
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number((entry.target as HTMLElement).dataset.cardIndex);
                    if (!isNaN(index)) {
                        if (entry.isIntersecting) {
                            visibleCards.current.add(index);
                        } else {
                            visibleCards.current.delete(index);
                        }
                    }
                });
            },
            { rootMargin: "100px", threshold: 0 }
        );

        // Observe all card wrappers
        const asciiElements = document.querySelectorAll(".ascii-content");
        asciiElements.forEach((el, index) => {
            (el as HTMLElement).dataset.cardIndex = String(index);
            observer.observe(el);
        });

        // Increased interval from 200ms to 500ms
        const intervalId = setInterval(() => {
            asciiElements.forEach((el, index) => {
                // Only update visible cards (15% chance)
                if (visibleCards.current.has(index) && Math.random() < 0.15) {
                    variationIndex = (variationIndex + 1) % VARIATION_COUNT;
                    el.textContent = codeVariations[variationIndex];
                }
            });
        }, 500);

        return () => {
            clearInterval(intervalId);
            observer.disconnect();
        };
    }, []);

    const cardImages = [
        "/zim-container-red.png",
        "/zim-container-white.png",
    ];

    // Sync visibility state to ref for animation loops
    useEffect(() => {
        state.current.isVisible = isVisible;
    }, [isVisible]);

    return (
        <div ref={wrapperRef} className="card-stream-wrapper relative w-full h-[600px] bg-transparent overflow-visible my-20 z-20">
            {/* Controls hidden as requested */}
            {/* <div className="controls">...</div> */}

            {/* Speed indicator hidden */}
            {/* <div className="speed-indicator">...</div> */}

            <div className="container-stream">
                <canvas ref={scannerCanvasRef} id="scannerCanvas" />

                <div className="scanner"></div>

                <div className="card-stream" ref={containerRef}>
                    <div className="card-line cursor-grab-interactive" ref={cardLineRef}>
                        {Array.from({ length: 15 }).map((_, i) => {
                            const src = cardImages[i % cardImages.length];
                            const isRed = src.includes("red");
                            const scale = isRed ? 1.5 : 1;
                            return (
                                <div key={i} className="card-wrapper" data-scale={scale}>


                                    <div
                                        className="card card-normal"
                                        style={{
                                            transform: `scale(${scale})`,
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <img
                                            src={src}
                                            alt={`ZIM shipping container visualization ${i + 1}`}
                                            className="card-image pointer-events-none select-none"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            }}
                                            draggable={false}
                                            loading="lazy"
                                        />
                                    </div>

                                    <div
                                        className="card card-scanned"
                                        style={{
                                            WebkitMaskImage: `url(${src})`,
                                            maskImage: `url(${src})`,
                                            WebkitMaskSize: 'contain',
                                            maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskPosition: 'center',
                                            maskPosition: 'center',
                                            transform: isRed ? 'scale(1.5)' : 'none',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <div className="money-texture"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Credits hidden */}
            {/* <div className="inspiration-credit">...</div> */}
        </div >
    );
};
