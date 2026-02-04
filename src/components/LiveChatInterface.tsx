import React, { useEffect, useRef } from 'react';

interface Message {
    role: string;
    text: string;
}

interface LiveChatInterfaceProps {
    messages: Message[];
}

export const LiveChatInterface: React.FC<LiveChatInterfaceProps> = ({ messages }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const highlightText = (text: string) => {
        const regex = /(Urgent|Delay|Risk|Error|Issue|Detention|Wait|Problem)|(Thank you|Great|Approved|Help|Good)|(Invoice|Container|ZIMU|Status)/gi;
        const parts = text.split(regex);

        return parts.filter(part => part).map((part, i) => {
            const lower = part.toLowerCase();
            if (['urgent', 'delay', 'risk', 'error', 'issue', 'detention', 'wait', 'problem'].includes(lower)) {
                return <span key={i} className="highlight-red">{part}</span>;
            } else if (['thank you', 'great', 'approved', 'help', 'good'].includes(lower)) {
                return <span key={i} className="highlight-green">{part}</span>;
            } else if (['invoice', 'container', 'zimu', 'status'].includes(lower)) {
                return <span key={i} className="highlight-blue">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide relative h-full">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0f172a] to-transparent z-10 pointer-events-none"></div>
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'Cust' ? 'justify-end' : 'justify-start'} animate-pop-in`}>
                    <div className={`max-w-[85%] p-3 text-xs leading-relaxed shadow-lg ${msg.role === 'Cust' ? 'chat-bubble-cust' : 'chat-bubble-agent'}`}>
                        <div className="text-[9px] opacity-70 mb-1 font-bold tracking-wider uppercase">{msg.role === 'Cust' ? 'Customer' : 'ZIM Agent'}</div>
                        <div>{highlightText(msg.text)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};
