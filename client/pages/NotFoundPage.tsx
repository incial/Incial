
import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-md w-full">
        <div className="relative h-32 w-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-100">
            <Ghost className="h-14 w-14 text-gray-300" />
            <div className="absolute top-0 right-0 h-8 w-8 bg-red-500 rounded-full border-4 border-slate-50"></div>
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Oops! The page you are looking for seems to have wandered off into the digital void.
        </p>
        
        <Link 
            to="/" 
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
        </Link>
      </div>
    </div>
  );
};
