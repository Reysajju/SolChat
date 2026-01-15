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

// 2. ENCRYPT MESSAGE (The Trillion Year Shield)
export const encryptMessage = (sharedSecret, jsonMessage) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(JSON.stringify(jsonMessage));

    // The Magic Box
    const encrypted = nacl.box.after(messageUint8, nonce, sharedSecret);

    return {
        ciphertext: encodeBase64(encrypted),
        nonce: encodeBase64(nonce)
    };
};

// 3. DECRYPT MESSAGE
export const decryptMessage = (sharedSecret, ciphertext, nonce) => {
    try {
        const ciphertextUint8 = decodeBase64(ciphertext);
        const nonceUint8 = decodeBase64(nonce);

        const decrypted = nacl.box.open.after(ciphertextUint8, nonceUint8, sharedSecret);

        if (!decrypted) return null; // Decryption failed (wrong key)
        return JSON.parse(encodeUTF8(decrypted));
    } catch (e) {
        console.error("Decryption error:", e);
        return null;
    }
};

// 4. COMPUTE SHARED SECRET
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

// 5. HYBRID FILE ENCRYPTION (Symmetric)
// We encrypt large files with a random symmetric key (nacl.secretbox)
// Then we encrypt that key with the shared secret (asymmetric)

export const encryptFile = (fileUint8) => {
    // 1. Generate Random Symmetric Key (32 bytes) & Nonce (24 bytes)
    const fileKey = nacl.randomBytes(nacl.box.secretKeyLength);
    const fileNonce = nacl.randomBytes(nacl.box.nonceLength);

    // 2. Encrypt File Bytes
    const encryptedFile = nacl.secretbox(fileUint8, fileNonce, fileKey);

    return {
        encryptedFile, // Uint8Array
        fileKey: encodeBase64(fileKey),
        fileNonce: encodeBase64(fileNonce)
    };
};

export const decryptFile = (encryptedFileUint8, fileKeyBase64, fileNonceBase64) => {
    try {
        const key = decodeBase64(fileKeyBase64);
        const nonce = decodeBase64(fileNonceBase64);

        const decrypted = nacl.secretbox.open(encryptedFileUint8, nonce, key);
        return decrypted; // Uint8Array or null
    } catch (e) {
        console.error("File decryption error:", e);
        return null;
    }
};
