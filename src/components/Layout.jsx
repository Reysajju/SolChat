import React from 'react';
import useStore from '../store/useStore';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { isSidebarOpen, toggleSidebar } = useStore();

    return (
        <div className="w-screen h-[100dvh] flex flex-col md:flex-row bg-[var(--color-bg-primary)] relative overflow-hidden">
            {/* Ambient Background Glows - Subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Mobile Header Bar */}
            <div className="md:hidden h-14 flex items-center px-4 border-b border-white/5 bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm safe-top shrink-0 z-30">
                <button
                    onClick={toggleSidebar}
                    className="touch-btn w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} className="text-gray-300" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                    <img src="/logo.png" alt="SolChat" className="w-7 h-7" />
                    <span className="ml-2 text-base font-semibold text-white">SolChat</span>
                </div>
                <div className="w-10" /> {/* Spacer for balance */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-row overflow-hidden relative z-10">
                {children}
            </div>
        </div>
    );
};

export default Layout;
