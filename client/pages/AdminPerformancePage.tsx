
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi } from '../services/api';
import { Task } from '../types';
import { Trophy, CheckCircle, Clock, AlertCircle, BarChart2, TrendingUp, Medal, Crown, Activity, Target, Zap } from 'lucide-react';

interface UserStats {
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number; // Not Started
  completionRate: number;
}

export const AdminPerformancePage: React.FC = () => {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      setIsLoading(true);
      try {
        const tasks = await tasksApi.getAll();
        
        // Group by User
        const userMap: Record<string, Task[]> = {};
        
        tasks.forEach(task => {
            const assignee = task.assignedTo || 'Unassigned';
            if (!userMap[assignee]) userMap[assignee] = [];
            userMap[assignee].push(task);
        });

        // Calculate Stats
        const calculatedStats: UserStats[] = Object.keys(userMap).map(user => {
            const userTasks = userMap[user];
            const total = userTasks.length;
            const completed = userTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
            const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
            const pending = userTasks.filter(t => t.status === 'Not Started').length;
            
            return {
                name: user,
                total,
                completed,
                inProgress,
                pending,
                completionRate: total > 0 ? (completed / total) * 100 : 0
            };
        });

        // Sort by Completed count descending
        calculatedStats.sort((a, b) => b.completed - a.completed);

        setStats(calculatedStats);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCalculate();
  }, []);

  // Global Metrics
  const totalTasks = stats.reduce((acc, s) => acc + s.total, 0);
  const totalCompleted = stats.reduce((acc, s) => acc + s.completed, 0);
  const avgCompletionRate = stats.length > 0 ? stats.reduce((acc, s) => acc + s.completionRate, 0) / stats.length : 0;

  const topPerformers = stats.slice(0, 3);

  const getRankConfig = (index: number) => {
      if (index === 0) return {
          bg: 'bg-gradient-to-b from-yellow-50 via-yellow-50/50 to-white',
          border: 'border-yellow-200',
          icon: <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />,
          rankColor: 'text-yellow-600 bg-yellow-100',
          shadow: 'shadow-yellow-500/10'
      };
      if (index === 1) return {
          bg: 'bg-gradient-to-b from-slate-50 via-slate-50/50 to-white',
          border: 'border-slate-200',
          icon: <Medal className="h-6 w-6 text-slate-400" />,
          rankColor: 'text-slate-600 bg-slate-100',
          shadow: 'shadow-slate-500/10'
      };
      if (index === 2) return {
          bg: 'bg-gradient-to-b from-orange-50 via-orange-50/50 to-white',
          border: 'border-orange-200',
          icon: <Medal className="h-6 w-6 text-orange-400" />,
          rankColor: 'text-orange-600 bg-orange-100',
          shadow: 'shadow-orange-500/10'
      };
      return { bg: 'bg-white', border: 'border-gray-100', icon: null, rankColor: 'text-gray-500', shadow: '' };
  };

  const getPerformanceBadge = (rate: number) => {
      if (rate >= 80) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 w-fit"><Zap className="h-3 w-3" /> Elite</span>;
      if (rate >= 50) return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit"><Activity className="h-3 w-3" /> Pro</span>;
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 w-fit">Rookie</span>;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 text-brand-600" /> Team Performance
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">Real-time productivity insights and leaderboards.</p>
                </div>
                
                {/* Summary Metrics */}
                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tasks</p>
                            <p className="text-xl font-bold text-gray-900">{totalTasks}</p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Completion</p>
                            <p className="text-xl font-bold text-gray-900">{avgCompletionRate.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
           </div>

           {isLoading ? (
             <div className="animate-pulse space-y-6">
                 <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
                 <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
             </div>
           ) : (
             <>
                {/* Top Performers Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
                    {/* Reorder for visual podium effect: 2nd, 1st, 3rd */}
                    {[topPerformers[1], topPerformers[0], topPerformers[2]].map((user, i) => {
                        if (!user) return null;
                        // Map back to original rank index
                        const rankIndex = i === 1 ? 0 : i === 0 ? 1 : 2; 
                        const config = getRankConfig(rankIndex);
                        const isWinner = rankIndex === 0;

                        return (
                            <div 
                                key={user.name} 
                                className={`relative p-6 rounded-3xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] duration-300 ${config.bg} ${config.border} ${config.shadow} ${isWinner ? 'h-80 justify-center z-10 shadow-2xl' : 'h-64 justify-end shadow-lg'}`}
                            >
                                <div className={`absolute -top-5 left-1/2 -translate-x-1/2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 ${isWinner ? 'scale-125' : ''}`}>
                                    {config.icon || <span className="text-lg font-bold text-gray-400">#{rankIndex + 1}</span>}
                                </div>

                                <div className="mt-6 mb-3 relative">
                                    <div className={`rounded-full p-1 bg-gradient-to-tr ${isWinner ? 'from-yellow-400 to-orange-500' : 'from-gray-200 to-gray-300'}`}>
                                        <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-gray-800">
                                            {user.name.charAt(0)}
                                        </div>
                                    </div>
                                    <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm ${config.rankColor}`}>
                                        #{rankIndex + 1}
                                    </span>
                                </div>
                                
                                <h3 className={`font-bold text-gray-900 mb-1 ${isWinner ? 'text-2xl' : 'text-xl'}`}>{user.name}</h3>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-6">{getPerformanceBadge(user.completionRate)}</p>
                                
                                <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                                    <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100/50 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Tasks</p>
                                        <p className="text-lg font-bold text-gray-900">{user.completed}/{user.total}</p>
                                    </div>
                                    <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100/50 backdrop-blur-sm">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Rate</p>
                                        <p className={`text-lg font-bold ${user.completionRate >= 80 ? 'text-green-600' : 'text-gray-900'}`}>
                                            {user.completionRate.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Stats Table */}
                <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Detailed Breakdown</h3>
                            <p className="text-sm text-gray-500">Comprehensive view of all team members.</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                                    <th className="px-8 py-4 w-1/4">Team Member</th>
                                    <th className="px-8 py-4 text-center">Efficiency</th>
                                    <th className="px-8 py-4 text-center">Workload</th>
                                    <th className="px-8 py-4">Progress Distribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.map((user, idx) => (
                                    <tr key={user.name} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-300 font-bold text-sm w-4">{idx + 1}</span>
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{user.name}</span>
                                                    <span className="text-xs text-gray-500">Team Member</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl font-bold text-gray-900">{user.completionRate.toFixed(0)}%</span>
                                                {getPerformanceBadge(user.completionRate)}
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className="flex justify-center gap-3">
                                                <div className="text-center">
                                                    <span className="block text-lg font-bold text-green-600">{user.completed}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Done</span>
                                                </div>
                                                <div className="w-px bg-gray-100 h-8 self-center"></div>
                                                <div className="text-center">
                                                    <span className="block text-lg font-bold text-blue-600">{user.inProgress}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Active</span>
                                                </div>
                                                <div className="w-px bg-gray-100 h-8 self-center"></div>
                                                <div className="text-center">
                                                    <span className="block text-lg font-bold text-gray-400">{user.pending}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Todo</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-5">
                                            <div className="w-full max-w-xs">
                                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1.5">
                                                    <span>Completion Progress</span>
                                                    <span>{user.completed}/{user.total}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                    <div 
                                                        className="h-full bg-green-500 transition-all duration-700" 
                                                        style={{ width: `${(user.completed / user.total) * 100}%` }}
                                                        title="Completed"
                                                    />
                                                    <div 
                                                        className="h-full bg-blue-400 transition-all duration-700" 
                                                        style={{ width: `${(user.inProgress / user.total) * 100}%` }}
                                                        title="In Progress"
                                                    />
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
    </div>
  );
};
