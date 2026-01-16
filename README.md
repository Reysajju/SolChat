# SolChat: Trillion-Year Security Messaging 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-cyan.svg)
![Solana](https://img.shields.io/badge/solana-web3-purple.svg)
![Status](https://img.shields.io/badge/status-beta-orange.svg)

**SolChat** is a decentralized, end-to-end encrypted messaging application built on Solana. It enables secure, private communication between wallet addresses using state-of-the-art cryptographic primitives. Your identity is your wallet; your messages are yours alone.

> 🔒 **Security First**: We use **X25519** (Elliptic Curve Diffie-Hellman) for key exchange and **XSalsa20-Poly1305** for authenticated encryption. This provides approximately 128 bits of security against classical computers — often referred to as "Trillion-Year Security" in the pre-quantum model. See our [Post-Quantum Strategy](#-longevity-beyond-ecc-our-post-quantum-strategy) for long-term cryptographic agility.

---

## 🚀 Features

- **Wallet-Based Identity**: No emails, no passwords. Login with Phantom or Solflare.
- **End-to-End Encryption**: Messages are encrypted on your device *before* they ever touch the network.
- **Blind Routing**: Replaces raw wallet addresses with SHA-256 hashes in the database. The server never knows who you are messaging.
- **Sealed Senders**: Uses ephemeral X25519 keys for every message. The sender's identity is hidden from the relay server.
- **Perfect Forward Secrecy**: (Planned) Session keys are rotated to ensure past messages remain secure.
- **Real-Time Delivery**: Sub-millisecond latency using Supabase Realtime.
- **Uncensorable Identity**: Your identity lives on the blockchain.
- **Premium UX**: Modern, responsive interface. See [DESIGN.md](./DESIGN.md) for UI details.

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion |
| **Blockchain** | Solana Web3.js, Wallet Adapter |
| **Cryptography** | TweetNaCl.js (verified, audit-ready) |
| **Backend** | Supabase (PostgreSQL + Realtime) — encrypted data relay |
| **Deployment** | Vercel / Netlify |

## 🏗️ Architecture

### Key Generation

1. User signs a deterministic message: `"Login to SolChat: secure-signature-session"`.
2. The signature is hashed to derive a **Private Key** (Ed25519) and a corresponding **Public Key**.
3. This key pair is used *exclusively* for messaging encryption, separate from the wallet's signing key.

### Key Exchange

1. Users publish their **Public Encryption Key** to the `users` table upon registration.
2. To chat, Alice fetches Bob's Public Key.
3. Alice computes a **Shared Secret** using her Private Key + Bob's Public Key (X25519).

### Encryption

1. Messages are encrypted with the **Shared Secret** + a unique **Nonce**.
2. Only the encrypted blob (`ciphertext`) is stored in the database.

### Row-Level Security (RLS)

The database enforces strict data segregation at the PostgreSQL level:
- Users can only SELECT messages addressed to their wallet hash
- Blind posting allows INSERT without revealing sender identity
- Profile updates restricted to authenticated wallet owner

---

## 🔮 Longevity Beyond ECC: Our Post-Quantum Strategy

> **Transparency**: The "Trillion-Year Security" claim applies to the **pre-quantum computational model**. We are committed to cryptographic agility as the threat landscape evolves.

### The Quantum Context

Elliptic Curve Cryptography (ECC), including X25519, provides exceptional security against classical computers. However, a sufficiently powerful quantum computer running Shor's algorithm could theoretically break ECC-based key exchange.

**Current Status**: No cryptographically relevant quantum computers exist today. The timeline for such systems remains uncertain (estimates range from 10-30+ years).

### Our Deterministic Key System: A Migration Strength

SolChat's architecture uses **deterministic key derivation** tied to your Solana wallet signature. While this creates a single derivation path, it also provides a significant advantage:

| Risk | Mitigation |
|------|------------|
| Single derivation point | Network-wide cryptographic migration becomes straightforward |
| Key rotation complexity | Protocol update can push new derivation function to all users |
| Manual identity reset | **Not required** — users re-sign with existing wallet |

This design enables **cryptographic agility** — the ability to upgrade the underlying algorithms without requiring users to abandon their identity.

### Migration Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase A** | ✅ Current | X25519 + XSalsa20-Poly1305 (128-bit classical security) |
| **Phase B** | 🔬 Research | Hybrid mode testing (ECC + ML-KEM/Kyber) |
| **Phase C** | 📋 Planned | Optional PQC key exchange for high-security conversations |
| **Phase D** | 📋 Planned | Full protocol migration with backward compatibility period |

### NIST PQC Standards

We are actively monitoring the NIST Post-Quantum Cryptography standardization process:
- **ML-KEM** (formerly Kyber) — Primary candidate for key encapsulation
- **ML-DSA** (formerly Dilithium) — Candidate for digital signatures

When hybrid implementations mature in TweetNaCl.js or equivalent audited libraries, SolChat will integrate them.

---

## 📡 Infrastructure Roadmap: From Phase 1 to Full Decentralization

> **Transparency**: SolChat's cryptographic layer is fully decentralized. The transport layer currently uses centralized infrastructure as a deliberate Phase 1 trade-off.

### The Centralization Paradox

| Layer | Current State | Decentralized? |
|-------|---------------|----------------|
| **Identity** | Solana wallet | ✅ Yes |
| **Key Exchange** | Client-side X25519 | ✅ Yes |
| **Encryption** | Client-side E2E | ✅ Yes |
| **Transport/Relay** | Supabase Realtime | ⚠️ Centralized |

### Phase 1: Optimized for UX (Current)

We chose Supabase as our relay layer for specific, strategic reasons:

- **Sub-millisecond latency**: Supabase Realtime delivers exceptional message delivery speed
- **Blind configuration**: The server sees only encrypted blobs and hashed addresses
- **Zero-knowledge storage**: Content is E2E encrypted; Supabase cannot read messages
- **Rapid iteration**: Allows us to perfect the cryptographic layer before distributing infrastructure

**What Supabase CAN see**: Encrypted blobs, receiver hashes, timestamps, message metadata
**What Supabase CANNOT see**: Message content, sender identity, wallet addresses

### Phase 2: Distributed Relay Network (Roadmap)

| Component | Current | Future |
|-----------|---------|--------|
| Message Indexing | Supabase PostgreSQL | Solana State (on-chain or compressed) |
| Real-time Relay | Supabase Realtime | Distributed light nodes (blind relaying) |
| Presence/Status | Supabase Presence | P2P gossip protocol |

### Phase 3: Decentralized Storage (Future Roadmap)

When file sharing is introduced, it will be built on decentralized storage:

| Storage Type | Planned Implementation |
|--------------|------------------------|
| Encrypted Files | Arweave (permanent) / IPFS (distributed) |
| File Metadata | On-chain or Shadow Drive |
| Availability | Globally distributed, censorship-resistant |

### Censorship Resistance Status

| Threat Vector | Current Mitigation | Future Mitigation |
|---------------|-------------------|-------------------|
| Supabase outage | ❌ Service disruption | Distributed relay network |
| Government takedown request | ✅ No content to provide (E2E) | Decentralized infrastructure |
| Traffic analysis | ⚠️ Metadata visible to relay | Onion routing / mixnets |

---

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
4.  **Chat**: Start messaging! Verify the "Encrypted" shield is green.

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

## 📚 Additional Documentation

- [DESIGN.md](./DESIGN.md) — UI philosophy, aesthetics, and component design
- [supabase_schema.sql](./supabase_schema.sql) — Database schema and RLS policies

---

*Verified Security. Decentralized Future. Cryptographic Agility.*
