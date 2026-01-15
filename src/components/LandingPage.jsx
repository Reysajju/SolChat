import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Keep this for the secondary button
import { Shield, Zap, Lock, Globe, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const LandingPage = () => {
    const { setVisible } = useWalletModal();

    return (
        <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[#050508]/10 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">SolChat</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>
                    <div>
                        {/* Secondary Connect Button */}
                        <div className="transform hover:scale-105 transition-transform">
                            <WalletMultiButton style={{ height: '40px', fontSize: '14px', borderRadius: '10px', background: '#1f2229' }} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Dynamic Background Elements */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 right-20 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"
                />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-8 hover:bg-blue-500/20 transition-colors cursor-default"
                        >
                            <Zap size={12} fill="currentColor" /> V 1.0 Public Beta
                        </motion.span>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 tracking-tight">
                            Messaging with <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                                Trillion-Year Security
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            End-to-end encrypted messaging built on Solana.
                            Your identity is your wallet. Your messages are yours alone.
                            No servers can read them. Not even us.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setVisible(true)}
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Chatting Now
                                    <MessageSquare size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </motion.button>

                            <motion.a
                                href="#features"
                                whileHover={{ scale: 1.05 }}
                                className="px-8 py-4 rounded-xl bg-[#1f2229]/50 backdrop-blur-sm border border-white/5 text-gray-300 font-medium hover:bg-[#2a2d36] transition-colors flex items-center gap-2"
                            >
                                Learn More <ChevronDown size={16} />
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-[#08090c] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Architecture of Privacy</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Built from the ground up to utilize the strongest cryptographic primitives available today.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Lock className="text-emerald-400" />}
                            title="X25519 Encryption"
                            desc="Military-grade Diffie-Hellman key exchange ensures that only the intended recipient can ever decrypt your messages."
                        />
                        <FeatureCard
                            icon={<Zap className="text-yellow-400" />}
                            title="Instant & Scalable"
                            desc="Leveraging Supabase Realtime for sub-millisecond message delivery while maintaining complete on-chain identity verification."
                        />
                        <FeatureCard
                            icon={<Globe className="text-blue-400" />}
                            title="Universal Identity"
                            desc="Forget passwords. Login with your Solana wallet. Your identity travels with you across the decentralized web."
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <FAQItem
                        question="Is it really secure?"
                        answer="Yes. We use X25519 for key exchange and XSalsa20-Poly1305 for encryption. This is the same standard used by Signal and WhatsApp, but we verify identity via the Solana blockchain."
                    />
                    <FAQItem
                        question="Do I need SOL to chat?"
                        answer="No! While you need a Solana wallet to sign in (verify ownership), sending messages is currently gasless as we handle the message relay."
                    />
                    <FAQItem
                        question="Can you read my messages?"
                        answer="Absolutely not. Messages are encrypted on your device before they ever leave. We only see encrypted blobs of text. We don't have your private keys."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                <p>&copy; 2024 SolChat. Built for the decentralized future.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-[#0f1115] border border-white/5 hover:border-blue-500/20 transition-all hover:-translate-y-1">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">
            {desc}
        </p>
    </div>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/5 rounded-xl bg-[#0f1115] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-medium hover:bg-white/5 transition-colors"
            >
                {question}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
