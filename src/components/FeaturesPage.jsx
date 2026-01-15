import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Lock, Globe, MessageSquare, ChevronRight, UserCheck } from 'lucide-react';

const FeaturesPage = ({ onBack, onStartChat }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-['Inter'] selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div onClick={onBack} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <ArrowLeft size={20} className="text-slate-400" />
                        <span className="font-semibold text-slate-200">Back to Home</span>
                    </div>
                    <img src="/logo.png" alt="SolChat" className="w-8 h-8 opacity-50" />
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6"
                    >
                        Features & Capabilities
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-6"
                    >
                        Built for the <br /> <span className="text-white">sovereign individual.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto"
                    >
                        We combined the security of Signal with the identity primitives of Solana to create the ultimate communication tool.
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Card 1: Encryption (Large) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 row-span-1 bg-[#1e293b] rounded-3xl p-10 relative overflow-hidden group border border-white/5 hover:border-blue-500/20 transition-all"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
                        <Lock className="w-12 h-12 text-blue-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">End-to-End Encrypted</h3>
                        <p className="text-slate-400 text-lg max-w-lg">
                            Every message is encrypted on your device using X25519 key exchange before it ever touches our servers. Even we can't read your messages.
                        </p>
                    </motion.div>

                    {/* Card 2: Speed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 flex flex-col justify-between group hover:border-yellow-500/30 transition-colors"
                    >
                        <Zap className="w-10 h-10 text-yellow-500" />
                        <div>
                            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                            <p className="text-slate-400">Powered by WebSockets for sub-400ms latency.</p>
                        </div>
                    </motion.div>

                    {/* Card 3: Identity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#1e293b] rounded-3xl p-8 border border-white/5 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors"
                    >
                        <UserCheck className="w-10 h-10 text-emerald-500" />
                        <div>
                            <h3 className="text-xl font-bold mb-2">Wallet Identity</h3>
                            <p className="text-slate-400">No passwords. No emails. Login with Phantom or Solflare.</p>
                        </div>
                    </motion.div>

                    {/* Card 4: Global (Large) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="md:col-span-2 bg-[#1e293b] rounded-3xl p-10 relative overflow-hidden border border-white/5 hover:border-indigo-500/20 transition-all"
                    >
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
                        <Globe className="w-12 h-12 text-indigo-400 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Censorship Resistant</h3>
                        <p className="text-slate-400 text-lg max-w-lg">
                            Built on decentralized principles. Your identity lives on the Solana blockchain, meaning no central authority can delete your account or ban you. Feature-rich with emoji reactions and file sharing coming soon.
                        </p>
                    </motion.div>
                </div>

                <div className="mt-20 text-center">
                    <button
                        onClick={onStartChat}
                        className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10"
                    >
                        Experience It Now
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FeaturesPage;
