import React from 'react';
import useStore from '../store/useStore';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const { isSidebarOpen, toggleSidebar } = useStore();

    return (
        <div className="w-screen h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 glass-panel rounded-xl md:hidden"
            >
                <Menu size={24} className="text-neon-blue" />
            </button>

            <div className="w-full max-w-7xl h-full flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl relative z-0">
                {children}
            </div>
        </div>
    );
};

export default Layout;

