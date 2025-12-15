
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { Loader2, ArrowLeft, Mail, KeyRound, AlertCircle, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

type Step = 'email' | 'reset';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.forgotPassword({ email });
      setStep('reset');
      showToast("OTP sent to your email", 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check the email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
        setError("Please enter the OTP code");
        return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Send OTP and new password in one go to verify and update
      await authApi.changePassword({ email, newPassword: password, otp });
      showToast("Password reset successfully. Please login.", 'success');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 relative overflow-hidden">
        
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 to-indigo-600"></div>

        {/* Back Button */}
        <div className="mb-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
            <div className="h-12 w-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-brand-100 transition-all duration-300">
                {step === 'email' ? <Mail className="h-6 w-6 animate-in zoom-in" /> : <ShieldCheck className="h-6 w-6 animate-in zoom-in" />}
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight transition-all">
                {step === 'email' ? 'Forgot Password?' : 'Secure Your Account'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium leading-relaxed">
                {step === 'email' 
                    ? 'Enter your email address and we\'ll send you a One-Time Password (OTP) to reset your account.'
                    : `We've sent a code to ${email}. Please enter it below along with your new password.`
                }
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
            </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                        placeholder="name@company.com"
                        required
                        autoFocus
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 active:scale-[0.98]"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                </button>
            </form>
        )}

        {/* Step 2: OTP & Reset Form Combined */}
        {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* OTP Input */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Verification Code</label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} // Digits only
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold tracking-widest text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                            placeholder="000000"
                            maxLength={6}
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                {/* Password Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                placeholder="Min 8 characters"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                placeholder="Re-enter password"
                                required
                                minLength={8}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 active:scale-[0.98] mt-2"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
                </button>

                <div className="text-center flex flex-col gap-2 pt-2">
                    <button type="button" onClick={() => handleEmailSubmit({ preventDefault: () => {} } as any)} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 transition-colors">
                        <RefreshCw className="h-3 w-3" /> Resend OTP
                    </button>
                    <button type="button" onClick={() => setStep('email')} className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                        Change email address
                    </button>
                </div>
            </form>
        )}

      </div>
    </div>
  );
};
