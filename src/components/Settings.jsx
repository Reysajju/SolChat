import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, X, Check, AlertCircle, Eye, EyeOff, ChevronDown } from 'lucide-react';

const Settings = ({ canClose = true }) => {
    const { walletAddress, userProfile, setUserProfile, isSettingsOpen, toggleSettings } = useStore();

    const [username, setUsername] = useState('');
    const [isSearchable, setIsSearchable] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setIsSearchable(userProfile.isSearchable ?? true);
        }
    }, [userProfile]);

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
                setUserProfile({ ...userProfile, username: username, isSearchable });
                setSuccess('Settings saved!');
                setTimeout(() => setSuccess(''), 2000);

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

    const handleClose = () => {
        if (canClose) toggleSettings();
    };

    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleClose}
            />

            {/* Modal / Bottom Sheet */}
            <div className={`
                relative w-full md:w-full md:max-w-md 
                bg-[var(--color-bg-elevated)] 
                md:rounded-2xl rounded-t-2xl 
                border-t md:border border-white/10 
                shadow-2xl 
                animate-slide-up
                safe-bottom
            `}>
                {/* Mobile Drag Handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 rounded-full bg-white/10" />
                </div>

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <SettingsIcon size={20} className="text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {canClose ? 'Settings' : 'Create Username'}
                            </h2>
                        </div>
                        {canClose && (
                            <button
                                onClick={handleClose}
                                className="touch-btn w-10 h-10 rounded-xl hover:bg-white/5 text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Username Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Username <span className="text-blue-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="e.g. crypto_whale"
                            maxLength={20}
                            className="input-field"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            3-20 characters, lowercase letters & numbers only.
                        </p>
                    </div>

                    {/* Search Visibility Toggle */}
                    <div className="mb-6">
                        <div
                            className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-white/5 cursor-pointer"
                            onClick={() => setIsSearchable(!isSearchable)}
                        >
                            <div className="flex items-center gap-3">
                                {isSearchable ? (
                                    <Eye size={20} className="text-blue-500" />
                                ) : (
                                    <EyeOff size={20} className="text-gray-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-white">Public Profile</p>
                                    <p className="text-xs text-gray-500">Allow others to find you</p>
                                </div>
                            </div>
                            <div className={`
                                w-11 h-6 rounded-full transition-colors flex items-center px-0.5
                                ${isSearchable ? 'bg-blue-600' : 'bg-gray-700'}
                            `}>
                                <div className={`
                                    w-5 h-5 rounded-full bg-white shadow-sm transition-transform
                                    ${isSearchable ? 'translate-x-[20px]' : 'translate-x-0'}
                                `} />
                            </div>
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertCircle size={16} className="text-red-400 shrink-0" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <Check size={16} className="text-green-400 shrink-0" />
                            <p className="text-sm text-green-400">{success}</p>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !!error}
                        className={`
                            w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98]
                            ${isSaving || !!error
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-500/20'}
                        `}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
