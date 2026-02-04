'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

interface PredictiveRoutingSimulatorProps {
    isRunning: boolean;
    onMatch: (score: string) => void;
}

const INITIAL_NODES: Node[] = [
    { id: '1', position: { x: 50, y: 50 }, data: { label: 'Incoming Call (VIP)' }, style: { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px' } },
    { id: '2', position: { x: 300, y: 50 }, data: { label: 'Agent: Sarah (Top Tier)' }, style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px' } },
    { id: '3', position: { x: 300, y: 150 }, data: { label: 'Agent: Mike (General)' }, style: { background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px' } },
];

const INITIAL_EDGES: Edge[] = [];

export default function PredictiveRoutingSimulator({ isRunning, onMatch }: PredictiveRoutingSimulatorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [matchScore, setMatchScore] = useState<string | null>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isRunning) {
            // Simulate AI analyzing
            timeout = setTimeout(() => {
                // Connect Node 1 to Node 2
                const newEdge = { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } };
                setEdges((eds) => addEdge(newEdge, eds));

                setMatchScore('98%');
                onMatch('98%');

                // Reset after a few seconds to loop? Or just keep it connected as per "Stop preserves state" rule.
                // If we want a loop, we need to clear it. But for now, let's just make it a one-off sequence that resets if toggled off/on quickly? 
                // User said "Stop stops at exact same location". So we shouldn't auto-reset while running unless we design a loop.
                // Let's make it loop every 5 seconds if running.

                setTimeout(() => {
                    if (isRunning) {
                        setEdges([]);
                        setMatchScore(null);
                    }
                }, 4000);

            }, 1500);
        }

        return () => clearTimeout(timeout);
    }, [isRunning, setEdges, onMatch]);

    return (
        <div className="w-full h-full bg-slate-900 rounded-2xl relative">
            <div className="absolute top-2 right-2 z-10 bg-black/50 px-2 py-1 rounded text-xs text-gray-400">
                ReactFlow Visualization
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#teal" gap={16} size={1} />
            </ReactFlow>

            <AnimatePresence>
                {matchScore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-emerald-500/50 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(16,185,129,0.3)] z-20"
                    >
                        <h4 className="text-emerald-400 font-bold text-xl mb-1">MATCH FOUND</h4>
                        <div className="text-4xl font-mono font-bold text-white">{matchScore}</div>
                        <p className="text-gray-400 text-xs mt-2">Predicted Success Rate</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
