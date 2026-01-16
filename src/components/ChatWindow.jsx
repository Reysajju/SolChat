import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { hashWalletAddress, encryptAnonymous, decryptAnonymous } from '../utils/crypto';
import MessageBubble from './MessageBubble';
import { playSendSound, playReceiveSound } from '../utils/sounds';
import { Send, MoreVertical, Shield, Lock, ArrowLeft, PanelLeft } from 'lucide-react';

const ChatWindow = () => {
    const {
        walletAddress,
        encryptionKeys,
        activeContact,
        messages,
        addMessage,
        setMessages,
        setActiveContact,
        toggleSidebar,
        isSidebarOpen,
        refreshSidebar,
        isAuthReady
    } = useStore();

    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // --- Actions ---

    const markMessagesAsRead = async () => {
        if (!activeContact) return;
        const myHash = await hashWalletAddress(walletAddress);
        await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('receiver_hash', myHash)
            .neq('status', 'read');
    };

    const handleReaction = async (msg, emoji) => {
        const currentReactions = msg.reactions || {};
        const userReactions = currentReactions[emoji] || [];
        let newReactionsForEmoji;
        if (userReactions.includes(walletAddress)) {
            newReactionsForEmoji = userReactions.filter(addr => addr !== walletAddress);
        } else {
            newReactionsForEmoji = [...userReactions, walletAddress];
        }
        const updatedReactions = { ...currentReactions, [emoji]: newReactionsForEmoji };
        if (newReactionsForEmoji.length === 0) delete updatedReactions[emoji];

        await supabase
            .from('messages')
            .update({ reactions: updatedReactions })
            .eq('id', msg.id);
    };

    // --- Effects ---

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (!activeContact || !encryptionKeys || !isAuthReady) return;

        const fetchMessages = async () => {
            if (!activeContact.public_encryption_key) {
                setMessages([]);
                return;
            }

            const myHash = await hashWalletAddress(walletAddress);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('receiver_hash', myHash)
                .order('created_at', { ascending: true });

            if (error) return;

            try {
                const decryptedMessages = data.map(msg => {
                    const decryptedContent = decryptAnonymous(encryptionKeys.secretKey, msg.ephemeral_public_key, msg.encrypted_content, msg.nonce);
                    if (!decryptedContent) return null;

                    const isFromContact = decryptedContent.sender === activeContact.wallet_address;
                    const isToContact = decryptedContent.recipient === activeContact.wallet_address;
                    if (!isFromContact && !isToContact) return null;

                    return {
                        ...msg,
                        content: decryptedContent.text,
                        isMe: decryptedContent.sender === walletAddress
                    };
                }).filter(Boolean);

                setMessages(decryptedMessages);
                markMessagesAsRead();
            } catch (err) {
                console.error('Error decrypting messages:', err);
                setMessages([]);
            }
        };

        fetchMessages();

        const setupSubscription = async () => {
            const myHash = await hashWalletAddress(walletAddress);
            const channel = supabase
                .channel(`chat:inbox`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_hash=eq.${myHash}`
                }, (payload) => {
                    const newMsg = payload.new;
                    if (payload.eventType === 'INSERT') {
                        try {
                            const decryptedContent = decryptAnonymous(encryptionKeys.secretKey, newMsg.ephemeral_public_key, newMsg.encrypted_content, newMsg.nonce);
                            if (decryptedContent && (decryptedContent.sender === activeContact.wallet_address || decryptedContent.sender === walletAddress)) {
                                const isIncoming = decryptedContent.sender !== walletAddress;
                                if (isIncoming && document.hidden) {
                                    // Optional: Play notification if tab is hidden
                                }
                                if (isIncoming) playReceiveSound();

                                addMessage({
                                    ...newMsg,
                                    content: decryptedContent.text,
                                    isMe: decryptedContent.sender === walletAddress
                                });
                                if (decryptedContent.sender === activeContact.wallet_address) {
                                    markMessagesAsRead();
                                }
                            }
                        } catch (err) { console.error('Decryption error:', err); }
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(current => current.map(m => (m.id === newMsg.id ? { ...m, ...newMsg } : m)));
                    }
                })
                .subscribe();
            return channel;
        };

        const channelPromise = setupSubscription();
        return () => { channelPromise.then(ch => ch && supabase.removeChannel(ch)); };
    }, [activeContact, walletAddress, encryptionKeys, isAuthReady]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeContact || !encryptionKeys) return;
        setIsSending(true);
        try {
            const payload = { text: inputText, sender: walletAddress, recipient: activeContact.wallet_address };
            const { ciphertext, nonce, ephemeralPublicKey } = encryptAnonymous(activeContact.public_encryption_key, payload);
            const receiverHash = await hashWalletAddress(activeContact.wallet_address);
            const myHash = await hashWalletAddress(walletAddress);

            await supabase.from('messages').insert({
                receiver_hash: receiverHash, encrypted_content: ciphertext,
                nonce, ephemeral_public_key: ephemeralPublicKey, status: 'sent'
            });

            const { ciphertext: myCipher, nonce: myNonce, ephemeralPublicKey: myEph } = encryptAnonymous(encryptionKeys.publicKey, payload);
            const { data: insertedMsg, error: insertError } = await supabase.from('messages').insert({
                receiver_hash: myHash, encrypted_content: myCipher,
                nonce: myNonce, ephemeral_public_key: myEph, status: 'sent'
            }).select().single();

            if (insertedMsg) {
                const newMsg = {
                    ...insertedMsg,
                    content: inputText,
                    isMe: true
                };
                addMessage(newMsg);
                playSendSound();
                refreshSidebar();
            }

            setInputText('');
        } catch (err) { console.error("Send failed:", err); }
        finally { setIsSending(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBack = () => {
        setActiveContact(null);
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    // Empty State - No active contact
    if (!activeContact) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[var(--color-bg-primary)] relative">
                <div className="absolute top-4 left-4 z-20">
                    <button
                        onClick={toggleSidebar}
                        className={`touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hidden md:flex items-center justify-center transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : 'opacity-100'}`}
                        title="Open Sidebar"
                    >
                        <PanelLeft size={20} />
                    </button>
                </div>
                <div className="text-center px-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-6 mx-auto border border-white/5">
                        <Shield size={40} className="text-gray-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-200 mb-2">Welcome to SolChat</h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Select a conversation or search for someone to start messaging securely.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
                        <Lock size={10} />
                        <span>END-TO-END ENCRYPTED</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)] h-full overflow-hidden">
            {/* Header */}
            <div className="h-16 px-4 flex items-center gap-3 border-b border-white/5 bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm shrink-0">
                {/* Back button - mobile only */}
                <button
                    onClick={handleBack}
                    className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 md:hidden"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Toggle Sidebar - Desktop */}
                <button
                    onClick={toggleSidebar}
                    className={`touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hidden md:flex items-center justify-center transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none w-0 p-0 overflow-hidden' : 'opacity-100'}`}
                    title="Open Sidebar"
                >
                    <PanelLeft size={20} />
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {activeContact.username ? activeContact.username.slice(0, 2).toUpperCase() : activeContact.wallet_address.slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-white truncate">
                        {activeContact.username ? `@${activeContact.username}` : `${activeContact.wallet_address.slice(0, 8)}...`}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-medium">
                        <Lock size={8} />
                        <span>Encrypted</span>
                    </div>
                </div>

                {/* Actions */}
                <button className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                                <Lock size={20} className="text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-400">Messages are end-to-end encrypted</p>
                            <p className="text-xs text-gray-600 mt-1">Say hello to start the conversation</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.isMe}
                            onReact={(emoji) => handleReaction(msg, emoji)}
                        />
                    ))
                )}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--color-bg-secondary)] border-t border-white/5 safe-bottom shrink-0">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            className="input-field pr-4 min-h-[48px]"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={isSending || !inputText.trim()}
                        className={`
                            touch-btn w-12 h-12 rounded-xl transition-all duration-200
                            ${inputText.trim()
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        <Send size={18} className={inputText.trim() ? '' : 'opacity-50'} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
