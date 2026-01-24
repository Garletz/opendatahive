import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Copy, Move, ExternalLink, X } from 'lucide-react';
import { HiveNode } from '@/types';

interface NodeContextMenuProps {
    node: HiveNode;
    position: { x: number; y: number };
    onClose: () => void;
    onEdit?: (node: HiveNode) => void;
    onDelete?: (nodeId: string) => void;
    onCopy?: (node: HiveNode) => void;
    onMove?: (node: HiveNode) => void;
    onOpen?: (node: HiveNode) => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
    node,
    position,
    onClose,
    onEdit,
    onDelete,
    onCopy,
    onMove,
    onOpen
}) => {
    const menuItems = [
        { icon: ExternalLink, label: 'Open', onClick: () => onOpen?.(node), show: true },
        { icon: Edit3, label: 'Edit', onClick: () => onEdit?.(node), show: node.type === 'note' },
        { icon: Copy, label: 'Copy', onClick: () => onCopy?.(node), show: true },
        { icon: Move, label: 'Move', onClick: () => onMove?.(node), show: true },
        { icon: Trash2, label: 'Delete', onClick: () => onDelete?.(node.id), show: true, danger: true },
    ].filter(item => item.show);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => onClose();
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [onClose]);

    // Adjust position to keep menu in viewport
    const adjustedPosition = {
        x: Math.min(position.x, window.innerWidth - 180),
        y: Math.min(position.y, window.innerHeight - 250)
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    left: adjustedPosition.x,
                    top: adjustedPosition.y,
                    zIndex: 1100
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden min-w-[160px]"
            >
                {/* Header */}
                <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">{node.title}</span>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                    {menuItems.map((item, index) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                item.onClick();
                                onClose();
                            }}
                            className={`w-full px-3 py-2 flex items-center gap-3 text-sm transition-colors
                ${item.danger
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : 'text-slate-300 hover:bg-slate-800'
                                }
              `}
                        >
                            <item.icon size={16} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Node Info Footer */}
                <div className="px-3 py-2 bg-slate-800/30 border-t border-slate-700/50 text-xs text-slate-500">
                    Position: ({node.q}, {node.r})
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NodeContextMenu;
