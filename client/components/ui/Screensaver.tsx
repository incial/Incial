
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Cpu, Activity, Fingerprint } from 'lucide-react';

export const Screensaver: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(new Date());
  const timerRef = useRef<number | null>(null);
  
  // 100 Seconds Inactivity Limit
  const INACTIVITY_LIMIT = 100000; 

  const resetTimer = () => {
    setIsActive(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    
    if (isAuthenticated) {
        timerRef.current = window.setTimeout(() => {
            setIsActive(true);
        }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'mousedown'];
    const handleActivity = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handleActivity));
    
    // Initial start
    resetTimer();

    const clockInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timerRef.current) window.clearTimeout(timerRef.current);
      clearInterval(clockInterval);
    };
  }, [isAuthenticated]);

  if (!isActive || !isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden cursor-none animate-in fade-in duration-1000">
        {/* Background Ambient Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Cyber Grid */}
        <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
            }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center scale-110">
            
            {/* Animated HUD Ring */}
            <div className="relative mb-12">
                {/* Outer Ring */}
                <div className="absolute -inset-8 rounded-full border border-indigo-500/20 animate-[spin_10s_linear_infinite]" />
                <div className="absolute -inset-8 rounded-full border-t-2 border-indigo-500/60 animate-[spin_4s_linear_infinite]" />
                
                {/* Inner Ring */}
                <div className="absolute -inset-4 rounded-full border border-white/10 animate-[spin_8s_linear_infinite_reverse]" />
                <div className="absolute -inset-4 rounded-full border-r-2 border-purple-400/50 animate-[spin_3s_linear_infinite_reverse]" />

                {/* Core */}
                <div className="h-32 w-32 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_60px_rgba(79,70,229,0.4)] relative">
                    <img src="/logo.png" alt="Incial" className="h-14 w-14 opacity-90 drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse" />
                </div>
            </div>

            {/* Digital Clock */}
            <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter tabular-nums leading-none mb-8 drop-shadow-2xl">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>

            {/* Status Badge */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl">
                    <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full bg-emerald-500/50 animate-ping" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Lock className="h-3 w-3" /> System Locked
                    </span>
                </div>

                {user && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <Fingerprint className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Session: {user.name.split(' ')[0]}
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Data Stream */}
        <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-40">
            <Cpu className="h-5 w-5 text-indigo-400 animate-bounce" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">
                Awaiting Input
            </span>
        </div>
    </div>
  );
};
    