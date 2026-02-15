"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { ObsidianFeatureCard } from './ObsidianFeatureCard';
import { Sparkles } from 'lucide-react';

// Lazy load heavy simulation components
const VirtualAgentBox = dynamic(() => import('./VirtualAgentBox').then(mod => mod.VirtualAgentBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const ProactiveEngagementBox = dynamic(() => import('./ProactiveEngagementBox').then(mod => mod.ProactiveEngagementBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const EvalBox = dynamic(() => import('./EvalBox').then(mod => mod.EvalBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const KnowledgeAIBox = dynamic(() => import('./KnowledgeAIBox').then(mod => mod.KnowledgeAIBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const PostMeetingAutopilotBox = dynamic(() => import('./SummaryBox').then(mod => mod.PostMeetingAutopilotBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const CommandCenterBox = dynamic(() => import('./CommandCenterBox').then(mod => mod.CommandCenterBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const PredictiveRoutingBox = dynamic(() => import('./PredictiveRoutingBox').then(mod => mod.PredictiveRoutingBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

const TranslationBox = dynamic(() => import('./TranslationBox').then(mod => mod.TranslationBox), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-xl" />
});

export const FeatureShowcase = () => {
    return (
        <section className="relative z-20 py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
                {/* COLUMN 1 */}
                <div className="space-y-12 md:mt-24">
                    <ObsidianFeatureCard
                        title="Sales Direct Genesys Lines"
                        description="Route client calls directly to sales mobiles while capturing enterprise-grade analytics and AI insights."
                        badge="Connectivity"
                        color="blue"
                    >
                        <VirtualAgentBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="AI Post-Call Summary"
                        description="Every call is transcribed and analyzed. AI generates structured summaries with topics, action items, and mood — delivered automatically."
                        badge="Automation"
                        color="cyan"
                    >
                        <ProactiveEngagementBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Supervisor Performance Dashboard"
                        description="Real-time command center. Monitor team KPIs, leaderboard rankings, and drill down into at-risk reps with AI coaching tips."
                        badge="Compliance"
                        color="rose"
                    >
                        <EvalBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Automated Sales Evaluation"
                        description="AI reads every transcript and scores reps automatically — supervisors get 100% call coverage."
                        badge="Quality"
                        color="gold"
                    >
                        <KnowledgeAIBox />
                    </ObsidianFeatureCard>
                </div>

                {/* COLUMN 2 */}
                <div className="space-y-12">
                    {/* WRAPPER for the Hint Badge */}
                    {/* WRAPPER */}
                    <div className="relative group isolate">

                        {/* THE TECH TAG (Layered BEHIND with z-0, pushed out 92%) */}
                        <div className="absolute top-12 right-0 h-10 z-0 flex items-center transition-transform duration-300 translate-x-[92%] group-hover:translate-x-[96%]">
                            <div className="relative h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 flex items-center pl-4 pr-4 rounded-r-lg shadow-xl border-y border-r border-white/20 whitespace-nowrap">
                                <span className="text-white text-[11px] font-black tracking-wider drop-shadow-md flex items-center gap-1.5 uppercase">
                                    <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse fill-yellow-300" />
                                    Interactive Demo
                                </span>
                            </div>
                        </div>

                        {/* THE CARD (Layered ABOVE with z-10) */}
                        <div className="relative z-10">
                            <ObsidianFeatureCard
                                title="Sales Meeting AI Summary"
                                description="Turn post-meeting commute time into productivity. Instantly update CRM records via conversational voice IVR."
                                badge="Productivity"
                                color="green"
                            >
                                <PostMeetingAutopilotBox />
                            </ObsidianFeatureCard>
                        </div>

                    </div>

                    <ObsidianFeatureCard
                        title="Speech & Text Analytics"
                        description="Mine every sales call for competitor mentions, pricing signals, and urgency keywords. Spot trends before they become threats."
                        badge="Analytics"
                        color="gold"
                    >
                        <CommandCenterBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Call Recording Intelligence"
                        description="Searchable voice archive with automated topic spotting and sentiment analysis."
                        badge="Automation"
                        color="purple"
                    >
                        <PredictiveRoutingBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Transcript Translation Hub"
                        description="Review foreign-language call transcripts instantly. AI translates and surfaces key sales insights from global rep conversations."
                        badge="Global"
                        color="indigo"
                    >
                        <TranslationBox />
                    </ObsidianFeatureCard>
                </div>
            </div>
        </section>
    );
};
