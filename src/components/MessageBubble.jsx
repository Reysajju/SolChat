import React, { useState } from 'react';
import { Lock, FileText, Download, Trash2, Check, CheckCheck, Smile, Plus } from 'lucide-react';

const MessageBubble = ({ message, isMe, onDownload, onReact }) => {
    const isFile = message.is_file || (message.file_info !== undefined);
    const [showReactions, setShowReactions] = useState(false);

    const REACTIONS = ['❤️', '👍', '😂', '🔥', '😮'];

    const StatusIndicator = () => {
        if (!isMe) return null;
        if (message.status === 'read') return <CheckCheck size={14} className="text-blue-400" />;
        // Assuming 'delivered' might be implemented later, for now 'sent' shows single check
        // Or if we treat 'sent' as server-confirmed, maybe single check.
        // Let's use CheckCheck gray for 'delivered' if we had it, but for now 'sent' is Check.
        return <Check size={14} className="text-gray-400/70" />;
    };

    return (
        <div
            className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-6 px-4 group relative`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
        >
            {/* Reaction Trigger (Left for Me, Right for Others) */}
            <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'left-auto right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                <div className="flex bg-gray-800/80 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
                    {REACTIONS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-transform hover:scale-125 text-sm"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col relative max-w-[70%]">
                <div
                    className={`
                        p-3 px-4 rounded-2xl backdrop-blur-md border 
                        ${isMe
                            ? 'bg-blue-600 text-white rounded-br-sm border-blue-500'
                            : 'bg-[#1e1e1e] text-gray-200 rounded-bl-sm border-white/5'}
                        shadow-sm
                    `}
                >
                    {isFile && message.file_info ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-1">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <FileText size={20} className="text-blue-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium text-sm truncate block">{message.file_info.name}</span>
                                    <span className="text-[10px] opacity-60 font-mono">{(message.file_info.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>

                            {isMe ? (
                                <div className="flex items-center gap-1.5 text-xs opacity-70">
                                    <Lock size={12} />
                                    <span>Encrypted View-Once</span>
                                </div>
                            ) : (
                                <div>
                                    {message.file_info.downloaded ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                                            <Trash2 size={14} />
                                            <span>Deleted from server</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={onDownload}
                                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full justify-center"
                                        >
                                            <Download size={14} />
                                            <span>Decrypt & Download</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                </div>

                {/* Footer: Time & Status */}
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'} text-[10px] text-gray-500 font-medium`}>
                    {isFile && <Lock size={8} className="opacity-50" />}
                    <span>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <StatusIndicator />
                </div>

                {/* Reactions Display */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(message.reactions).map(([emoji, wallets]) => (
                            <div
                                key={emoji}
                                className="bg-gray-800/80 border border-white/5 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 shadow-sm"
                                title={wallets.join(', ')}
                            >
                                <span>{emoji}</span>
                                <span className="text-gray-400 text-[10px]">{wallets.length}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
