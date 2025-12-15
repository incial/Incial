
import React, { useState } from 'react';
import { X, Lock, KeyRound, Save, Loader2, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'init' | 'update';

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<Step>('init');
  const [isLoading, setIsLoading] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  // 1. Request OTP
  const handleSendOtp = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
        await authApi.forgotPassword({ email: user.email });
        setStep('update');
        showToast(`OTP sent to ${user.email}`, "success");
    } catch (e: any) {
        showToast(e.message || "Failed to send OTP", "error");
    } finally {
        setIsLoading(false);
    }
  };

  // 2. Update Password (Includes OTP Verification on Backend)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!otp) {
        showToast("Please enter the OTP", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("New passwords do not match", "error");
        return;
    }
    
    if (newPassword.length < 8) {
        showToast("Password must be at least 8 characters", "error");
        return;
    }
    
    setIsLoading(true);
    try {
        // Backend handles both verification and update in this single call
        await authApi.changePassword({ email: user.email, newPassword: newPassword, otp });
        showToast("Password changed successfully", "success");
        handleClose();
    } catch (e: any) {
        showToast(e.message || "Failed to update password. Check OTP.", "error");
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
      setStep('init');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand-600" /> Security Verification
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="p-6">
            {/* STEP 1: INITIAL */}
            {step === 'init' && (
                <div className="text-center py-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verify it's you</h3>
                    <p className="text-gray-500 text-sm mb-8 px-4">
                        For security reasons, we need to verify your identity before changing your password. We will send a code to <b>{user?.email}</b>.
                    </p>
                    <button 
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </div>
            )}

            {/* STEP 2: OTP + NEW PASSWORD */}
            {step === 'update' && (
                <form onSubmit={handleUpdatePassword} className="space-y-5 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                        <CheckCircle2 className="h-4 w-4" /> Code sent to {user?.email}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Verification Code</label>
                        <input 
                            type="text" 
                            required 
                            autoFocus
                            maxLength={6}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold tracking-widest text-gray-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder-gray-400"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input 
                                type="password" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                placeholder="Enter new password (min 8 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input 
                                type="password" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <Save className="h-4 w-4" /> Set New Password
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSendOtp}
                            className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 py-3 mt-1"
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
