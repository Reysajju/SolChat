import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import ed2curve from 'ed2curve';

const { encodeBase64, decodeBase64, decodeUTF8, encodeUTF8 } = util;

// 1. GENERATE ENCRYPTION KEYS (Deterministic from Signature)
// functionality: 
// - User signs message "Login to SolChat"
// - We get a signature (UInt8Array, 64 bytes)
// - We use this signature to seed the Encryption Key Pair
// - This ensures the SAME wallet always gets the SAME encryption keys (Persistence)
export const generateKeysFromSignature = (signatureUint8) => {
    // Check signature length (should be 64 bytes for Ed25519)
    if (signatureUint8.length < 32) {
        throw new Error("Invalid signature length");
    }

    // Use the first 32 bytes of the signature as the seed for the secret key
    // This is deterministic: Same Signature -> Same Secret Key -> Same KeyPair
    const secretKeySeed = signatureUint8.slice(0, 32);

    const keyPair = nacl.box.keyPair.fromSecretKey(secretKeySeed);

    return {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: keyPair.secretKey, // Keep in memory, do not expose
        publicKeyUint8: keyPair.publicKey
    };
};

// 2. ENCRYPT MESSAGE (Anonymous Box)
// Hides the sender's identity by using an ephemeral keypair
export const encryptAnonymous = (recipientPublicKeyBase64, jsonMessage) => {
    const ephemeralKeyPair = nacl.box.keyPair();
    const recipientPublicKeyUint8 = decodeBase64(recipientPublicKeyBase64);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(JSON.stringify(jsonMessage));

    const encrypted = nacl.box(messageUint8, nonce, recipientPublicKeyUint8, ephemeralKeyPair.secretKey);

    return {
        ciphertext: encodeBase64(encrypted),
        nonce: encodeBase64(nonce),
        ephemeralPublicKey: encodeBase64(ephemeralKeyPair.publicKey)
    };
};

// 3. DECRYPT MESSAGE (Anonymous Box)
export const decryptAnonymous = (mySecretKey, ephemeralPublicKeyBase64, ciphertext, nonce) => {
    try {
        const ephemeralPublicKeyUint8 = decodeBase64(ephemeralPublicKeyBase64);
        const ciphertextUint8 = decodeBase64(ciphertext);
        const nonceUint8 = decodeBase64(nonce);

        const decrypted = nacl.box.open(ciphertextUint8, nonceUint8, ephemeralPublicKeyUint8, mySecretKey);

        if (!decrypted) return null;
        return JSON.parse(encodeUTF8(decrypted));
    } catch (e) {
        console.error("Decryption error:", e);
        return null;
    }
};

// 4. LEGACY: ENCRYPT MESSAGE (Standard Box - Keep for compatibility if needed elsewhere)
export const encryptMessage = (sharedSecret, jsonMessage) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(JSON.stringify(jsonMessage));
    const encrypted = nacl.box.after(messageUint8, nonce, sharedSecret);
    return { ciphertext: encodeBase64(encrypted), nonce: encodeBase64(nonce) };
};

// DECRYPT MESSAGE (Standard Box)
export const decryptMessage = (sharedSecret, ciphertext, nonce) => {
    try {
        const ciphertextUint8 = decodeBase64(ciphertext);
        const nonceUint8 = decodeBase64(nonce);
        const decrypted = nacl.box.open.after(ciphertextUint8, nonceUint8, sharedSecret);
        if (!decrypted) return null;
        return JSON.parse(encodeUTF8(decrypted));
    } catch (e) {
        console.error("Decryption error:", e);
        return null;
    }
};

// 5. COMPUTE SHARED SECRET
// We need to compute the shared secret between OUR Secret Key and THEIR Public Key
export const computeSharedSecret = (mySecretKey, theirPublicKeyBase64) => {
    // Validate Public Key
    if (!theirPublicKeyBase64 || typeof theirPublicKeyBase64 !== 'string') {
        throw new Error('Invalid public key: Must be a base64 string.');
    }

    // Validate Secret Key
    if (!mySecretKey || !(mySecretKey instanceof Uint8Array)) {
        console.error('Invalid Secret Key Type:', typeof mySecretKey, mySecretKey);
        throw new Error('Invalid secret key: Must be a Uint8Array. Session may be corrupted.');
    }

    try {
        const theirPublicKeyUint8 = decodeBase64(theirPublicKeyBase64);
        return nacl.box.before(theirPublicKeyUint8, mySecretKey);
    } catch (e) {
        throw new Error('Encryption error: ' + e.message);
    }
};

// 6. METADATA MASKING (Blind Routing)
// Create a SHA-256 hash of a wallet address for blind routing
export const hashWalletAddress = async (walletAddress) => {
    const msgUint8 = new TextEncoder().encode(walletAddress);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
