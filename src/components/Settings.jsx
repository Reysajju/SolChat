import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Settings = ({ canClose = true }) => {
    const { walletAddress, userProfile, setUserProfile, isSettingsOpen, toggleSettings } = useStore();

    const [username, setUsername] = useState('');
    const [isSearchable, setIsSearchable] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load current profile on mount
    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setIsSearchable(userProfile.isSearchable ?? true);
        }
    }, [userProfile]);

    // Validate username format
    const validateUsername = (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be 20 characters or less';
        if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores allowed';
        return '';
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value.toLowerCase();
        setUsername(value);
        setError(validateUsername(value));
        setSuccess('');
    };

    const handleSave = async () => {
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: username,
                    is_searchable: isSearchable
                })
                .eq('wallet_address', walletAddress);

            if (updateError) {
                if (updateError.code === '23505') {
                    setError('Username is already taken');
                } else {
                    setError(updateError.message);
                }
            } else {
                setUserProfile({ username: username, isSearchable });
                setSuccess('Settings saved!');
                setTimeout(() => setSuccess(''), 2000);

                // If forced open, close it now that we have a username
                if (!canClose) {
                    toggleSettings();
                }
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Prevent closing if forced and no username
    const handleClose = () => {
        if (canClose) toggleSettings();
    };

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6 border border-white/10 shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
                            <SettingsIcon size={20} className="text-neon-blue" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {canClose ? 'Settings' : 'Create Username'}
                        </h2>
                    </div>
                    {canClose && (
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Username Input */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">
                        Username <span className="text-neon-blue">*</span>
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="e.g. crypto_whale"
                        maxLength={20}
                        className="w-full bg-black/30 text-white py-3 px-4 rounded-xl border border-white/10 focus:outline-none focus:border-neon-blue/50 transition-all placeholder-gray-600"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                        Required. 3-20 characters, lowercase letters, numbers, and underscores only.
                    </p>
                </div>

                {/* Search Visibility Toggle */}
                <div className="mb-6">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            {isSearchable ? (
                                <Eye size={20} className="text-neon-blue" />
                            ) : (
                                <EyeOff size={20} className="text-gray-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-white">Appear in search results</p>
                                <p className="text-xs text-gray-500">Let others find you by username or address</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSearchable(!isSearchable)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isSearchable ? 'bg-neon-blue' : 'bg-gray-700'
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isSearchable ? 'left-7' : 'left-1'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle size={16} className="text-red-400" />
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Check size={16} className="text-green-400" />
                        <p className="text-sm text-green-400">{success}</p>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving || !!error}
                    className="w-full py-3 bg-gradient-to-r from-neon-blue to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-neon-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
