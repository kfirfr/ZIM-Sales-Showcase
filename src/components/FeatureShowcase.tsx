"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ObsidianFeatureCard } from './ObsidianFeatureCard';
import { PostMeetingAutopilotBox } from './SummaryBox';
import { TranslationBox } from './TranslationBox';
import { EvalBox } from './EvalBox';
import { PredictiveRoutingBox } from './PredictiveRoutingBox';
import { ProactiveEngagementBox } from './ProactiveEngagementBox';
import { VirtualAgentBox } from './VirtualAgentBox';
import { KnowledgeAIBox } from './KnowledgeAIBox';
import { CommandCenterBox } from './CommandCenterBox';

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
                    <ObsidianFeatureCard
                        title="Sales Meeting AI Summary"
                        description="Turn post-meeting commute time into productivity. Instantly update CRM records via conversational voice IVR."
                        badge="Productivity"
                        color="green"
                    >
                        <PostMeetingAutopilotBox />
                    </ObsidianFeatureCard>

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
