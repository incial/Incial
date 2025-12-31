
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { crmApi, tasksApi } from '../services/api';
import { Search, Building, ChevronRight, Activity, ChevronUp, ChevronDown, Layers, Target, ArrowUpRight } from 'lucide-react';
import { getStatusStyles } from '../utils';
import { useLayout } from '../context/LayoutContext';
import { PremiumLogo } from '../components/ui/PremiumLogo';

type SortKey = 'company' | 'progress' | 'status' | 'completed' | 'total';
type SortDirection = 'asc' | 'desc';

export const ClientTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarCollapsed } = useLayout();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'total',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crmData, tasksData] = await Promise.all([crmApi.getAll(), tasksApi.getAll()]);
        const activeCompanies = crmData.crmList.filter(c => ['onboarded', 'on progress', 'Quote Sent'].includes(c.status));
        setClients(activeCompanies.map(client => {
            const clientTasks = tasksData.filter(t => t.companyId === client.id);
            const completed = clientTasks.filter(t => ['Completed', 'Done', 'Posted'].includes(t.status)).length;
            return { 
                ...client, 
                total: clientTasks.length, 
                completed, 
                progress: clientTasks.length > 0 ? Math.round((completed / clientTasks.length) * 100) : 0 
            };
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedClients = useMemo(() => {
    let result = clients.filter(c => 
        (c.company || '').toLowerCase().includes(search.toLowerCase()) || 
        (c.contactName || '').toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.key) {
            case 'company': return direction * a.company.localeCompare(b.company);
            case 'progress': return direction * (a.progress - b.progress);
            case 'status': return direction * a.status.localeCompare(b.status);
            case 'completed': return direction * (a.completed - b.completed);
            case 'total': return direction * (a.total - b.total);
            default: return 0;
        }
    });
    return result;
  }, [clients, search, sortConfig]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ChevronDown className="h-3 w-3 opacity-20 group-hover:opacity-50 transition-opacity" />;
    return sortConfig.direction === 'asc' 
        ? <ChevronUp className="h-3 w-3 text-brand-600 animate-premium" /> 
        : <ChevronDown className="h-3 w-3 text-brand-600 animate-premium" />;
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        <div className="flex-1 px-4 lg:px-12 py-6 lg:py-10 pb-32">
           
           {/* High-Impact Header */}
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 lg:gap-10 mb-10 lg:mb-16 animate-premium">
             <div className="w-full xl:w-auto">
                <div className="flex items-center gap-3 mb-2 lg:mb-4">
                     <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                     <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.4em]">Operations Center</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none display-text">Tracker.</h1>
                <p className="text-slate-500 text-sm lg:text-lg mt-4 lg:mt-6 font-medium max-w-xl leading-relaxed">
                    Visualizing execution velocity and roadmap synchronization across all project nodes.
                </p>
             </div>
             
             <div className="relative w-full xl:w-[450px] group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Deep Search active nodes..." 
                    className="w-full pl-16 pr-8 py-3 lg:py-5 bg-white/60 backdrop-blur-xl border border-white rounded-[1.5rem] lg:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-premium transition-all font-bold text-slate-900 placeholder-slate-300 text-sm lg:text-base" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                />
             </div>
           </div>

           {/* Metrics Overlay */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
               {[
                   { label: 'Active Nodes', val: clients.length, icon: Layers, col: 'indigo' },
                   { label: 'Deployment Score', val: '94%', icon: Target, col: 'emerald' },
                   { label: 'System Pulse', val: 'Optimal', icon: Activity, col: 'brand' }
               ].map(s => (
                   <div key={s.label} className="bg-white/40 backdrop-blur-3xl p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-white shadow-premium group transition-all duration-500 hover:bg-white/60">
                       <div className="p-3 bg-slate-950 text-white rounded-2xl w-fit mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg"><s.icon className="h-4 w-4 lg:h-5 lg:w-5" /></div>
                       <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                       <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{s.val}</h3>
                   </div>
               ))}
           </div>

           {/* Premium Registry Table */}
           <div className="bg-white/30 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3.5rem] border border-white/60 shadow-2xl overflow-hidden flex flex-col relative w-full">
                {/* Decorative background blur for table area */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10" />

                <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar relative z-20">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                        <thead className="z-30">
                            <tr>
                                {/* Note: Sticky on left only for Large screens (lg:) to avoid blocking mobile view */}
                                <th className="relative lg:sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-6 lg:px-12 py-6 lg:left-0 border-b border-white/50 text-left shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                    <button onClick={() => handleSort('company')} className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group hover:text-indigo-600 outline-none transition-colors">
                                        Project Identity <SortIcon column="company" />
                                    </button>
                                </th>
                                <th className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 lg:px-8 py-6 border-b border-white/50 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    <button onClick={() => handleSort('progress')} className="flex items-center gap-2 group outline-none hover:text-indigo-600 transition-colors">
                                        Delivery Velocity <SortIcon column="progress" />
                                    </button>
                                </th>
                                <th className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 lg:px-8 py-6 border-b border-white/50 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    <button onClick={() => handleSort('status')} className="flex items-center gap-2 group outline-none hover:text-indigo-600 transition-colors">
                                        Status <SortIcon column="status" />
                                    </button>
                                </th>
                                <th className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 lg:px-8 py-6 border-b border-white/50 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    <button onClick={() => handleSort('total')} className="flex items-center gap-2 group outline-none hover:text-indigo-600 transition-colors">
                                        Roadmap Progress <SortIcon column="total" />
                                    </button>
                                </th>
                                <th className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl px-6 lg:px-10 py-6 border-b border-white/50 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-8"><div className="h-20 bg-white/40 rounded-[2rem] w-full border border-white/50"></div></td>
                                    </tr>
                                ))
                            ) : processedClients.map(client => (
                                <tr 
                                    key={client.id} 
                                    onClick={() => navigate(`/client-tracker/${client.id}`)}
                                    className="group transition-all duration-500 cursor-pointer hover:bg-white/40"
                                >
                                    {/* Note: Sticky on left only for Large screens (lg:) */}
                                    <td className="px-6 lg:px-12 py-6 relative lg:sticky lg:left-0 group-hover:bg-white/90 transition-colors z-20 lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-transparent group-hover:border-white/50 rounded-r-[2rem]">
                                        <div className="flex items-center gap-4 lg:gap-6">
                                            <div className="relative">
                                                <PremiumLogo 
                                                    src={client.companyImageUrl} 
                                                    alt={client.company} 
                                                    fallback={<Building className="h-6 w-6 text-slate-300" />}
                                                    containerClassName="h-12 w-12 lg:h-16 lg:w-16 bg-white rounded-[1.2rem] border border-white shadow-xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
                                                />
                                                <div className="absolute -bottom-1 -right-1 h-3 w-3 lg:h-4 lg:w-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-black text-slate-900 text-base lg:text-lg group-hover:text-indigo-600 transition-colors tracking-tight truncate max-w-[150px] lg:max-w-[200px] leading-none">
                                                        {client.company}
                                                    </p>
                                                    <ArrowUpRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span> POC: {client.contactName}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 lg:px-8 py-6 align-middle">
                                        <div className="w-48 group/progress">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[11px] font-black text-slate-900 group-hover/progress:text-indigo-600 transition-colors">{client.progress}%</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completion</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-white">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-[1500ms] shadow-[0_0_15px_rgba(99,102,241,0.4)] relative" 
                                                    style={{ width: `${client.progress}%` }} 
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 lg:px-8 py-6 align-middle">
                                        <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-xl shadow-sm whitespace-nowrap transition-transform duration-300 group-hover:scale-105 inline-block ${getStatusStyles(client.status)}`}>
                                            {client.status}
                                        </span>
                                    </td>

                                    <td className="px-6 lg:px-8 py-6 align-middle">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:border-indigo-100 group-hover:shadow-md transition-all">
                                                <Activity className={`h-5 w-5 ${sortConfig.key === 'total' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                                            </div>
                                            <div>
                                                <span className="text-xl font-black text-slate-900 leading-none block mb-1">{client.completed} <span className="text-slate-300">/</span> {client.total}</span>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Milestones</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 lg:px-10 py-6 align-middle text-right">
                                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white border border-slate-100 text-slate-300 group-hover:text-white group-hover:bg-slate-950 group-hover:border-slate-950 group-hover:shadow-2xl transition-all duration-500 transform group-hover:rotate-0 rotate-[-45deg]">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-6 lg:p-8 border-t border-white/40 bg-white/20 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex justify-between rounded-b-[2rem] lg:rounded-b-[3.5rem] backdrop-blur-xl relative z-20">
                    <span className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/> System Scan: Healthy</span>
                    <span>Synchronized: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};
