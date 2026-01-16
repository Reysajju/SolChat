import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Lock, Key, Eye, FileCode, CheckCircle } from 'lucide-react';

const SecurityPage = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-white font-['Inter'] selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[var(--color-bg-primary)]/90 backdrop-blur-md border-b border-white/5 safe-top">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div onClick={onBack} className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity">
                        <ArrowLeft size={20} className="text-slate-400" />
                        <span className="font-semibold text-slate-200">Back</span>
                    </div>
                    <img src="/logo.png" alt="SolChat" className="w-8 h-8 opacity-50" />
                </div>
            </nav>

            <main className="pt-24 pb-20 px-4 md:px-6 max-w-5xl mx-auto safe-bottom">
                {/* Header */}
                <div className="mb-12 md:mb-20 text-center md:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white"
                    >
                        Security Architecture
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto md:mx-0"
                    >
                        We don't trust; we verify. Our security model relies on proven cryptographic primitives, not obscurity.
                    </motion.p>
                </div>

                {/* Main Grid */}
                <div className="grid md:grid-cols-2 gap-10 md:gap-12">

                    {/* Left Column: Concepts */}
                    <div className="space-y-8 md:space-y-12">
                        <SecurityItem
                            icon={<Key className="text-blue-400" />}
                            title="Private Keys Never Leave"
                            desc="Your wallet manages your private keys. SolChat only requests signatures to prove ownership. We never see your seed phrase."
                            delay={0.2}
                            color="blue"
                        />
                        <SecurityItem
                            icon={<Lock className="text-indigo-400" />}
                            title="Curve25519 Encryption"
                            desc="We derive ephemeral encryption keys from your wallet signature. Messages are encrypted with XSalsa20-Poly1305."
                            delay={0.3}
                            color="indigo"
                        />
                        <SecurityItem
                            icon={<Eye className="text-emerald-400" />}
                            title="No Metadata Logging"
                            desc="We store only the encrypted blob and the timestamp. No IP logging. No identity association beyond your wallet address."
                            delay={0.4}
                            color="emerald"
                        />
                    </div>

                    {/* Right Column: Code & Repo */}
                    <div className="space-y-6 md:space-y-8">
                        {/* Code Snippet Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-[var(--color-bg-elevated)] border border-white/10 p-4 md:p-6 font-mono text-xs md:text-sm overflow-x-auto shadow-lg"
                        >
                            <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-white/5 pb-4">
                                <FileCode size={16} />
                                <span>src/utils/crypto.js</span>
                            </div>
                            <div className="text-slate-300 whitespace-pre">
                                <span className="text-blue-400">const</span> <span className="text-yellow-200">encrypt</span> = (<span className="text-orange-300">msg</span>, <span className="text-orange-300">key</span>) ={'>'} {'{'}<br />
                                &nbsp;&nbsp;<span className="text-slate-500">// Generate random nonce</span><br />
                                &nbsp;&nbsp;<span className="text-blue-400">const</span> nonce = nacl.randomBytes(24);<br />
                                &nbsp;&nbsp;<span className="text-slate-500">// Box encryption</span><br />
                                &nbsp;&nbsp;<span className="text-blue-400">const</span> box = nacl.box(<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;msg, nonce, key<br />
                                &nbsp;&nbsp;);<br />
                                &nbsp;&nbsp;<span className="text-purple-400">return</span> {'{'} box, nonce {'}'};<br />
                                {'}'}
                            </div>
                        </motion.div>

                        {/* GitHub Repository Card */}
                        <motion.a
                            href="https://github.com/Reysajju/SolChat"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ delay: 0.5 }}
                            className="block rounded-2xl bg-gradient-to-r from-[#1e293b] to-[#334155] p-6 md:p-8 border border-white/10 shadow-xl group hover:border-blue-500/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Github className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                <span className="text-[10px] md:text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/80 group-hover:bg-blue-500/20 transition-colors">OPEN SOURCE</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">Audit the Code</h3>
                            <p className="text-slate-400 mb-6 font-mono text-xs md:text-sm">github.com/Reysajju/SolChat</p>
                            <div className="flex items-center text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                                View Repository <ArrowLeft className="rotate-180 ml-2" size={16} />
                            </div>
                        </motion.a>
                    </div>
                </div>
            </main>
        </div>
    );
};

const SecurityItem = ({ icon, title, desc, delay, color }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex gap-4 md:gap-6"
    >
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border bg-${color}-900/20 border-${color}-500/20`}>
            {icon}
        </div>
        <div>
            <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-white">{title}</h3>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    </motion.div>
);

export default SecurityPage;
