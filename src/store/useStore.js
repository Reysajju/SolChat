import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // User Identity
            walletAddress: null,
            encryptionKeys: null, // { publicKey (base64 string), secretKey (Uint8Array) }
            userProfile: null, // { username, isSearchable }
            setWalletAddress: (address) => set({ walletAddress: address }),
            setEncryptionKeys: (keys) => set({ encryptionKeys: keys }),
            setUserProfile: (profile) => set({ userProfile: profile }),

            // Contacts & Messages
            contacts: [], // List of users we can chat with
            messages: [], // All loaded messages (not persisted)
            activeContact: null, // The user we are currently chatting with

            setContacts: (contacts) => set({ contacts }),
            setMessages: (messages) => set((state) => ({
                messages: typeof messages === 'function' ? messages(state.messages) : messages
            })),
            addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
            setActiveContact: (contact) => set({ activeContact: contact }),

            // UI State
            isSidebarOpen: true,
            isSettingsOpen: false,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
            setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

            // Logout - Clear all session data
            logout: () => {
                set({
                    walletAddress: null,
                    encryptionKeys: null,
                    userProfile: null,
                    contacts: [],
                    messages: [],
                    activeContact: null,
                    isSidebarOpen: true,
                    isSettingsOpen: false,
                });
                localStorage.removeItem('solchat-session');
            },
        }),
        {
            name: 'solchat-session', // localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist session data, not UI state or messages
                walletAddress: state.walletAddress,
                encryptionKeys: state.encryptionKeys,
                userProfile: state.userProfile,
            }),
            onRehydrateStorage: () => (state) => {
                // This callback runs after hydration is complete
                if (state && state.encryptionKeys && state.encryptionKeys.secretKey) {
                    try {
                        const storedKey = state.encryptionKeys.secretKey;
                        // Check if it needs conversion (if it's not already a Uint8Array)
                        if (!(storedKey instanceof Uint8Array)) {
                            const keyValues = Array.isArray(storedKey) ? storedKey : Object.values(storedKey);
                            state.encryptionKeys.secretKey = new Uint8Array(keyValues);
                            console.log('Successfully rehydrated secret key');
                        }
                    } catch (err) {
                        console.error('Failed to rehydrate secret key:', err);
                        state.logout(); // Force logout if session is corrupt
                    }
                }
            }
        }
    )
);

export default useStore;

