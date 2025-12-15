
import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, MapPin, Calendar, Lock } from 'lucide-react';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                    <div className="max-w-4xl mx-auto">

                        {/* Profile Card */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">

                            {/* Cover Background */}
                            <div className="h-48 relative bg-gradient-to-r from-brand-600 to-indigo-600">
                                <img 
                                    src="/banner.png" 
                                    alt="Profile Banner" 
                                    className="w-full h-full object-cover absolute inset-0 z-10"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                            </div>

                            <div className="px-8 pb-8">
                                <div className="flex flex-col md:flex-row items-end -mt-12 mb-6 gap-6 relative z-20">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl">
                                            {user?.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.name}
                                                    className="h-full w-full rounded-2xl object-cover bg-gray-100"
                                                />
                                            ) : (
                                                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Block */}
                                    <div className="flex-1 mb-2">
                                        <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                                        <p className="text-gray-500 font-medium">{user?.email}</p>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm border border-brand-100 shadow-sm">
                                            <ShieldCheck className="h-4 w-4" />
                                            {user?.role.replace('ROLE_', '')}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full mb-8"></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Personal Details */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personal Information</h3>

                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-gray-400">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Full Name</p>
                                                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-gray-400">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                                                    <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organization / Additional */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Organization Details</h3>

                                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                            <div className="mb-6">
                                                <div className="relative z-10 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
                                                    <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                                                        <ShieldCheck className="h-6 w-6" />
                                                    </div>
                                                    Incial
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 ml-[3.25rem] font-medium">Workspace</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span>Kerala, India</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
                                            <h4 className="font-bold text-brand-900 mb-2 flex items-center gap-2">
                                                <Lock className="h-4 w-4" /> Security
                                            </h4>
                                            <p className="text-sm text-brand-700 mb-4">Manage your account security settings.</p>
                                            <button 
                                                onClick={() => setIsPasswordModalOpen(true)}
                                                className="px-4 py-2 bg-white text-brand-700 text-sm font-bold rounded-xl shadow-sm border border-brand-200 hover:bg-brand-50 transition-colors"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>
            </div>

            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};
