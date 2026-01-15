import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

const ConnectPage = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-['Inter'] flex flex-col selection:bg-blue-500/30">
            {/* Simple Navbar */}
            <nav className="w-full h-24 flex items-center justify-between px-8 bg-[#0f172a] border-b border-white/5">
                <div onClick={onBack} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Shield className="text-white" size={16} />
                    </div>
                    <span className="font-bold tracking-tight text-white">SolChat</span>
                </div>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full"
                >
                    <h1 className="text-4xl font-bold mb-4 text-white">Connect your wallet</h1>
                    <p className="text-slate-400 mb-10 leading-relaxed">
                        To continue, please connect your Solana wallet. <br />
                        This will serve as your identity.
                    </p>

                    <div className="flex justify-center transform scale-125">
                        <WalletMultiButton />
                    </div>

                    <p className="mt-12 text-xs text-slate-500 max-w-sm mx-auto">
                        By connecting, you agree to our Terms of Service.
                        We do not control your keys or funds.
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default ConnectPage;
