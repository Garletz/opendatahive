import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MistralService, GridAction } from '../services/MistralService';

interface ChatPanelProps {
    onAction: (action: GridAction) => void;
    onClose?: () => void;
}

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onAction, onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', sender: 'ai', text: 'Grid Architect online. Waiting for commands...' }
    ]);
    const [loading, setLoading] = useState(false);
    const serviceRef = useRef<MistralService | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        serviceRef.current = new MistralService();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !serviceRef.current || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
        setLoading(true);

        const response = await serviceRef.current.sendMessage(userMsg);

        setLoading(false);

        // Execute actions
        if (response && response.actions) {
            response.actions.forEach(action => {
                if (action.type === 'message') {
                    setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', sender: 'ai', text: action.text || '' }]);
                } else {
                    onAction(action);
                }
            });
            // If no text message was returned but actions were done
            if (!response.actions.find(a => a.type === 'message')) {
                setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', sender: 'ai', text: 'Commands executed.' }]);
            }
        }
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-24 left-20 z-[1000] w-96 max-h-[600px] flex flex-col bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black overflow-hidden font-mono text-sm cursor-move">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2 text-white">
                    <Terminal className="w-4 h-4" />
                    <span className="font-bold tracking-wider">HIVE ARCHITECT</span>
                </div>
                {/* Connection Status dot */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <span className="text-xs text-white/50">ONLINE</span>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] cursor-text" onPointerDown={(e) => e.stopPropagation()}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg ${msg.sender === 'user'
                            ? 'bg-white/10 text-white border border-white/20 rounded-tr-none'
                            : 'bg-black/40 text-white/90 border border-white/10 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-black/40 p-3 rounded-lg rounded-tl-none border border-white/10 flex items-center gap-2 text-white">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing geometry...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 bg-transparent border-t border-white/10 cursor-text" onPointerDown={(e) => e.stopPropagation()}>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Enter instruction (e.g. 'Build a wall at coordinates 0,0')..."
                        className="w-full bg-black/50 text-white pl-4 pr-10 py-3 rounded border border-white/10 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder:text-white/30"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 p-1.5 text-white hover:text-white/80 hover:bg-white/10 rounded-md transition-all disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
