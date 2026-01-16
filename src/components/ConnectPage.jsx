import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const ConnectPage = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-white font-['Inter'] flex flex-col selection:bg-blue-500/30">
            {/* Header */}
            <nav className="w-full h-16 md:h-24 flex items-center justify-between px-4 md:px-8 border-b border-white/5 safe-top">
                <div onClick={onBack} className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity">
                    <img src="/logo.png" alt="SolChat Logo" className="w-8 h-8 md:w-9 md:h-9" />
                    <span className="font-bold tracking-tight text-white text-lg md:text-xl">SolChat</span>
                </div>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors py-2"
                >
                    <ArrowLeft size={18} /> <span className="hidden sm:inline">Back to Home</span>
                </button>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden safe-bottom">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-blue-600/10 blur-[90px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-sm"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Connect Wallet</h1>
                    <p className="text-slate-400 mb-10 leading-relaxed text-sm md:text-base">
                        Connect your Solana wallet to continue. <br className="hidden sm:block" />
                        This will be your secure identity.
                    </p>

                    <div className="flex justify-center w-full [&>button]:!bg-[#3b82f6] [&>button]:!h-[50px] [&>button]:!rounded-xl [&>button]:!font-bold [&>button]:!w-full [&>button]:!justify-center hover:[&>button]:!bg-[#2563eb]">
                        <WalletMultiButton />
                    </div>

                    <p className="mt-8 text-[10px] md:text-xs text-slate-500 max-w-xs mx-auto">
                        Your keys never leave your device. <br />
                        We do not control your funds.
                    </p>
                </motion.div>
            </main>
        </div>
    );
};

export default ConnectPage;
