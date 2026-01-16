import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, Lock, ArrowRight, Menu, X } from 'lucide-react';
import HeroImage from '../assets/hero-3d.png';
import { useState } from 'react';

const LandingPage = ({ onStartChat, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const NavLink = ({ page, label }) => (
        <button
            onClick={() => {
                onNavigate(page);
                setIsMenuOpen(false);
            }}
            className="text-lg md:text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-white font-['Inter'] overflow-x-hidden selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-white/5 transition-all safe-top">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo.png" alt="SolChat Logo" className="w-8 h-8 md:w-9 md:h-9" />
                        <span className="text-xl md:text-2xl font-bold tracking-tight text-white">SolChat</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink page="landing" label="Home" />
                        <NavLink page="features" label="Features" />
                        <NavLink page="security" label="Security" />
                        <NavLink page="faq" label="FAQ" />
                        <button
                            onClick={onStartChat}
                            className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-semibold transition-all border border-white/10 hover:border-blue-500/30"
                        >
                            Launch App
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-300 hover:text-white"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 left-0 w-full bg-[var(--color-bg-elevated)] border-b border-white/5 shadow-2xl p-4 flex flex-col gap-4 z-40"
                    >
                        <NavLink page="landing" label="Home" />
                        <NavLink page="features" label="Features" />
                        <NavLink page="security" label="Security" />
                        <NavLink page="faq" label="FAQ" />
                        <button
                            onClick={() => {
                                onStartChat();
                                setIsMenuOpen(false);
                            }}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-2"
                        >
                            Launch App
                        </button>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-28 md:pt-40 px-4 sm:px-6 max-w-7xl mx-auto min-h-[100dvh] flex flex-col justify-center pb-20 safe-bottom">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                    {/* Image Side (Mobile: Top, Desktop: Right) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center order-1 md:order-2"
                    >
                        <div className="relative w-full max-w-[280px] sm:max-w-md md:max-w-lg aspect-square">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full animate-pulse-slow" />
                            <img
                                src={HeroImage}
                                alt="Encrypted Server"
                                className="relative z-10 w-full drop-shadow-2xl animate-float"
                            />

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-4 right-0 md:-top-4 md:-right-4 bg-[var(--color-bg-elevated)]/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/10 shadow-xl z-20 flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Lock size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Encryption</div>
                                    <div className="text-sm font-bold text-white">X25519</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center md:text-left order-2 md:order-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-400 animate-pulse" />
                            Live on Solana Mainnet
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white">
                            The future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">secure chat</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
                            Experience true privacy. No centralized servers. No phone numbers. Just you and your wallet, fully encrypted.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <button
                                onClick={onStartChat}
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95"
                            >
                                Start Chatting <ArrowRight size={18} />
                            </button>

                            <button
                                onClick={() => onNavigate('features')}
                                className="w-full sm:w-auto px-8 py-4 bg-[var(--color-bg-elevated)] hover:bg-white/10 text-white rounded-xl font-semibold transition-all border border-white/5 active:scale-95"
                            >
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-12 md:mt-16 pt-8 border-t border-white/5">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-white">100%</div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Encrypted</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-white">&lt;0.4s</div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Latency</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-white">$0</div>
                                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Gas Fees</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 bg-[var(--color-bg-primary)] border-t border-white/5 safe-bottom">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs sm:text-sm gap-4">
                    <p>&copy; 2024 SolChat. Fully decentralized.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-slate-400">Privacy</a>
                        <a href="#" className="hover:text-slate-400">Terms</a>
                        <a href="https://github.com/Reysajju/SolChat" target="_blank" className="hover:text-slate-400">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
