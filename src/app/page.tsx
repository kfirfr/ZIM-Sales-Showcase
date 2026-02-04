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
const CardStream = dynamic(
    () => import('@/components/CardStream').then(mod => mod.CardStream),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[600px] my-20 flex items-center justify-center">
                <div className="animate-pulse-slow text-white/30 text-sm">Loading...</div>
            </div>
        ),
    }
);

const ZimParticleLogo = dynamic(
    () => import('@/components/ZimParticleLogo').then(mod => mod.ZimParticleLogo),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[500px] my-16 flex items-center justify-center">
                <div className="animate-pulse-slow text-white/30 text-sm">Loading particle effect...</div>
            </div>
        ),
    }
);

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

            {/* Interactive Card Stream */}
            <CardStream />

            {/* Zim Particle Logo */}
            <ZimParticleLogo />

            {/* Transitional Intro */}
            <DeploymentIntro onReached={() => setIsIntroReached(true)} />

            {/* Feature Showcase (Obsidian Cards) */}
            <FeatureShowcase />

            {/* Visionary Footer */}
            <VisionaryFooter />

        </main>
    );
}
