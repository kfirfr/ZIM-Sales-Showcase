import React, { useRef, useState, useEffect } from 'react';

export const ScrollStory = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const phases = [
        { id: 1, text: "We have digitized the voice of the customer.", sub: "PHASE 1: INGESTION", highlight: "text-blue-400" },
        { id: 2, text: "But listening is only the foundation.", sub: "PHASE 2: PROCESSING", highlight: "text-slate-200" },
        { id: 3, text: "Now, we transition to Autonomous Prediction.", sub: "PHASE 3: ACTION", highlight: "quattro-gradient" }
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const { top, height } = containerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const totalScrollDistance = height - windowHeight;
            if (totalScrollDistance <= 0) {
                setScrollProgress(0);
                return;
            }

            const currentScroll = -top;
            const rawProgress = currentScroll / totalScrollDistance;

            setScrollProgress(Math.max(0, Math.min(1, rawProgress)));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="relative h-[300vh] bg-[#020617] mt-32">
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
                <div className="max-w-6xl px-6 relative z-10 text-center w-full">
                    {phases.map((phase, index) => {
                        const rangeStart = index / 3;
                        const rangeEnd = (index + 1) / 3;
                        const rangeCenter = rangeStart + (1 / 6);

                        const isActive = scrollProgress >= rangeStart && scrollProgress < rangeEnd;

                        // New logic: Only show if within range.
                        // We use the dust-reveal class when active, and dust-dissolve when leaving?
                        // Or simpler: controlled by opacity and the filter class based on active state.

                        // We will map opacity and trigger the CSS animation by keying the className on activity? 
                        // Actually, CSS animations run on mount. We need scroll controlled filter.
                        // Let's stick to scroll-driven values but use the SVG filter heavily.

                        const distanceFromCenter = Math.abs(scrollProgress - rangeCenter);

                        // Slower falloff
                        const opacity = Math.max(0, 1 - (distanceFromCenter * 5));

                        // Noise turbulence amount could be mapped to distance
                        // Ideally we would animate the SVG baseFrequency, but we can't easily reactively update SVG defs per item without unique IDs.
                        // Instead we just fade in/out the element which has the static filter applied, simulating "forming".

                        return (
                            <div
                                key={phase.id}
                                className="absolute top-1/2 left-0 right-0 -translate-y-1/2 will-change-transform"
                                style={{
                                    opacity: opacity,
                                    // When far from center, blur more and add filter
                                    filter: opacity < 0.8 ? `blur(${10 * (1 - opacity)}px) url(#dust-filter)` : 'none',
                                    transform: `translateY(-50%) scale(${0.8 + (opacity * 0.2)})`,
                                    pointerEvents: isActive ? 'auto' : 'none',
                                    zIndex: isActive ? 10 : 0,
                                    transition: 'all 0.5s ease-out'
                                }}
                            >
                                <div className={`text-sm font-bold tracking-[0.3em] mb-8 text-slate-500 uppercase transition-colors duration-500 ${opacity > 0.5 ? 'text-blue-400' : ''}`}>
                                    {phase.sub}
                                </div>
                                <h2 className={`text-6xl md:text-8xl font-black leading-tight tracking-tighter ${phase.highlight}`}>
                                    {phase.text}
                                </h2>
                            </div>
                        );
                    })}
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: `${scrollProgress * 100}%` }} />
                </div>
            </div>
        </div>
    );
};
