import React, { useState } from 'react';
import { Check, CheckCheck, Smile, MoreVertical, Copy, Trash2 } from 'lucide-react';

const MessageBubble = ({ message, isMe, onReact }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const REACTIONS = ['❤️', '👍', '😂', '🔥', '😮'];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message.content);
        setShowOptions(false);
    };

    const StatusIndicator = () => {
        if (!isMe) return null;
        if (message.status === 'read') return <CheckCheck size={14} className="text-blue-400" />;
        if (message.status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />;
        return <Check size={14} className="text-gray-400" />;
    };

    return (
        <div
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3 group relative message-enter`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => {
                setShowReactions(false);
                setShowOptions(false);
            }}
        >
            {/* Options & Reaction Trigger */}
            <div className={`
                absolute top-2 
                ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
                flex items-center gap-1
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                z-10
            `}>
                {/* Reaction Button */}
                <div className="relative group/reaction">
                    <button
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="React"
                    >
                        <Smile size={16} />
                    </button>
                    {/* Hover Reaction Picker */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/reaction:flex bg-[var(--color-bg-elevated)] backdrop-blur-md rounded-full p-1 border border-white/10 shadow-xl gap-0.5">
                        {REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => onReact(emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-transform hover:scale-110 text-sm"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {showOptions && (
                        <div className={`
                            absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'}
                            bg-[var(--color-bg-elevated)] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[120px] flex flex-col z-20
                        `}>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                            >
                                <Copy size={14} /> Copy
                            </button>
                            <button
                                onClick={() => setShowOptions(false)} // Placeholder for delete
                                className="px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Message Bubble */}
                <div
                    className={`
                        px-4 py-2.5 rounded-2xl relative shadow-sm
                        ${isMe
                            ? 'bg-blue-600 text-white rounded-br-md active-message-bubble'
                            : 'bg-[var(--color-bg-elevated)] text-gray-100 rounded-bl-md border border-white/5'}
                    `}
                >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words font-sans">
                        {message.content}
                    </p>
                </div>

                {/* Footer: Time & Status */}
                <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <StatusIndicator />
                </div>

                {/* Reactions Display */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(message.reactions).map(([emoji, wallets]) => (
                            <button
                                key={emoji}
                                onClick={() => onReact(emoji)}
                                className="bg-[var(--color-bg-elevated)] border border-white/5 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-white/10 transition-colors shadow-sm"
                                title={wallets.join(', ')}
                            >
                                <span>{emoji}</span>
                                <span className="text-gray-500 text-[10px] font-medium">{wallets.length}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
