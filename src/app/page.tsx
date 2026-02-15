"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HeroCanvas } from '@/components/HeroCanvas';
import { SmoothScrolling } from '@/components/SmoothScrolling';
import { NeuralSpine } from '@/components/NeuralSpine';
import { DeploymentIntro } from '@/components/DeploymentIntro';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { VisionaryFooter } from '@/components/VisionaryFooter';

// Performance: Dynamically import heavy components with THREE.js / particle systems



export default function Home() {
    const [isIntroReached, setIsIntroReached] = React.useState(false);

    React.useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen bg-zim-dark text-white selection:bg-zim-teal/30">
            <SmoothScrolling />
            <Navbar />

            {/* SCROLLYTELLING HERO WRAPPER
                - The HeroCanvas handles the pinning and transition.
                - The <Hero> content is passed as children.
                - It will be animated (Fade In + Scale Up) by HeroCanvas automatically.
            */}
            <HeroCanvas>
                <Hero />
            </HeroCanvas>

            {/* Neural Spine Connection */}
            <NeuralSpine />




            {/* Transitional Intro */}
            <DeploymentIntro onReached={() => setIsIntroReached(true)} />

            {/* Feature Showcase (Obsidian Cards) */}
            <FeatureShowcase />

            {/* Visionary Footer */}
            <VisionaryFooter />

        </main>
    );
}
