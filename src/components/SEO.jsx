import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image }) => {
    const siteTitle = 'SolChat | Trillion-Year Security';
    const siteDescription = description || 'Secure, end-to-end encrypted messaging on Solana. Chat with confidence using X25519 encryption and blockchain identity.';
    const siteImage = image || '/og-image.jpg'; // We'll need to create this image or assume it exists

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title ? `${title} | SolChat` : siteTitle}</title>
            <meta name="description" content={siteDescription} />
            <meta name="keywords" content={keywords || "Solana chat, encrypted messaging, blockchain chat, web3 messenger, solchat, secure chat"} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={siteImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={siteDescription} />
            <meta name="twitter:image" content={siteImage} />
        </Helmet>
    );
};

export default SEO;
