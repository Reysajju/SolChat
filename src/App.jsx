import React, { useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { HelmetProvider } from 'react-helmet-async';

import { supabase } from './lib/supabase';
import useStore from './store/useStore';
import { generateKeysFromSignature } from './utils/crypto';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import ConnectPage from './components/ConnectPage';
import FeaturesPage from './components/FeaturesPage';
import SecurityPage from './components/SecurityPage';
import FAQPage from './components/FAQPage';
import SEO from './components/SEO';
import { Lock } from 'lucide-react';

// Default styles for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

function Content() {
  const { publicKey, signMessage, connected } = useWallet();
  const {
    walletAddress,
    setWalletAddress,
    encryptionKeys,
    setEncryptionKeys,
    userProfile,
    setUserProfile,
    isSettingsOpen,
    setSettingsOpen
  } = useStore();

  const [isSigning, setIsSigning] = useState(false);
  // Router State: 'landing' | 'connect' | 'features' | 'security' | 'faq'
  const [currentPage, setCurrentPage] = useState('landing');

  // Enforce Username
  useEffect(() => {
    if (connected && encryptionKeys && userProfile && !userProfile.username) {
      if (!isSettingsOpen) setSettingsOpen(true);
    }
  }, [connected, encryptionKeys, userProfile, isSettingsOpen, setSettingsOpen]);

  // 1. Handle Wallet Connection & Session Restoration
  useEffect(() => {
    const restoreSession = async () => {
      if (connected && publicKey) {
        const currentWallet = publicKey.toBase58();

        // Check if we have a stored session for this wallet
        if (walletAddress === currentWallet && encryptionKeys) {
          // Session exists and matches - restore Supabase auth
          const { updateSupabaseAuth } = await import('./lib/supabase');
          updateSupabaseAuth(currentWallet);
          console.log('Session restored for:', currentWallet);
        } else if (walletAddress && walletAddress !== currentWallet) {
          // Different wallet connected - clear old session
          useStore.getState().logout();
          setWalletAddress(currentWallet);
        } else {
          // No session - just set wallet address
          setWalletAddress(currentWallet);
        }
      } else if (!connected) {
        // Wallet disconnected - but DON'T clear session (user might refresh)
      }
    };

    restoreSession();
  }, [connected, publicKey]);

  // 2. Login / Sign Message Flow
  const handleLogin = async () => {
    if (!connected || !signMessage) return;

    setIsSigning(true);
    try {
      const message = new TextEncoder().encode("Login to SolChat: secure-signature-session");
      const signature = await signMessage(message);

      // Generate Encryption Keys from Signature (Deterministic)
      const keys = generateKeysFromSignature(signature);
      setEncryptionKeys(keys);

      // 0. Update Supabase Client with Headers for RLS
      const { updateSupabaseAuth } = await import('./lib/supabase');
      updateSupabaseAuth(publicKey.toBase58());

      // Register/Update User in Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert({
          wallet_address: publicKey.toBase58(),
          public_encryption_key: keys.publicKey
        }, { onConflict: 'wallet_address' })
        .select('username, is_searchable')
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
      } else if (data) {
        setUserProfile({
          username: data.username,
          isSearchable: data.is_searchable
        });
      }

    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleNavigate = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  // 3. Conditional Rendering based on Auth State

  // State 1: Not Connected -> Show Router
  if (!connected) {
    if (currentPage === 'connect') {
      return (
        <>
          <SEO title="Connect Wallet" />
          <ConnectPage onBack={() => handleNavigate('landing')} />
        </>
      );
    }
    if (currentPage === 'features') {
      return (
        <>
          <SEO title="Features - SolChat" />
          <FeaturesPage onBack={() => handleNavigate('landing')} onStartChat={() => handleNavigate('connect')} />
        </>
      );
    }
    if (currentPage === 'security') {
      return (
        <>
          <SEO title="Security Architecture - SolChat" />
          <SecurityPage onBack={() => handleNavigate('landing')} />
        </>
      );
    }
    if (currentPage === 'faq') {
      return (
        <>
          <SEO title="FAQ - SolChat" />
          <FAQPage onBack={() => handleNavigate('landing')} />
        </>
      );
    }

    // Default: Landing Page
    return (
      <>
        <SEO
          title="Secure Crypto Messaging"
          description="The world's most secure blockchain messenger. End-to-end encrypted, wallet-based identity, and lightning fast."
        />
        <LandingPage
          onStartChat={() => handleNavigate('connect')}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // State 2: Connected but Not Verified (No Encryption Keys) -> Show Sign to Login
  if (connected && !encryptionKeys) {
    return (
      <Layout>
        <SEO title="Verify Identity" />
        <div className="w-full h-full flex flex-col items-center justify-center text-center glass-panel rounded-3xl p-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 animate-pulse">
            <Lock size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Identity</h2>
          <p className="text-gray-400 max-w-sm mb-8 text-sm">
            Sign a secure message to retrieve your encryption keys. This ensures only YOU can read your messages.
          </p>
          <button
            onClick={handleLogin}
            disabled={isSigning}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            {isSigning ? 'Verifying...' : 'Sign to Login'}
          </button>
        </div>
      </Layout>
    );
  }

  // State 3: Connected & Verified -> Show App
  return (
    <Layout>
      <SEO title="Chat" />
      <Settings canClose={!!userProfile?.username} />
      <Sidebar />
      <ChatWindow />
    </Layout>
  );
}

const App = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet; // Changed to Mainnet as per user preference likely, or keep devnet
  // Actually, let's keep it Devnet for now as per previous context unless specific request to change.
  // Wait, line 85 in confusing view said Devnet. I will keep Devnet to be safe for local dev.
  const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Devnet), []);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <HelmetProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Content />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </HelmetProvider>
  );
};

export default App;
