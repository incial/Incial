
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, usersApi } from '../services/api';
import { Trophy, Target, Zap, Crown, Medal, Activity, TrendingUp, LayoutGrid, X, Mail, Calendar, Shield, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface UserStats {
  id?: number;
  name: string;
  email?: string;
  role: string;
  rawRole?: string;
  avatarUrl?: string;
  createdAt?: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export const AdminPerformancePage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      setIsLoading(true);
      try {
        const [tasks, users] = await Promise.all([
            tasksApi.getAll(),
            usersApi.getAll()
        ]);
        
        // 1. Initialize stats map with ALL users to ensure everyone appears on leaderboard
        const statsMap: Record<string, UserStats> = {};
        
        users.forEach(u => {
            const formattedRole = u.role.replace('ROLE_', '').split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ');

            statsMap[u.name] = {
                id: u.id,
                name: u.name,
                email: u.email,
                role: formattedRole,
                rawRole: u.role,
                avatarUrl: u.avatarUrl,
                createdAt: u.createdAt,
                total: 0,
                completed: 0,
                inProgress: 0,
                pending: 0,
                completionRate: 0
            };
        });

        // 2. Aggregate Task Data
        tasks.forEach(task => {
            const assignee = task.assignedTo || 'Unassigned';
            
            // Handle Unassigned or users not in the user list
            if (!statsMap[assignee]) {
                statsMap[assignee] = {
                    name: assignee,
                    role: assignee === 'Unassigned' ? 'System' : 'External',
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0,
                    completionRate: 0
                };
            }

            const s = statsMap[assignee];
            s.total++;

            // Categorize Status
            if (['Completed', 'Done'].includes(task.status)) {
                s.completed++;
            } else if (['In Progress', 'In Review', 'Posted'].includes(task.status)) {
                s.inProgress++;
            } else if (['Not Started'].includes(task.status)) {
                s.pending++;
            }
            // 'Dropped' counts towards total but not active buckets
        });

        // 3. Calculate Rates & Convert to Array (Filtering out Unassigned)
        const finalStats = Object.values(statsMap)
            .filter(s => s.name !== 'Unassigned')
            .map(s => ({
                ...s,
                completionRate: s.total > 0 ? (s.completed / s.total) * 100 : 0
            }));

        // 4. SORTING LOGIC: Efficiency Score (Descending) -> Completed Count (Descending) -> Name (Ascending)
        finalStats.sort((a, b) => {
            if (Math.abs(b.completionRate - a.completionRate) > 0.01) {
                return b.completionRate - a.completionRate;
            }
            if (b.completed !== a.completed) {
                return b.completed - a.completed;
            }
            return a.name.localeCompare(b.name);
        });
        
        setStats(finalStats);
      } catch (e) {
        console.error(e);
        showToast("Failed to load performance data.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculate();
  }, []);

  const totalTasks = stats.reduce((acc, s) => acc + s.total, 0);
  const avgCompletionRate = stats.length > 0 ? stats.reduce((acc, s) => acc + s.completionRate, 0) / stats.length : 0;
  const topPerformers = stats.slice(0, 3);

  const getRankConfig = (index: number) => {
      if (index === 0) return {
          containerClass: 'order-2 -mt-12 z-20 scale-110',
          cardClass: 'bg-gradient-to-b from-yellow-50 via-white to-white border-yellow-200 shadow-yellow-500/20 shadow-2xl',
          icon: <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-pulse" />,
          titleColor: 'text-yellow-700',
          badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          ringColor: 'ring-yellow-400'
      };
      if (index === 1) return {
          containerClass: 'order-1 z-10',
          cardClass: 'bg-gradient-to-b from-slate-50 via-white to-white border-slate-200 shadow-slate-400/10 shadow-xl',
          icon: <Medal className="h-6 w-6 text-slate-400" />,
          titleColor: 'text-slate-700',
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
          ringColor: 'ring-slate-300'
      };
      if (index === 2) return {
          containerClass: 'order-3 z-10 mt-4',
          cardClass: 'bg-gradient-to-b from-orange-50 via-white to-white border-orange-200 shadow-orange-500/10 shadow-xl',
          icon: <Medal className="h-6 w-6 text-orange-400" />,
          titleColor: 'text-orange-700',
          badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
          ringColor: 'ring-orange-300'
      };
      return { containerClass: '', cardClass: '', icon: null, titleColor: '', badgeClass: '', ringColor: '' };
  };

  const getPerformanceBadge = (rate: number) => {
      if (rate >= 90) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200 shadow-sm"><Zap className="h-3 w-3 fill-current" /> ELITE</span>;
      if (rate >= 75) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"><Activity className="h-3 w-3" /> PRO</span>;
      if (rate >= 50) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">ACTIVE</span>;
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 shadow-sm">ROOKIE</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Navbar />
        
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none z-0" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] relative z-10">
           
           {/* New Header */}
           <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        Team Leaderboard
                        <Trophy className="h-8 w-8 text-yellow-500 fill-yellow-500 hidden sm:block" />
                    </h1>
                    <p className="text-lg text-gray-500 mt-2 font-medium max-w-xl">
                        Ranked by efficiency score and task completion velocity.
                    </p>
                </div>
                
                {/* Unified Stat Bar */}
                <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
                    <div className="px-6 py-3 flex items-center gap-4 border-r border-gray-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tasks</p>
                            <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
                        </div>
                    </div>
                    <div className="px-6 py-3 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Team Score</p>
                            <p className="text-xl font-bold text-gray-900">{avgCompletionRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
           </div>

           {isLoading ? (
             <div className="animate-pulse space-y-8">
                 <div className="flex justify-center gap-8 items-end h-64">
                     <div className="w-64 h-48 bg-gray-200 rounded-t-3xl" />
                     <div className="w-64 h-64 bg-gray-200 rounded-t-3xl" />
                     <div className="w-64 h-40 bg-gray-200 rounded-t-3xl" />
                 </div>
                 <div className="h-96 bg-gray-200 rounded-3xl w-full" />
             </div>
           ) : (
             <>
                {/* Podium - Only show if we have data */}
                {topPerformers.length > 0 && stats.length >= 3 && (
                    <div className="mb-20 px-4">
                        <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 max-w-5xl mx-auto">
                            {[topPerformers[1], topPerformers[0], topPerformers[2]].map((user, i) => {
                                if (!user) return null;
                                const rank = i === 1 ? 0 : i === 0 ? 1 : 2; 
                                const config = getRankConfig(rank);

                                return (
                                    <div key={user.name} className={`w-full md:w-80 flex flex-col ${config.containerClass}`}>
                                        <div 
                                            onClick={() => setSelectedUser(user)}
                                            className={`relative p-8 rounded-[2.5rem] border flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 cursor-pointer ${config.cardClass}`}
                                        >
                                            <div className="absolute -top-6">
                                                <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                                                    {config.icon}
                                                </div>
                                            </div>

                                            <div className="mt-6 mb-4 relative">
                                                <div className={`p-1.5 rounded-full bg-white shadow-sm ring-4 ${config.ringColor}`}>
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700 uppercase tracking-tighter">
                                                            {user.name.slice(0, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                                                    <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white">
                                                        {user.completionRate.toFixed(0)}% Score
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className={`text-xl font-bold mb-1 truncate w-full ${config.titleColor}`}>{user.name}</h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mb-6 ${config.badgeClass}`}>
                                                {user.role}
                                            </span>

                                            <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Completed</p>
                                                    <p className="text-xl font-bold text-gray-900">{user.completed}</p>
                                                </div>
                                                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned</p>
                                                    <p className="text-xl font-bold text-gray-900">{user.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-gray-400" /> 
                                Efficiency Rankings
                            </h3>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-100">
                                    <th className="px-8 py-5 w-1/4">Rank & Member</th>
                                    <th className="px-8 py-5 text-center">Efficiency Score</th>
                                    <th className="px-8 py-5 text-center">Task Distribution</th>
                                    <th className="px-8 py-5 w-1/3">Completion Velocity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.map((user, idx) => (
                                    <tr key={user.name} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div 
                                                className="flex items-center gap-4 cursor-pointer group/user"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <div className={`text-sm font-bold w-8 text-center flex-shrink-0 ${idx < 3 ? 'text-yellow-500 scale-110' : 'text-gray-300'}`}>
                                                    {idx < 3 ? <Crown className={`h-5 w-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-orange-400'}`} /> : `#${idx + 1}`}
                                                </div>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-xl object-cover shadow-sm border border-white" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shadow-sm border border-white">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-bold text-gray-900 block text-sm group-hover/user:text-brand-600 transition-colors underline-offset-4 group-hover/user:underline">{user.name}</span>
                                                    <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 uppercase tracking-wide">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-gray-900">{user.completionRate.toFixed(0)}</span>
                                                    <span className="text-xs font-bold text-gray-400">%</span>
                                                </div>
                                                {getPerformanceBadge(user.completionRate)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center items-center gap-4 text-xs">
                                                <div className="text-center">
                                                    <span className="block font-bold text-green-600 text-lg">{user.completed}</span>
                                                    <span className="text-gray-400 font-medium">Done</span>
                                                </div>
                                                <div className="h-8 w-px bg-gray-200" />
                                                <div className="text-center">
                                                    <span className="block font-bold text-blue-600 text-lg">{user.inProgress}</span>
                                                    <span className="text-gray-400 font-medium">Active</span>
                                                </div>
                                                <div className="h-8 w-px bg-gray-200" />
                                                <div className="text-center">
                                                    <span className="block font-bold text-gray-500 text-lg">{user.pending}</span>
                                                    <span className="text-gray-400 font-medium">Todo</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="w-full max-w-xs mx-auto">
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                                                    <span>Progress</span>
                                                    <span>{user.completed}/{user.total}</span>
                                                </div>
                                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: `${user.total > 0 ? (user.completed / user.total) * 100 : 0}%` }} />
                                                    <div className="h-full bg-blue-400/30" style={{ width: `${user.total > 0 ? (user.inProgress / user.total) * 100 : 0}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </>
           )}
        </main>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedUser(null)}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all scale-100 relative border border-gray-100" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedUser(null)} 
                    className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Banner & Avatar */}
                <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600 relative">
                    <img 
                        src="/banner.png" 
                        alt="Profile Banner" 
                        className="w-full h-full object-cover absolute inset-0 z-0"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div className="absolute -bottom-12 left-8 z-10">
                        <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-lg border border-gray-100">
                            {selectedUser.avatarUrl ? (
                                <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="h-full w-full rounded-2xl object-cover bg-gray-100" />
                            ) : (
                                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 uppercase tracking-tighter">
                                    {selectedUser.name.slice(0, 2)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Info */}
                <div className="pt-14 pb-8 px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                            {/* Role removed as per request */}
                        </div>
                        <div className="space-y-1.5 mt-2">
                            {selectedUser.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail className="h-4 w-4" /> {selectedUser.email}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" /> Remote Team Member
                            </div>
                            {selectedUser.createdAt && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" /> Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                            <div className="mb-1 text-emerald-600 flex justify-center"><CheckCircle2 className="h-5 w-5" /></div>
                            <span className="block text-2xl font-black text-gray-900">{selectedUser.completed}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Done</span>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                            <div className="mb-1 text-blue-600 flex justify-center"><Clock className="h-5 w-5" /></div>
                            <span className="block text-2xl font-black text-gray-900">{selectedUser.inProgress}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</span>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                            <div className="mb-1 text-purple-600 flex justify-center"><Target className="h-5 w-5" /></div>
                            <span className="block text-2xl font-black text-gray-900">{selectedUser.completionRate.toFixed(0)}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
