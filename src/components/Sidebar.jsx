import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Search, User, Zap, Settings, X, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { disconnect } = useWallet();
    const {
        walletAddress,
        userProfile,
        contacts,
        setContacts,
        activeContact,
        setActiveContact,
        isSidebarOpen,
        toggleSidebar,
        toggleSettings,
        logout
    } = useStore();

    const handleLogout = async () => {
        logout(); // Clear store & localStorage
        await disconnect(); // Disconnect wallet
    };

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('recent'); // 'recent' or 'search'
    const [recentChats, setRecentChats] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Fetch Recent Chats & Unread Counts
    useEffect(() => {
        if (!walletAddress) return;

        const fetchRecentAndUnreads = async () => {
            setLoading(true);
            try {
                // 1. Fetch Recent Partners via RPC
                const { data: recentData, error: recentError } = await supabase
                    .rpc('get_chat_partners', { user_wallet: walletAddress });

                if (recentError) throw recentError;
                setRecentChats(recentData || []);

                // 2. Fetch Unread Counts
                // Count messages where receiver is ME and status is NOT 'read'
                const { data: unreadData, error: unreadError } = await supabase
                    .from('messages')
                    .select('sender_wallet')
                    .eq('receiver_wallet', walletAddress)
                    .neq('status', 'read');

                if (!unreadError && unreadData) {
                    const counts = {};
                    unreadData.forEach(msg => {
                        counts[msg.sender_wallet] = (counts[msg.sender_wallet] || 0) + 1;
                    });
                    setUnreadCounts(counts);
                }

            } catch (err) {
                console.error("Error fetching sidebar data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentAndUnreads();

        // Subscribe to new messages to update unread counts/recent list real-time
        const channel = supabase
            .channel('sidebar-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                if (newMsg.receiver_wallet === walletAddress || newMsg.sender_wallet === walletAddress) {
                    fetchRecentAndUnreads();
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                // Update if status changes (e.g. read)
                if (payload.new.receiver_wallet === walletAddress) {
                    fetchRecentAndUnreads();
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, [walletAddress]);


    // Search Logic (same as before but updates 'contacts' state)
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

        // Clear unread count for this contact immediately (optimistic update)
        // The actual status update happens in ChatWindow when messages are marked as read
        setUnreadCounts(prev => {
            const updated = { ...prev };
            delete updated[contact.wallet_address];
            return updated;
        });

        // Mobile: Close sidebar
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // Filtered list to display
    const displayList = viewMode === 'search' ? contacts : recentChats;

    if (!isSidebarOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={toggleSidebar} />

            <div className={`
                fixed md:relative inset-y-0 left-0 h-[100dvh] flex flex-col 
                bg-[#0b0c10] border-r border-white/5 
                transition-all duration-300 ease-in-out z-40 md:z-10
                ${isCollapsed ? 'w-20' : 'w-[85vw] sm:w-80'}
            `}>

                {/* Header */}
                <div className={`p-4 md:p-5 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                    <div className="flex items-center space-x-3">
                        <img src="/logo.png" alt="SolChat" className="w-9 h-9" />
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                                SolChat
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {!isCollapsed && (
                            <button onClick={toggleSettings} className="p-3 md:p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors">
                                <Settings size={20} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        )}
                        {/* Desktop Collapse Toggle */}
                        <button onClick={toggleCollapse} className="hidden md:flex p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors">
                            {isCollapsed ? <Search size={20} /> : <div className="w-1 h-4 bg-gray-700 rounded-full group-hover:bg-gray-500 transition-colors"></div>}
                        </button>
                    </div>
                </div>

                {/* Search Bar - Hide if collapsed */}
                {!isCollapsed && (
                    <div className="px-5 mb-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search people..."
                                className="w-full bg-[#16181d] text-[13px] py-3 pl-10 pr-4 rounded-xl border border-transparent focus:border-blue-500/20 focus:bg-[#1a1c22] focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all text-gray-200 placeholder-gray-600 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto px-3 space-y-1 py-4 scrollbar-hide">
                    {loading ? (
                        <div className="flex justify-center mt-10"><div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
                    ) : displayList.length === 0 ? (
                        !isCollapsed && <div className="text-center text-xs text-gray-600 mt-10 font-medium">No conversations found</div>
                    ) : (
                        displayList.map((item) => {
                            const contact = viewMode === 'recent' ? item : item;
                            const unread = unreadCounts[contact.wallet_address] || 0;
                            const isActive = activeContact?.wallet_address === contact.wallet_address;

                            return (
                                <div
                                    key={contact.wallet_address}
                                    onClick={() => handleContactSelect(contact)}
                                    className={`
                                        relative group flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                                        ${isActive ? 'bg-[#1c1f26] border border-white/5 shadow-sm' : 'border border-transparent hover:bg-[#16181d]'}
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className={`
                                            w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-colors
                                            ${isActive
                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md'
                                                : 'bg-[#1f2229] text-gray-400 group-hover:bg-[#252830] group-hover:text-gray-300'}
                                        `}>
                                            {contact.username ? contact.username.slice(0, 2).toUpperCase() : contact.wallet_address.slice(0, 2)}
                                        </div>
                                        {/* Online Indicator (Mock) */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#0b0c10] rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Info - Hide if collapsed */}
                                    {!isCollapsed && (
                                        <div className="ml-3.5 flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className={`text-[14px] font-semibold truncate ${isActive ? 'text-gray-100' : 'text-gray-300 group-hover:text-gray-200'}`}>
                                                    {contact.username ? `@${contact.username}` : 'Unknown'}
                                                </span>
                                                {contact.last_msg && (
                                                    <span className="text-[10px] text-gray-600 font-medium">
                                                        {new Date(contact.last_msg).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 font-mono truncate max-w-[140px] opacity-80">
                                                    {contact.wallet_address.slice(0, 4)}...{contact.wallet_address.slice(-4)}
                                                </span>
                                                {/* Unread Badge */}
                                                {unread > 0 && (
                                                    <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 h-4 min-w-[18px] flex items-center justify-center rounded-full shadow-sm shadow-blue-900/20">
                                                        {unread}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Collapsed Unread Dot */}
                                    {isCollapsed && unread > 0 && (
                                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-[#0b0c10] rounded-full"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer / User Profile */}
                <div className={`p-4 border-t border-white/5 bg-[#0e1014] ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-800 border border-white/5 flex items-center justify-center">
                                    <User size={16} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-300 tracking-wide">
                                        {userProfile?.username ? `@${userProfile.username}` : 'Connected'}
                                    </p>
                                    <p className="text-[10px] text-gray-600 truncate font-mono mt-0.5">
                                        {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-9 h-9 rounded-full bg-[#1f2229] flex items-center justify-center group cursor-pointer hover:bg-red-500/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} className="text-gray-400 group-hover:text-red-400" />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
