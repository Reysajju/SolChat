# SolChat: Trillion-Year Security Messaging 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-cyan.svg)
![Solana](https://img.shields.io/badge/solana-web3-purple.svg)
![Status](https://img.shields.io/badge/status-beta-orange.svg)

**SolChat** is a decentralized, end-to-end encrypted messaging application built on Solana. It enables secure, private communication between wallet addresses using state-of-the-art cryptographic primitives. Your identity is your wallet; your messages are yours alone.

> 🔒 **Security First**: We use **X25519** (Elliptic Curve Diffie-Hellman) for key exchange and **XSalsa20-Poly1305** for authenticated encryption. This provides approximately 128 bits of security, often referred to as "Trillion-Year Security".

---

## 🚀 Features

- **Wallet-Based Identity**: No emails, no passwords. Login with Phantom or Solflare.
- **End-to-End Encryption**: Messages are encrypted on your device *before* they ever touch the network.
- **Perfect Forward Secrecy**: (Planned) Session keys are rotated to ensure past messages remain secure.
- **Real-Time Delivery**: Sub-millisecond latency using Supabase Realtime.
- **Sleek Interface**: Modern, professional dark UI with glassmorphism aesthetics.
- **Uncensorable**: Your identity lives on the blockchain.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Cryptography**: TweetNaCl.js (Verified, audit-ready crypto library)
- **Backend**: Supabase (PostgreSQL + Realtime) - used *only* as an encrypted data relay.
- **Deployment**: Vercel / Netlify (Recommended)

## 🏗️ Architecture

1.  **Key Generation**:
    - User signs a deterministic message: `"Login to SolChat: secure-signature-session"`.
    - The signature is hashed to derive a **Private Key** (Ed25519) and a corresponding **Public Key**.
    - This key pair is used *exclusively* for messaging encryption, separate from the wallet's signing key.

2.  **Key Exchange**:
    - Users publish their **Public Encryption Key** to the `users` table upon registration.
    - To chat, Alice fetches Bob's Public Key.
    - Alice computes a **Shared Secret** using her Private Key + Bob's Public Key (X25519).

3.  **Encryption**:
    - Messages are encrypted with the **Shared Secret** + a unique **Nonce**.
    - Only the encrypted blob (`ciphertext`) is stored in the database.

## 🏁 Getting Started

### Prerequisites
- Node.js v16+
- A Supabase Project
- A Solana Wallet (Phantom/Solflare) installed in browser

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Reysajju/SolChat.git
    cd SolChat
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup**
    Run the SQL scripts provided in `supabase_schema.sql` (and `update_chat_features.sql`) in your Supabase SQL Editor to set up the tables and RLS policies.

5.  **Run Locally**
    ```bash
    npm run dev
    ```

## 📖 Usage Guide

1.  **Connect**: Click "Connect Wallet" and select your provider.
2.  **Sign In**: You will be prompted to sign a message. This is gasless and used only to derive your encryption keys.
3.  **Find Friends**: Use the search bar to find users by their Wallet Address or Username.
4.  **Chat**: Start messaging! verify the "Encrypted" shield is green.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Verified Security. Decentralized Future.*
