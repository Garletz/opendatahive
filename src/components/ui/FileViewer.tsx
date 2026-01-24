import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Maximize2, Minimize2, Copy, Download, Edit3, Save, ExternalLink } from 'lucide-react';
import { HiveNode } from '@/types';

interface FileViewerProps {
    node: HiveNode;
    onClose: () => void;
    onSave?: (nodeId: string, newContent: { text?: string }) => Promise<void>;
}

const FileViewer: React.FC<FileViewerProps> = ({ node, onClose, onSave }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(node.content?.text || '');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const dragControls = useDragControls();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(node.id, { text: editContent });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to save:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = () => {
        const textToCopy = node.content?.text || node.content?.url || '';
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const url = node.content?.fileUrl || node.content?.url;
        if (url) {
            window.open(url, '_blank');
        }
    };

    const getIcon = () => {
        switch (node.type) {
            case 'note': return '📝';
            case 'link': return '🔗';
            case 'media': return '🖼️';
            case 'file': return '📁';
            case 'model': return '🎮';
            default: return '📄';
        }
    };

    const renderContent = () => {
        switch (node.type) {
            case 'note':
                return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {isEditing ? (
                            <textarea
                                ref={textareaRef}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    color: '#e2e8f0',
                                    fontSize: '0.9rem',
                                    fontFamily: 'monospace',
                                    resize: 'none',
                                    outline: 'none'
                                }}
                            />
                        ) : (
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace'
                            }}>
                                {node.content?.text || 'No content'}
                            </div>
                        )}
                    </div>
                );

            case 'media':
                const mediaUrl = node.content?.fileUrl || node.content?.thumbnailUrl;
                const isVideo = mediaUrl?.match(/\.(mp4|webm|mov)$/i);
                const isAudio = mediaUrl?.match(/\.(mp3|wav|ogg)$/i);

                if (isVideo) {
                    return (
                        <video
                            src={mediaUrl}
                            controls
                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                        />
                    );
                } else if (isAudio) {
                    return (
                        <audio src={mediaUrl} controls style={{ width: '100%' }} />
                    );
                } else {
                    return (
                        <img
                            src={mediaUrl}
                            alt={node.title}
                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    );
                }

            case 'link':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <ExternalLink size={48} color="#60a5fa" style={{ marginBottom: '16px' }} />
                        <div style={{ color: '#e2e8f0', marginBottom: '8px' }}>{node.description || 'External Link'}</div>
                        <a
                            href={node.content?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#60a5fa',
                                textDecoration: 'underline',
                                wordBreak: 'break-all'
                            }}
                        >
                            {node.content?.url}
                        </a>
                    </div>
                );

            case 'file':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Download size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                        <div style={{ color: '#e2e8f0', marginBottom: '16px' }}>{node.title}</div>
                        <button
                            onClick={handleDownload}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                margin: '0 auto'
                            }}
                        >
                            <Download size={18} /> Download File
                        </button>
                    </div>
                );

            default:
                return (
                    <div style={{ padding: '20px', color: '#94a3b8', textAlign: 'center' }}>
                        Content preview not available for this type.
                    </div>
                );
        }
    };

    return (
        <motion.div
            drag={!isMaximized}
            dragControls={dragControls}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{
                position: 'fixed',
                ...(isMaximized ? {
                    top: '80px',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    width: 'auto',
                    height: 'auto'
                } : {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    maxWidth: '90vw',
                    maxHeight: '80vh'
                }),
                zIndex: 1000,
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
                borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                style={{
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isMaximized ? 'default' : 'grab'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {node.title}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {node.type}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            display: 'flex'
                        }}
                        title={isMaximized ? 'Minimize' : 'Maximize'}
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex'
                        }}
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {renderContent()}
            </div>

            {/* Footer with actions */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        color: copied ? '#10b981' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem'
                    }}
                >
                    <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
                </button>

                {node.type === 'note' && onSave && (
                    isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                opacity: isSaving ? 0.7 : 1
                            }}
                        >
                            <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <Edit3 size={14} /> Edit
                        </button>
                    )
                )}

                {(node.content?.fileUrl || node.content?.url) && (
                    <button
                        onClick={handleDownload}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                        }}
                    >
                        <ExternalLink size={14} /> Open
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default FileViewer;
