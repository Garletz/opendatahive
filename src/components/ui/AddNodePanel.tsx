import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Link, Image, File, Plus, Folder } from 'lucide-react';
import { NodeType } from '@/types';

interface AddNodePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNode: (type: NodeType, title: string, content?: string) => void;
    position?: { u: number; v: number };
}

const nodeTypes: { type: NodeType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'note', label: 'Note', icon: <FileText size={20} />, color: '#10b981' },
    { type: 'link', label: 'Link', icon: <Link size={20} />, color: '#06b6d4' },
    { type: 'media', label: 'Media', icon: <Image size={20} />, color: '#f59e0b' },
    { type: 'file', label: 'File', icon: <File size={20} />, color: '#8b5cf6' },
    { type: 'container', label: 'Folder', icon: <Folder size={20} />, color: '#6366f1' },
];

const AddNodePanel: React.FC<AddNodePanelProps> = ({ isOpen, onClose, onAddNode, position }) => {
    const [selectedType, setSelectedType] = useState<NodeType>('note');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddNode(selectedType, title, content);
            setTitle('');
            setContent('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const getContentPlaceholder = () => {
        switch (selectedType) {
            case 'note': return 'Write your note content here...';
            case 'link': return 'https://example.com';
            case 'media': return 'Media URL (image, video, audio)';
            case 'file': return 'File URL or path';
            default: return 'Content...';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[600]"
                style={{ minWidth: '400px', maxWidth: '90vw' }}
            >
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Plus size={18} className="text-amber-400" />
                            <span className="text-slate-200 font-semibold">Add Node</span>
                            {position && (
                                <span className="text-xs text-slate-500 ml-2">
                                    at ({position.u}, {position.v})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Type Selection */}
                    <div className="p-4 border-b border-slate-800">
                        <div className="text-xs text-slate-500 uppercase mb-2">Type</div>
                        <div className="flex gap-2">
                            {nodeTypes.map(({ type, label, icon, color }) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all flex-1 ${selectedType === type
                                            ? 'bg-slate-800 border-2'
                                            : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                                        }`}
                                    style={{ borderColor: selectedType === type ? color : 'transparent' }}
                                >
                                    <span style={{ color }}>{icon}</span>
                                    <span className="text-xs text-slate-400">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase mb-1 block">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Node title..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 uppercase mb-1 block">
                                {selectedType === 'link' ? 'URL' : selectedType === 'note' ? 'Content' : 'Source'}
                            </label>
                            {selectedType === 'note' ? (
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={getContentPlaceholder()}
                                    rows={4}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={getContentPlaceholder()}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!title.trim() || isSubmitting}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Node
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddNodePanel;
