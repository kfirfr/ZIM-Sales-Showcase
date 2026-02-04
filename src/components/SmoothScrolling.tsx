"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const SmoothScrolling = () => {
    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.1,
            duration: 1.5,
            smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const update = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(update);

        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update);
            lenis.destroy();
        };
    }, []);

    return null;
};
