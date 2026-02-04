"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, { Background, Edge, Node, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { User, Smartphone, Bot, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Node for Floating Users
const UserNode = ({ data }: { data: { label: string; icon: any } }) => (
    <div className="flex flex-col items-center p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg w-24">
        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-2 text-zinc-400">
            {data.icon}
        </div>
        <span className="text-[10px] text-center font-mono text-zinc-300 leading-tight">{data.label}</span>
    </div>
);

// Custom Node for Agents
const AgentNode = ({ data }: { data: { label: string; match?: boolean } }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border w-48 shadow-lg transition-all duration-500 ${data.match ? 'bg-teal-900/40 border-zim-teal shadow-[0_0_20px_rgba(45,212,191,0.2)]' : 'bg-zinc-800 border-zinc-700'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.match ? 'bg-zim-teal text-black' : 'bg-zinc-700 text-zinc-400'}`}>
            <Smartphone size={16} />
        </div>
        <div className="flex flex-col">
            <span className={`text-xs font-bold ${data.match ? 'text-white' : 'text-zinc-400'}`}>{data.label}</span>
            {data.match && <span className="text-[10px] text-zim-teal font-mono">BEST MATCH</span>}
        </div>
    </div>
);

const nodeTypes = { user: UserNode, agent: AgentNode };

const initialNodes: Node[] = [
    { id: 'u1', type: 'user', position: { x: 50, y: 20 }, data: { label: 'VIP Customer', icon: <User size={20} className="text-gen-orange" /> } },
    { id: 'u2', type: 'user', position: { x: 50, y: 150 }, data: { label: 'Tech Issue', icon: <User size={20} /> } },
    { id: 'u3', type: 'user', position: { x: 50, y: 280 }, data: { label: 'Billing', icon: <User size={20} /> } },

    { id: 'a1', type: 'agent', position: { x: 400, y: 50 }, data: { label: 'Sarah (Top Tier)', match: true } },
    { id: 'a2', type: 'agent', position: { x: 400, y: 200 }, data: { label: 'Tech Support', match: false } },
];

const initialEdges: Edge[] = [
    { id: 'e1', source: 'u1', target: 'a1', animated: true, style: { stroke: '#2DD4BF', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2DD4BF' } },
];

export function PredictiveRoutingSimulation() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [showMatchBadge, setShowMatchBadge] = useState(false);

    useEffect(() => {
        // Animate badge appearance
        const timer = setTimeout(() => setShowMatchBadge(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] bg-black/20 rounded-lg relative overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Background gap={20} size={1} color="#333" />
            </ReactFlow>

            {/* Pop-up Match Badge */}
            <AnimatePresence>
                {showMatchBadge && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900/90 backdrop-blur-md border border-zim-teal px-6 py-4 rounded-2xl shadow-[0_0_50px_rgba(45,212,191,0.3)] flex flex-col items-center z-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="text-zim-teal" size={24} />
                            <span className="text-white font-bold text-lg">Match Found</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-zim-teal to-white">
                            98.4%
                        </div>
                        <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Prediction Score</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function PredictiveRoutingKPIs() {
    return (
        <div className="flex flex-col gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-zim-teal/30 transition-colors">
                <span className="text-xs text-zinc-500 uppercase block mb-1">Route Accuracy</span>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="h-full bg-zim-teal"
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 2, delay: 0.5 }}
                    />
                </div>
                <span className="text-right block text-xs mt-1 text-zim-teal font-mono">94% VS 62% (LEGACY)</span>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 relative group hover:border-zim-teal/30 transition-colors">
                <div className="absolute inset-0 bg-gen-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs text-zinc-500 uppercase block mb-1">Business KPI</span>
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-mono">
                        $1.2M
                    </span>
                    <span className="text-xs text-gen-orange font-mono tracking-tighter">
                        SAVED ANNUALLY
                    </span>
                </div>
            </div>
        </div>
    );
}
