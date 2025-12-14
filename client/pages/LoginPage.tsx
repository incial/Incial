
import React, { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Command, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.login(email, password);
            login(response.token, response.user);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex font-sans bg-white">

            {/* LEFT PANEL: The Brand Experience */}
            <div className="hidden lg:flex w-1/2 relative bg-[#0B1121] overflow-hidden flex-col justify-between p-16">

                {/* Ambient Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Gradient Blobs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-brand-600/10 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[100px]" />

                    {/* Subtle Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>

                {/* Logo Area */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 font-bold text-2xl tracking-tight text-white">
                        {/* Brand */}
                        <div className="relative z-10 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <img src="/logo.png" alt="Incial" className="h-10 w-10 rounded-xl bg-white shadow-lg object-contain p-1" />
                            Incial
                        </div>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-lg mt-auto mb-auto">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-200 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        Operational OS v2.0
                    </div>

                    <h1 className="text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
                        Orchestrate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-200 via-white to-brand-100">growth engine.</span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed max-w-md font-light">
                        The unified workspace for high-performance agencies. Streamline CRM, tasks, and financials in one command center.
                    </p>
                </div>

                {/* Footer / Social Proof */}
                <div className="relative z-10">
                    <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-[#0B1121] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                                    {i === 4 ? '5k+' : ''}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-white font-bold text-sm">Trust & Security</span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <span className="text-slate-500 text-xs mt-0.5">Enterprise-grade protection.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: The Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
                <div className="w-full max-w-[400px] flex flex-col">

                    {/* Mobile Brand Header */}
                    <div className="lg:hidden flex items-center gap-2 mb-12 font-bold text-2xl tracking-tight text-gray-900">
                        <div className="h-10 w-10 bg-brand-600 text-white flex items-center justify-center rounded-xl">
                            <Command className="h-5 w-5" />
                        </div>
                        Incial
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 mt-2.5 text-base">Please enter your credentials to access the workspace.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-700 ml-1 uppercase tracking-wide">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
                                <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0B1121] hover:bg-slate-900 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 active:scale-[0.98] mt-4 group"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                                <span className="bg-white px-3 text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => alert("Google Login unavailable")}
                            className="w-full bg-white border border-gray-200 text-gray-700 font-bold text-sm py-3.5 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2.5 active:bg-gray-50"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google Account
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-8 font-medium">
                        Don't have an account? <a href="#" className="text-brand-600 font-bold hover:underline">Contact Sales</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
