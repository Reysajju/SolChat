import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Lock, Key, ShieldCheck, Eye, FileCode } from 'lucide-react';

const SecurityPage = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-['Inter'] selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div onClick={onBack} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <ArrowLeft size={20} className="text-slate-400" />
                        <span className="font-semibold text-slate-200">Back to Home</span>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold mb-6 text-white"
                    >
                        Security Architecture
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-400 leading-relaxed"
                    >
                        We don't trust; we verify. Our security model relies on proven cryptographic primitives, not obscurity.
                    </motion.p>
                </div>

                {/* Main Grid */}
                <div className="grid md:grid-cols-2 gap-12">

                    {/* Left Column: Concepts */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                                <Key className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Private Keys Never Leave</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Your wallet (Phantom/Solflare) manages your private keys. SolChat only requests signatures to prove ownership. We never have access to your funds or seed phrase.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-900/20 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <Lock className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Curve25519 Encryption</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    We derive ephemeral encryption keys from your wallet signature. Messages are encrypted with XSalsa20-Poly1305 before transmission.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                <Eye className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">No Metadata Logging</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    We store only the encrypted blob and the timestamp. We do not track IP addresses or associate identities beyond public wallet addresses.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Code & Repo */}
                    <div className="space-y-8">
                        {/* Code Snippet Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl bg-[#1e293b] border border-white/10 p-6 font-mono text-sm overflow-hidden shadow-lg"
                        >
                            <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-white/5 pb-4">
                                <FileCode size={16} />
                                <span>src/utils/crypto.js</span>
                            </div>
                            <div className="text-slate-300">
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
                            transition={{ delay: 0.5 }}
                            className="block rounded-2xl bg-gradient-to-r from-[#1e293b] to-[#334155] p-8 border border-white/10 shadow-xl group hover:border-blue-500/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Github className="w-8 h-8 text-white" />
                                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/80 group-hover:bg-blue-500/20 transition-colors">OPEN SOURCE</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Audit the Code</h3>
                            <p className="text-slate-400 mb-6 font-mono text-sm">github.com/Reysajju/SolChat</p>
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

export default SecurityPage;
