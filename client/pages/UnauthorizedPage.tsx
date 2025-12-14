
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-md w-full bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="relative h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <ShieldAlert className="h-10 w-10 text-red-500" />
            <div className="absolute -top-3 -right-3 h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <Lock className="h-4 w-4 text-gray-400" />
            </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Access Denied</h1>
        <p className="text-gray-500 mb-8 font-medium text-sm leading-relaxed">
            You don't have the necessary permissions to access this area. <br/>
            Please contact your administrator if this is a mistake.
        </p>
        
        <div className="space-y-3">
            <Link 
                to="/" 
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
            >
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
            </Link>
        </div>
      </div>
    </div>
  );
};
