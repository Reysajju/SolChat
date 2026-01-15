import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, Lock } from 'lucide-react';
import HeroImage from '../assets/hero-3d.png';

const LandingPage = ({ onStartChat, onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-['Inter'] overflow-x-hidden selection:bg-blue-500/30">
            {/* Background Gradients - Subtle & Professional */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">SolChat</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
                        <button onClick={() => onNavigate('landing')} className="hover:text-blue-400 transition-colors">Home</button>
                        <button onClick={() => onNavigate('features')} className="hover:text-blue-400 transition-colors">Features</button>
                        <button onClick={() => onNavigate('security')} className="hover:text-blue-400 transition-colors">Security</button>
                        <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">FAQ</button>
                    </div>

                    <button
                        onClick={onStartChat}
                        className="hidden md:block px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white rounded-full text-sm font-semibold transition-all border border-white/5 hover:border-blue-500/30"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Image Side (Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center order-2 md:order-1"
                    >
                        {/* 3D Asset Container */}
                        <div className="relative w-full max-w-lg">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-[60px] rounded-full animate-pulse" />
                            <img
                                src={HeroImage}
                                alt="Encrypted Server"
                                className="relative z-10 w-full drop-shadow-2xl transform hover:scale-105 transition-transform duration-700 hover:rotate-1"
                            />

                            {/* Floating Badges */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 bg-[#1e293b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl z-20 flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Lock size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 font-medium">Encryption</div>
                                    <div className="text-sm font-bold text-white">X25519</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Text Side (Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-left order-1 md:order-2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            Live on Solana Mainnet
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight text-white">
                            The future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">secure communication</span>
                        </h1>
                        <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
                            Experience true privacy. SolChat combines the identity primitives of Solana with military-grade X25519 encryption.
                            <br /><br />
                            No centralized databases. No phone numbers. Just you and your wallet.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStartChat}
                                className="px-8 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
                            >
                                Start Chatting <ChevronDown className="-rotate-90" size={18} />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => onNavigate('features')}
                                className="px-8 py-4 bg-[#1e293b] hover:bg-[#334155] text-white rounded-full font-semibold transition-all border border-white/5"
                            >
                                Explore Features
                            </motion.button>
                        </div>

                        <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
                            <div>
                                <div className="text-3xl font-bold text-white">100%</div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Encrypted</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">&lt;400ms</div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Latency</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">$0.00</div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Gas Fees</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-[#020617] border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>&copy; 2024 SolChat. Secure. Private. Decentralized.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                        <a href="https://github.com/Reysajju/SolChat" target="_blank" className="hover:text-white">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
