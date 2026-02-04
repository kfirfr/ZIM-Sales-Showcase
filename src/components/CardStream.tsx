"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
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
                const rect = wrapper.getBoundingClientRect();
                const cardLeft = rect.left;
                const cardRight = rect.right;
                const cardWidth = rect.width;

                const normalCard = wrapper.querySelector(".card-normal") as HTMLElement;
                const asciiCard = wrapper.querySelector(".card-ascii") as HTMLElement;

                if (!normalCard || !asciiCard) continue;

                if (cardLeft < scannerRight && cardRight > scannerLeft) {
                    anyScanningActive = true;
                    // Fix: Ensure we don't divide by zero if cardWidth is 0 (unlikely but safe)
                    if (cardWidth > 0) {
                        const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);
                        const scannerIntersectRight = Math.min(scannerRight - cardLeft, cardWidth);

                        const normalClipRight = (scannerIntersectLeft / cardWidth) * 100;
                        const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100;

                        normalCard.style.setProperty("--clip-right", `${normalClipRight}%`);
                        asciiCard.style.setProperty("--clip-left", `${asciiClipLeft}%`);

                        if (!wrapper.hasAttribute("data-scanned") && scannerIntersectLeft > 0) {
                            wrapper.setAttribute("data-scanned", "true");
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
                    if (cardRight < scannerLeft) {
                        normalCard.style.setProperty("--clip-right", "100%");
                        asciiCard.style.setProperty("--clip-left", "100%");
                        anyScanningActive = true; // Still technically "processed"
                    } else if (cardLeft > scannerRight) {
                        normalCard.style.setProperty("--clip-right", "0%");
                        asciiCard.style.setProperty("--clip-left", "0%");
                    }
                    wrapper.removeAttribute("data-scanned");
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
    // 2. PARTICLE SYSTEM (THREE.JS)
    // ---------------------------------------------------------------------
    useEffect(() => {
        if (!particleCanvasRef.current) return;

        const canvas = particleCanvasRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2, window.innerWidth / 2, 125, -125, 1, 1000
        );
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, 250);
        renderer.setClearColor(0x000000, 0);

        // Create Particles
        const particleCount = 400;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);

        // Texture generation - Small Bright White Bubble
        const genCanvas = document.createElement("canvas");
        genCanvas.width = 64;
        genCanvas.height = 64;
        const ctx = genCanvas.getContext("2d");
        if (ctx) {
            const half = 32;
            const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
            // Pure white core
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.9)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(half, half, half, 0, Math.PI * 2);
            ctx.fill();
        }
        const texture = new THREE.CanvasTexture(genCanvas);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
            positions[i * 3 + 2] = 0;

            // Pure White
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;

            const orbitRadius = Math.random() * 200 + 100;
            // Much smaller size range
            sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 25;
            velocities[i] = Math.random() * 60 + 30;
            alphas[i] = (Math.random() * 8 + 2) / 10;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: texture },
                size: { value: 15.0 },
            },
            vertexShader: `
                attribute float alpha;
                varying float vAlpha;
                varying vec3 vColor;
                uniform float size;
                void main() {
                    vAlpha = alpha;
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vAlpha;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Animation Loop
        let animationId: number;
        const animateParticles = () => {
            // Performance: Only animate particles when visible
            if (!state.current.isVisible) {
                animationId = requestAnimationFrame(animateParticles);
                return;
            }

            const positions = geometry.attributes.position.array as Float32Array;
            const alphas = geometry.attributes.alpha.array as Float32Array;
            const time = Date.now() * 0.001;

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i] * 0.016;

                if (positions[i * 3] > window.innerWidth / 2 + 100) {
                    positions[i * 3] = -window.innerWidth / 2 - 100;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
                }

                // Gentle vertical oscillation
                positions[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5;

                const twinkle = Math.floor(Math.random() * 10);
                if (twinkle === 1 && alphas[i] > 0) alphas[i] -= 0.05;
                else if (twinkle === 2 && alphas[i] < 1) alphas[i] += 0.05;

                alphas[i] = Math.max(0, Math.min(1, alphas[i]));
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.alpha.needsUpdate = true;
            renderer.render(scene, camera);
        };

        animateParticles();

        const handleResize = () => {
            camera.left = -window.innerWidth / 2;
            camera.right = window.innerWidth / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, 250);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };

    }, []);

    // ---------------------------------------------------------------------
    // 3. SCANNER LOGIC (2D Canvas)
    // ---------------------------------------------------------------------
    useEffect(() => {
        const canvas = scannerCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let w = window.innerWidth;
        const h = 300;

        // Initial setup
        canvas.width = w;
        canvas.height = h;

        // State vars for Scanner
        const scanParams = {
            intensity: 0.8,
            maxParticles: 800,
            fadeZone: 60
        };

        // Target values
        const scanTargets = {
            intensity: 0.8,
            maxParticles: 800,
            fadeZone: 60
        };

        const particles: any[] = [];
        let particleCount = 0;

        // Cache gradient
        const gradientCanvas = document.createElement("canvas");
        gradientCanvas.width = 16;
        gradientCanvas.height = 16;
        const gCtx = gradientCanvas.getContext("2d");
        if (gCtx) {
            const half = 8;
            const grad = gCtx.createRadialGradient(half, half, 0, half, half, half);
            grad.addColorStop(0, "rgba(255, 255, 255, 1)");
            grad.addColorStop(0.3, "rgba(196, 181, 253, 0.8)");
            grad.addColorStop(0.7, "rgba(139, 92, 246, 0.4)");
            grad.addColorStop(1, "transparent");
            gCtx.fillStyle = grad;
            gCtx.beginPath();
            gCtx.arc(half, half, half, 0, Math.PI * 2);
            gCtx.fill();
        }

        const createParticle = (intensity: number) => {
            const intensityRatio = intensity / 0.8;
            const speedMultiplier = 1 + (intensityRatio - 1) * 1.2;
            const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7;

            return {
                x: (w / 2) + (Math.random() * 3 - 1.5),
                y: Math.random() * h,
                vx: (Math.random() * 0.8 + 0.2) * speedMultiplier,
                vy: (Math.random() * 0.3 - 0.15) * speedMultiplier,
                radius: (Math.random() * 0.6 + 0.4) * sizeMultiplier,
                alpha: Math.random() * 0.4 + 0.6,
                originalAlpha: Math.random() * 0.4 + 0.6,
                decay: (Math.random() * 0.02 + 0.005) * (2 - intensityRatio * 0.5),
                life: 1.0,
                time: 0,
                twinkleSpeed: (Math.random() * 0.06 + 0.02) * speedMultiplier,
                twinkleAmount: Math.random() * 0.15 + 0.1,
            };
        };

        const initParticles = () => {
            for (let i = 0; i < scanParams.maxParticles; i++) {
                particles.push(createParticle(scanParams.intensity));
            }
            particleCount = particles.length;
        };
        initParticles();

        const animateScanner = () => {
            // Performance: Only animate scanner when visible
            if (!state.current.isVisible) {
                animationId = requestAnimationFrame(animateScanner);
                return;
            }

            // Update logic based on `state.current.scannerActive`
            if (state.current.scannerActive) {
                scanTargets.intensity = 1.8;
                scanTargets.maxParticles = 2500;
                scanTargets.fadeZone = 35;
            } else {
                scanTargets.intensity = 0.8;
                scanTargets.maxParticles = 800;
                scanTargets.fadeZone = 60;
            }

            // Lerp values
            scanParams.intensity += (scanTargets.intensity - scanParams.intensity) * 0.05;
            scanParams.maxParticles += (scanTargets.maxParticles - scanParams.maxParticles) * 0.05;
            scanParams.fadeZone += (scanTargets.fadeZone - scanParams.fadeZone) * 0.05;

            ctx.clearRect(0, 0, w, h);
            // Draw Light Bar
            const lbX = w / 2;

            // Simple light bar draw
            ctx.globalCompositeOperation = "lighter";
            const barGrad = ctx.createLinearGradient(lbX - 1, 0, lbX + 1, 0);
            barGrad.addColorStop(0, "rgba(255,255,255,0)");
            barGrad.addColorStop(0.5, "rgba(255,255,255,0.8)");
            barGrad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = barGrad;
            ctx.fillRect(lbX - 1, 0, 2, h);

            // Draw particles
            for (let i = 0; i < particleCount; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    // Reset
                    Object.assign(p, createParticle(scanParams.intensity));
                }

                p.x += p.vx;
                p.y += p.vy;
                p.time++;
                p.life -= p.decay;
                p.alpha = p.originalAlpha * p.life + Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount;

                let fade = 1;
                if (p.y < scanParams.fadeZone) fade = p.y / scanParams.fadeZone;
                if (p.y > h - scanParams.fadeZone) fade = (h - p.y) / scanParams.fadeZone;

                ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha * fade));
                ctx.drawImage(gradientCanvas, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
            }

            // Dynamic particle count adjustment
            const targetCount = Math.floor(scanParams.maxParticles);
            if (particleCount < targetCount) {
                for (let k = 0; k < 5; k++) {
                    if (particleCount < targetCount) {
                        particles.push(createParticle(scanParams.intensity));
                        particleCount++;
                    }
                }
            } else if (particleCount > targetCount) {
                particles.splice(targetCount);
                particleCount = targetCount;
            }
        };
        animateScanner();

        const handleResize = () => {
            w = window.innerWidth;
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

        const header = [
            "// compiled preview • scanner demo",
            "/* generated for visual effect – not executed */",
            "const SCAN_WIDTH = 8;",
            "const FADE_ZONE = 35;",
            "const MAX_PARTICLES = 2500;",
            "const TRANSITION = 0.05;",
        ];

        const helpers = [
            "function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }",
            "function lerp(a, b, t) { return a + (b - a) * t; }",
            "const now = () => performance.now();",
            "function rng(min, max) { return Math.random() * (max - min) + min; }",
        ];

        const particleBlock = (idx: number) => [
            `class Particle${idx} {`,
            "  constructor(x, y, vx, vy, r, a) {",
            "    this.x = x; this.y = y;",
            "    this.vx = vx; this.vy = vy;",
            "    this.r = r; this.a = a;",
            "  }",
            "  step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; }",
            "}",
        ];

        const scannerBlock = [
            "const scanner = {",
            "  x: Math.floor(window.innerWidth / 2),",
            "  width: SCAN_WIDTH,",
            "  glow: 3.5,",
            "};",
            "",
            "function drawParticle(ctx, p) {",
            "  ctx.globalAlpha = clamp(p.a, 0, 1);",
            "  ctx.drawImage(gradient, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);",
            "}",
        ];

        const misc = [
            "const state = { intensity: 1.2, particles: MAX_PARTICLES };",
            "const bounds = { w: window.innerWidth, h: 300 };",
            "const gradient = document.createElement('canvas');",
            "const ctx = gradient.getContext('2d');",
            "ctx.globalCompositeOperation = 'lighter';",
            "// ascii overlay is masked with a 3-phase gradient",
        ];

        const library = [];
        header.forEach((l) => library.push(l));
        helpers.forEach((l) => library.push(l));
        for (let b = 0; b < 3; b++) particleBlock(b).forEach((l) => library.push(l));
        scannerBlock.forEach((l) => library.push(l));
        misc.forEach((l) => library.push(l));

        for (let i = 0; i < 40; i++) {
            const n1 = randInt(1, 9);
            const n2 = randInt(10, 99);
            library.push(`const v${i} = (${n1} + ${n2}) * 0.${randInt(1, 9)};`);
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
        "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b55e654d1341fb06f8_4.1.png",
        "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5a080a31ee7154b19_1.png",
        "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5c1e4919fd69672b8_3.png",
        "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5f6a5e232e7beb4be_2.png",
        "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5bea2f1b07392d936_4.png",
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
                <canvas ref={particleCanvasRef} id="particleCanvas" />
                <canvas ref={scannerCanvasRef} id="scannerCanvas" />

                <div className="scanner"></div>

                <div className="card-stream" ref={containerRef}>
                    <div className="card-line cursor-grab-interactive" ref={cardLineRef}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="card-wrapper">
                                <div className="card card-normal">
                                    <img
                                        src={cardImages[i % cardImages.length]}
                                        alt={`ZIM shipping container visualization ${i + 1}`}
                                        className="card-image pointer-events-none select-none"
                                        draggable={false}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="card card-ascii">
                                    <div className="ascii-content" style={{ fontSize: '11px', lineHeight: '13px' }}>
                                        {generateCode(Math.floor(400 / 6), Math.floor(250 / 13))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Credits hidden */}
            {/* <div className="inspiration-credit">...</div> */}
        </div>
    );
};
