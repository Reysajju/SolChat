// Simple, short, modern UI sounds (Base64 encoded to avoid asset issues)

// A soft "pop" or "whoosh" for sending
const SENT_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDCwIIAA8kwIgOA CADSA8kQgkEABDSECCWCfFwDaH7n//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp";

// A pleasant "ding" for receiving
const RECEIVED_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDCwIIAA8kwIgOA CADSA8kQgkEABDSECCWCfFwDaH7n//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp//uQDAn8z31bWf9ftp";

// NOTE: The above base64 strings are placeholders. 
// I will use short, generated sine wave beeps if real files are not provided, 
// OR I will use a reliable external URL or synthesize them if possible. 
// For now, let's use the Web Audio API to generate synthetic "modern" sounds 
// to ensure they work without large base64 blobs that might be silent.

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSendSound = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // "Swoosh" / High pitch pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
};

export const playReceiveSound = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // "Ding" / 2-tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
};
