import React from 'react';
import useStore from '../store/useStore';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { isSidebarOpen, toggleSidebar } = useStore();

    return (
        <div className="w-screen h-[100dvh] flex items-center justify-center p-0 sm:p-4 md:p-8 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Mobile Menu Button - Moved to a more accessible spot and logic improved */}
            <button
                onClick={toggleSidebar}
                className="fixed top-3 left-3 z-50 p-2.5 glass-panel rounded-xl md:hidden shadow-lg border-white/20"
            >
                <Menu size={20} className="text-white" />
            </button>

            <div className="w-full max-w-7xl h-full flex flex-col md:flex-row md:rounded-3xl overflow-hidden shadow-2xl relative z-0">
                {children}
            </div>
        </div>
    );
};

export default Layout;

