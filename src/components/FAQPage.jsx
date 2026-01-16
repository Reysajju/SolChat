import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQPage = ({ onBack }) => {
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

            <main className="pt-24 pb-20 px-4 md:px-6 max-w-4xl mx-auto safe-bottom">
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6"
                    >
                        <HelpCircle className="w-7 h-7 md:w-8 md:h-8 text-blue-400" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white"
                    >
                        Frequently Asked Questions
                    </motion.h1>
                    <p className="text-lg md:text-xl text-slate-400">Everything you need to know about SolChat.</p>
                </div>

                <div className="space-y-8 md:space-y-12">
                    {/* Category: General */}
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-200 mb-4 md:mb-6 pl-3 border-l-4 border-blue-500">General</h2>
                        <div className="space-y-3 md:space-y-4">
                            <FAQItem
                                question="What makes this different from WhatsApp?"
                                answer="Unlike traditional apps, SolChat doesn't have a central server storing your user data. Your account IS your wallet. We cannot ban you, we cannot read your messages, and we cannot sell your data."
                            />
                            <FAQItem
                                question="Is it free to use?"
                                answer="Yes. The core messaging service is free and gasless. Premium features may be introduced in the future, but text messaging will always remain free."
                            />
                        </div>
                    </div>

                    {/* Category: Security */}
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-200 mb-4 md:mb-6 pl-3 border-l-4 border-indigo-500 mt-8 md:mt-12">Security & Privacy</h2>
                        <div className="space-y-3 md:space-y-4">
                            <FAQItem
                                question="If I lose my wallet, do I lose my chats?"
                                answer="Yes. Your identity is tied mathematically to your private key. If you lose access to your wallet, you lose the ability to decrypt your messages. There is no 'password reset' because we don't have your password."
                            />
                            <FAQItem
                                question="Can I delete messages?"
                                answer="You can delete messages from your local view, but due to the decentralized nature of synchronization, we cannot guarantee deletion from the recipient's device once delivered."
                            />
                            <FAQItem
                                question="Is the code audited?"
                                answer="Our codebase is open source. While we haven't had a formal third-party audit yet, the community is free to inspect our cryptographic implementation on GitHub."
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/5 rounded-xl md:rounded-2xl bg-[var(--color-bg-elevated)] overflow-hidden hover:border-blue-500/20 transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 md:px-8 md:py-6 flex items-center justify-between text-left font-medium text-base md:text-lg text-slate-200 active:bg-white/5"
            >
                <span className="pr-4">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-slate-400 shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 md:px-8 md:pb-8 text-sm md:text-base text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQPage;
