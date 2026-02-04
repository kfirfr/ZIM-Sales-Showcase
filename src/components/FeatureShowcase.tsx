"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ObsidianFeatureCard } from './ObsidianFeatureCard';
import { PostMeetingAutopilotBox } from './SummaryBox';
import { TranslationBox } from './TranslationBox';
import { SentimentBox } from './SentimentBox';
import { EvalBox } from './EvalBox';
import { PredictiveRoutingBox } from './PredictiveRoutingBox';
import { ProactiveEngagementBox } from './ProactiveEngagementBox';
import { VirtualAgentBox } from './VirtualAgentBox';
import { KnowledgeAIBox } from './KnowledgeAIBox';
import { SocialListeningBox } from './SocialListeningBox';

export const FeatureShowcase = () => {
    return (
        <section className="relative z-20 py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                    <span className="quattro-gradient">Genesys AI Engines</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    A complete suite of native AI capabilities integrated directly into the ZIM customer experience workflow.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
                {/* COLUMN 1 - Shifted Down for Staggered Effect */}
                <div className="space-y-12 md:mt-24">
                    <ObsidianFeatureCard
                        title="AI Summarization"
                        description="Instantly condense complex customer interactions into structured CRM notes. Save 4+ minutes per case."
                        badge="Efficiency"
                        color="green"
                    >
                        <PostMeetingAutopilotBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Global Translation"
                        description="Break language barriers with real-time, context-aware translation for cross-border support."
                        badge="Scale"
                        color="orange"
                    >
                        <TranslationBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Churn Mitigation Sentinel"
                        description="Identify and retain at-risk accounts before they leave."
                        badge="Retention"
                        color="gold"
                    >
                        <PredictiveRoutingBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Social Listening"
                        description="AI monitors social media mentions and auto-converts negative posts into prioritized support tickets."
                        badge="Channel Expansion"
                        color="blue"
                    >
                        <SocialListeningBox />
                    </ObsidianFeatureCard>
                </div>

                {/* COLUMN 2 */}
                <div className="space-y-12">
                    <ObsidianFeatureCard
                        title="Real-Time Agent Copilot"
                        description="Overcome objections live with AI-suggested battlecards and scripts."
                        badge="Intelligence"
                        color="blue"
                    >
                        <SentimentBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Auto-Evaluations"
                        description="100% audit coverage. Automatically score every interaction against compliance and quality checks."
                        badge="Quality"
                        color="purple"
                    >
                        <EvalBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Predictive Lead Scoring"
                        description="Identify high-value prospects instantly with AI behavioral scoring."
                        badge="Prevention"
                        color="cyan"
                    >
                        <ProactiveEngagementBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="Agentic Virtual Agent"
                        description="Conversational AI bot handles common queries 24/7 with self-service resolution."
                        badge="Automation"
                        color="rose"
                    >
                        <VirtualAgentBox />
                    </ObsidianFeatureCard>

                    <ObsidianFeatureCard
                        title="AI Knowledge Base"
                        description="Real-time article suggestions powered by AI help agents find answers instantly."
                        badge="Enablement"
                        color="indigo"
                    >
                        <KnowledgeAIBox />
                    </ObsidianFeatureCard>
                </div>
            </div>
        </section>
    );
};
