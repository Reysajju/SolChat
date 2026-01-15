import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { encryptMessage, decryptMessage, computeSharedSecret } from '../utils/crypto';
import MessageBubble from './MessageBubble';
import { Send, MoreVertical, Shield, Paperclip, Lock } from 'lucide-react';
import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

const ChatWindow = () => {
    const {
        walletAddress,
        encryptionKeys,
        activeContact,
        messages,
        addMessage,
        setMessages
    } = useStore();

    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Actions ---

    const markMessagesAsRead = async () => {
        if (!activeContact) return;

        // Update all messages from Active Contact to Me that are not 'read'
        await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('sender_wallet', activeContact.wallet_address)
            .eq('receiver_wallet', walletAddress)
            .neq('status', 'read');
    };

    const handleReaction = async (msg, emoji) => {
        const currentReactions = msg.reactions || {};
        const userReactions = currentReactions[emoji] || [];

        // Toggle reaction
        let newReactionsForEmoji;
        if (userReactions.includes(walletAddress)) {
            newReactionsForEmoji = userReactions.filter(addr => addr !== walletAddress);
        } else {
            newReactionsForEmoji = [...userReactions, walletAddress];
        }

        const updatedReactions = { ...currentReactions, [emoji]: newReactionsForEmoji };

        // Cleanup empty arrays
        if (newReactionsForEmoji.length === 0) delete updatedReactions[emoji];

        // Optimistic UI Update (optional, but good for responsiveness)
        const updatedMsg = { ...msg, reactions: updatedReactions };
        // We rely on realtime to update the store, but we could update locally here too.

        await supabase
            .from('messages')
            .update({ reactions: updatedReactions })
            .eq('id', msg.id);
    };


    // --- File Handling (Existing Code - Kept Simplified for brevity in diff, but logic remains) ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        handleFileUpload(file);
    };

    const handleFileUpload = async (file) => {
        // ... (Keep existing file upload logic) 
        // Note: For brevity in this multi_replace, I am assuming the file upload logic is unchanged.
        // If I need to rewrite it to include 'status', I will.
        // Actually, let's just make sure 'status' defaults to 'sent' in DB, which it does.

        if (!activeContact || !encryptionKeys) return;
        setIsSending(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const fileUint8 = new Uint8Array(arrayBuffer);
            const { encryptFile } = await import('../utils/crypto');
            const { encryptedFile, fileKey, fileNonce } = encryptFile(fileUint8);
            const sharedSecret = computeSharedSecret(encryptionKeys.secretKey, activeContact.public_encryption_key);
            const { ciphertext: encryptedKey, nonce: keyNonce } = encryptMessage(sharedSecret, { key: fileKey });

            const filePath = `${walletAddress}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('secure-files').upload(filePath, encryptedFile);

            if (uploadError) throw uploadError;

            const fileInfo = {
                path: filePath, name: file.name, size: file.size, type: file.type,
                encrypted_key: encryptedKey, key_nonce: keyNonce, file_nonce: fileNonce, downloaded: false
            };

            const { ciphertext, nonce } = encryptMessage(sharedSecret, { text: "📎 Secure File Sent" });

            const { error: dbError } = await supabase.from('messages').insert({
                sender_wallet: walletAddress,
                receiver_wallet: activeContact.wallet_address,
                encrypted_content: ciphertext,
                nonce: nonce,
                is_file: true,
                file_info: fileInfo,
                status: 'sent'
            });

            if (dbError) throw dbError;

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    // ... (Keep handleFileDownload) ...
    const handleFileDownload = async (msg) => {
        // ... (Same as original)
        if (!msg.file_info || msg.file_info.downloaded) return;
        try {
            const { decryptFile } = await import('../utils/crypto');
            const sharedSecret = computeSharedSecret(encryptionKeys.secretKey, activeContact.public_encryption_key);
            const decryptedKeyObj = decryptMessage(sharedSecret, msg.file_info.encrypted_key, msg.file_info.key_nonce);
            if (!decryptedKeyObj || !decryptedKeyObj.key) throw new Error("Failed to decrypt file key");
            const fileKey = decryptedKeyObj.key;
            const { data: blob, error: downloadError } = await supabase.storage.from('secure-files').download(msg.file_info.path);
            if (downloadError) throw downloadError;
            const encryptedBuffer = await blob.arrayBuffer();
            const decryptedFileBytes = decryptFile(new Uint8Array(encryptedBuffer), fileKey, msg.file_info.file_nonce);
            if (!decryptedFileBytes) throw new Error("File integrity check failed");
            const url = window.URL.createObjectURL(new Blob([decryptedFileBytes], { type: msg.file_info.type }));
            const a = document.createElement('a');
            a.href = url; a.download = msg.file_info.name;
            document.body.appendChild(a); a.click();
            window.URL.revokeObjectURL(url); document.body.removeChild(a);
            await supabase.storage.from('secure-files').remove([msg.file_info.path]);
            const updatedInfo = { ...msg.file_info, downloaded: true };
            await supabase.from('messages').update({ file_info: updatedInfo }).eq('id', msg.id);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Detailed Error: " + error.message);
        }
    };

    // --- Effects ---

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => { scrollToBottom(); }, [messages]);

    // Fetch & Subscribe
    useEffect(() => {
        if (!activeContact || !encryptionKeys) return;

        const fetchMessages = async () => {
            // Debug: Log the active contact to see what we're working with
            console.log('Active Contact:', activeContact);
            console.log('Public Encryption Key:', activeContact.public_encryption_key);

            // Guard: Check if contact has a valid public encryption key
            if (!activeContact.public_encryption_key) {
                console.error('Contact does not have a public encryption key. They need to log in first.');
                setMessages([]);
                return;
            }

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_wallet.eq.${walletAddress},receiver_wallet.eq.${walletAddress}`)
                .or(`sender_wallet.eq.${activeContact.wallet_address},receiver_wallet.eq.${activeContact.wallet_address}`)
                .order('created_at', { ascending: true });

            if (error) return;

            try {
                const sharedSecret = computeSharedSecret(encryptionKeys.secretKey, activeContact.public_encryption_key);
                const decryptedMessages = data.map(msg => {
                    // Decrypt logic
                    let isActiveConv = (msg.sender_wallet === walletAddress && msg.receiver_wallet === activeContact.wallet_address) ||
                        (msg.sender_wallet === activeContact.wallet_address && msg.receiver_wallet === walletAddress);
                    if (!isActiveConv) return null;

                    const decryptedContent = decryptMessage(sharedSecret, msg.encrypted_content, msg.nonce);
                    return { ...msg, content: decryptedContent ? decryptedContent.text : '⚠️ Decryption Failed' };
                }).filter(Boolean);

                setMessages(decryptedMessages);
                markMessagesAsRead(); // Mark as read on load
            } catch (err) {
                console.error('Error decrypting messages:', err);
                setMessages([]);
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat:${activeContact.wallet_address}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                const isRelevant =
                    (newMsg.sender_wallet === walletAddress && newMsg.receiver_wallet === activeContact.wallet_address) ||
                    (newMsg.sender_wallet === activeContact.wallet_address && newMsg.receiver_wallet === walletAddress);

                if (!isRelevant) return;

                if (payload.eventType === 'INSERT') {
                    try {
                        const sharedSecret = computeSharedSecret(encryptionKeys.secretKey, activeContact.public_encryption_key);
                        const decryptedContent = decryptMessage(sharedSecret, newMsg.encrypted_content, newMsg.nonce);
                        const msgWithContent = { ...newMsg, content: decryptedContent ? decryptedContent.text : '⚠️ Decryption Failed' };
                        addMessage(msgWithContent);

                        if (newMsg.sender_wallet === activeContact.wallet_address) {
                            markMessagesAsRead(); // Mark as read immediately if chat is open
                        }
                    } catch (err) {
                        console.error('Error decrypting new message:', err);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    setMessages(current => current.map(m => {
                        if (m.id === newMsg.id) {
                            return { ...m, status: newMsg.status, reactions: newMsg.reactions, file_info: newMsg.file_info };
                        }
                        return m;
                    }));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [activeContact, walletAddress, encryptionKeys]);


    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeContact || !encryptionKeys) return;
        setIsSending(true);
        try {
            const sharedSecret = computeSharedSecret(encryptionKeys.secretKey, activeContact.public_encryption_key);
            const { ciphertext, nonce } = encryptMessage(sharedSecret, { text: inputText });

            const { error } = await supabase.from('messages').insert({
                sender_wallet: walletAddress,
                receiver_wallet: activeContact.wallet_address,
                encrypted_content: ciphertext,
                nonce: nonce,
                status: 'sent'
            });

            if (error) throw error;
            setInputText('');
        } catch (err) {
            console.error("Failed to send:", err);
        } finally {
            setIsSending(false);
        }
    };

    const formattedTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!activeContact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0f1115] ml-0 md:ml-[1px] relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-gray-800 to-gray-900 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                    <Shield size={48} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-200 mb-2">Welcome to SolChat</h2>
                <p className="text-sm text-gray-500 max-w-sm text-center">
                    Select a contact to start a secure, end-to-end encrypted conversation.
                </p>
                <div className="absolute bottom-8 text-[10px] items-center flex gap-2 text-gray-700 font-mono">
                    <Lock size={10} /> END-TO-END ENCRYPTED VIA X25519
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0f1115] relative overflow-hidden h-full">
            {/* Header */}
            <div className="h-16 md:h-18 px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#0f1115]/95 backdrop-blur-sm flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center space-x-3 md:space-x-4 ml-10 md:ml-0">
                    <div className="relative">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-xs md:text-sm shadow-md">
                            {activeContact.username ? activeContact.username.slice(0, 2).toUpperCase() : activeContact.wallet_address.slice(0, 2)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 border-2 border-[#0f1115] rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-gray-100 font-semibold text-sm md:text-base leading-tight truncate max-w-[120px] sm:max-w-none">
                            {activeContact.username ? `@${activeContact.username}` : 'Unknown User'}
                        </h2>
                        <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] md:text-[11px] text-gray-500 font-mono tracking-wide">
                                {activeContact.wallet_address.slice(0, 4)}...{activeContact.wallet_address.slice(-4)}
                            </span>
                            <span className="hidden sm:block w-0.5 h-3 bg-gray-700 rounded-full"></span>
                            <span className="hidden sm:flex text-[10px] text-emerald-500 items-center gap-1 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                <Lock size={8} /> Encrypted
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 scroll-smooth">
                {/* Date separators could go here */}
                {/* Date separators could go here */}
                {(Array.isArray(messages) ? messages : []).map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMe={msg.sender_wallet === walletAddress}
                        onDownload={() => handleFileDownload(msg)}
                        onReact={(emoji) => handleReaction(msg, emoji)}
                    />
                ))}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-5 bg-[#0f1115] border-t border-white/5 shrink-0 z-20">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <div className="flex items-end space-x-2 md:space-x-3 bg-[#1a1cf20] p-0 rounded-3xl relative">
                    <div className="flex-1 bg-[#181a1e] rounded-xl md:rounded-2xl border border-white/5 focus-within:border-blue-500/30 focus-within:bg-[#1c1e24] transition-all flex items-center px-1.5 md:px-2 py-1.5 md:py-2 shadow-sm">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 md:p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Attach Secure File"
                        >
                            <Paperclip size={18} className="md:w-5 md:h-5" />
                        </button>

                        <input
                            type="text"
                            className="flex-1 bg-transparent text-sm md:text-[15px] text-gray-200 placeholder-gray-600 px-2 md:px-3 py-1.5 md:py-2 focus:outline-none min-w-0"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />

                        <button
                            onClick={handleSendMessage}
                            disabled={isSending || !inputText.trim()}
                            className={`
                                p-2 md:p-2.5 rounded-lg md:rounded-xl ml-1 md:ml-2 transition-all duration-200 flex items-center justify-center
                                ${inputText.trim()
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'}
                            `}
                        >
                            <Send size={16} className="md:w-[18px] md:h-[18px]" fill={inputText.trim() ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-1.5">
                    <p className="text-[9px] md:text-[10px] text-gray-600">End-to-end encrypted • X25519</p>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
