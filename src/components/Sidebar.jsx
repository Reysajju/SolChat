import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Search, User, Settings, LogOut, X, PanelLeftClose } from 'lucide-react';
import { hashWalletAddress, decryptAnonymous } from '../utils/crypto';

const Sidebar = () => {
    const { disconnect } = useWallet();
    const {
        walletAddress,
        encryptionKeys,
        userProfile,
        contacts,
        setContacts,
        activeContact,
        setActiveContact,
        isSidebarOpen,
        toggleSidebar,
        toggleSettings,
        logout,
        sidebarTrigger,
        isAuthReady
    } = useStore();

    const handleLogout = async () => {
        logout();
        await disconnect();
    };

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('recent');
    const [recentChats, setRecentChats] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});

    // Fetch Recent Chats & Unread Counts
    useEffect(() => {
        if (!walletAddress || !encryptionKeys || !isAuthReady) return;

        const fetchRecentAndUnreads = async () => {
            setLoading(true);
            try {
                const myHash = await hashWalletAddress(walletAddress);
                const partnersMap = new Map();
                const unreads = {};

                // Track already fetched profiles to avoid refetching
                const fetchedProfiles = new Set();

                let fetchedCount = 0;
                let from = 0;
                const CHUNK_SIZE = 1000;
                // DRAMATICALLY INCREASED LIMIT: 
                // Scan up to 100k messages to find old chats.
                // Since we update incrementally, user sees recent ones instantly.
                const MAX_Scan = 100000;

                // Deep Scan Loop
                // Removed "&& partnersMap.size < MIN_CONTACTS" so we find EVERYONE
                console.log(`[Sidebar] Starting chat scan. From: ${from}, Target Max: ${MAX_Scan}`);

                while (fetchedCount < MAX_Scan) {
                    const { data: messages, error: msgError } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('receiver_hash', myHash)
                        .order('created_at', { ascending: false })
                        .range(from, from + CHUNK_SIZE - 1);

                    if (msgError) {
                        console.error("[Sidebar] Supabase error:", msgError);
                        throw msgError;
                    }

                    if (!messages || messages.length === 0) {
                        console.log("[Sidebar] No more messages found in DB.");
                        break;
                    }

                    let foundNewInChunk = false;
                    let successCount = 0;

                    for (const msg of messages) {
                        try {
                            const decrypted = decryptAnonymous(
                                encryptionKeys.secretKey,
                                msg.ephemeral_public_key,
                                msg.encrypted_content,
                                msg.nonce
                            );

                            if (!decrypted) {
                                // console.warn("[Sidebar] Decryption returned null for msg:", msg.id);
                                continue;
                            }

                            const partnerWallet = decrypted.sender === walletAddress
                                ? decrypted.recipient
                                : decrypted.sender;

                            if (!partnerWallet) continue;

                            successCount++;

                            if (!partnersMap.has(partnerWallet)) {
                                console.log(`[Sidebar] Found new contact: ${partnerWallet.slice(0, 8)}...`);
                                partnersMap.set(partnerWallet, {
                                    wallet_address: partnerWallet,
                                    last_msg: msg.created_at,
                                    last_text: decrypted.text,
                                    unread_count: 0
                                });
                                foundNewInChunk = true;
                            }

                            if (msg.status !== 'read' && decrypted.sender !== walletAddress) {
                                unreads[partnerWallet] = (unreads[partnerWallet] || 0) + 1;
                            }
                        } catch (err) {
                            // Skip undecryptable messages silently
                            // console.error("[Sidebar] Decryption exception:", err);
                            continue;
                        }
                    }

                    console.log(`[Sidebar] Chunk ${from}-${from + CHUNK_SIZE}: Decrypted ${successCount}/${messages.length} successfully. Partners found so far: ${partnersMap.size}`);

                    // Incremental Update: If we found new partners in this chunk, 
                    // fetch their profiles and update UI immediately.
                    if (foundNewInChunk) {
                        const allWallets = Array.from(partnersMap.keys());
                        const walletsToFetch = allWallets.filter(w => !fetchedProfiles.has(w));

                        if (walletsToFetch.length > 0) {
                            const { data: profiles, error: profileError } = await supabase
                                .from('users')
                                .select('wallet_address, username, public_encryption_key')
                                .in('wallet_address', walletsToFetch);

                            if (!profileError && profiles) {
                                profiles.forEach(profile => {
                                    const partnerData = partnersMap.get(profile.wallet_address);
                                    if (partnerData) {
                                        partnersMap.set(profile.wallet_address, { ...partnerData, ...profile });
                                    }
                                    fetchedProfiles.add(profile.wallet_address);
                                });
                            }
                        }

                        // Update State Incrementally
                        const sortedChats = Array.from(partnersMap.values())
                            .sort((a, b) => new Date(b.last_msg) - new Date(a.last_msg));

                        setRecentChats(sortedChats);
                        setUnreadCounts({ ...unreads });
                    }

                    fetchedCount += messages.length;
                    from += CHUNK_SIZE;

                    // Small delay to allow UI to render if loop is tight, though await mostly handles this
                    await new Promise(r => setTimeout(r, 0));
                }

            } catch (err) {
                console.error("Error fetching sidebar data:", err);
            } finally {
                setLoading(false);
            }
        };

        const setupSubscription = async () => {
            const myHash = await hashWalletAddress(walletAddress);
            const channel = supabase
                .channel('sidebar-updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_hash=eq.${myHash}`
                }, () => {
                    fetchRecentAndUnreads();
                })
                .subscribe();

            return channel;
        };

        const channelPromise = setupSubscription();
        fetchRecentAndUnreads();

        return () => {
            channelPromise.then(ch => ch && supabase.removeChannel(ch));
        };

    }, [walletAddress, encryptionKeys, sidebarTrigger, isAuthReady]);

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setViewMode('recent');
                return;
            }

            setViewMode('search');
            setLoading(true);

            let query = supabase
                .from('users')
                .select('*')
                .neq('wallet_address', walletAddress)
                .eq('is_searchable', true);

            const term = searchTerm.toLowerCase();
            query = query.or(`username.ilike.%${term}%,wallet_address.ilike.%${term}%`);

            const { data, error } = await query;
            if (data) setContacts(data);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, walletAddress, setContacts]);

    const handleContactSelect = (contact) => {
        setActiveContact(contact);
        setUnreadCounts(prev => {
            const updated = { ...prev };
            delete updated[contact.wallet_address];
            return updated;
        });
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    const displayList = viewMode === 'search' ? contacts : recentChats;

    // Calculate total unread
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-fade-in"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                w-[85vw] max-w-[320px]
                ${isSidebarOpen
                    ? 'translate-x-0 md:w-80 lg:w-96 border-r border-white/5'
                    : '-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden'}
                bg-[var(--color-bg-secondary)]
                flex flex-col h-full
                transition-all duration-300 ease-in-out
                fixed md:relative inset-y-0 left-0 z-50 md:z-10
            `}>
                {/* Header */}
                <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="SolChat" className="w-8 h-8" />
                        <h1 className="text-lg font-bold text-white hidden sm:block">SolChat</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleSettings}
                            className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors hidden md:flex items-center justify-center"
                            title="Collapse Sidebar"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                        <button
                            onClick={toggleSidebar}
                            className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors md:hidden"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search people..."
                            className="input-field pl-10 h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-2 scrollbar-hide">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-500">
                                {viewMode === 'search' ? 'No users found' : 'No conversations yet'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {viewMode === 'recent' && 'Search for someone to start chatting'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 py-2">
                            {displayList.map((contact) => {
                                const unread = unreadCounts[contact.wallet_address] || 0;
                                const isActive = activeContact?.wallet_address === contact.wallet_address;

                                return (
                                    <button
                                        key={contact.wallet_address}
                                        onClick={() => handleContactSelect(contact)}
                                        className={`
                                            w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                                            ${isActive
                                                ? 'bg-blue-600/10 border border-blue-500/20'
                                                : 'hover:bg-white/5 border border-transparent'}
                                        `}
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                                                ${isActive
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                                    : 'bg-[var(--color-bg-elevated)] text-gray-400'}
                                            `}>
                                                {contact.username
                                                    ? contact.username.slice(0, 2).toUpperCase()
                                                    : contact.wallet_address.slice(0, 2)}
                                            </div>
                                            {/* Online indicator */}
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--color-bg-secondary)] rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                                                    {contact.username ? `@${contact.username}` : `${contact.wallet_address.slice(0, 6)}...`}
                                                </span>
                                                {contact.last_msg && (
                                                    <span className="text-[10px] text-gray-500 shrink-0">
                                                        {formatTime(contact.last_msg)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500 truncate">
                                                    {contact.last_text
                                                        ? contact.last_text.slice(0, 30) + (contact.last_text.length > 30 ? '...' : '')
                                                        : `${contact.wallet_address.slice(0, 4)}...${contact.wallet_address.slice(-4)}`}
                                                </span>
                                                {unread > 0 && (
                                                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                        {unread > 99 ? '99+' : unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer - User Profile */}
                <div className="p-4 border-t border-white/5 safe-bottom shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0">
                            <User size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                                {userProfile?.username ? `@${userProfile.username}` : 'Connected'}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono truncate">
                                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : ''}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="touch-btn w-10 h-10 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper function to format time
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

export default Sidebar;
