
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry } from '../types';
import { ListTodo, Search, Building, Clock, PieChart, ArrowRight, CheckCircle2, AlertTriangle, Briefcase, User, ImageIcon } from 'lucide-react';

interface ClientWithStats extends CRMEntry {
    totalTasks: number;
    completedTasks: number;
    progress: number;
    pendingHighPriority: number;
}

export const ClientTrackerPage: React.FC = () => {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [crmData, tasksData] = await Promise.all([
            crmApi.getAll(),
            tasksApi.getAll()
        ]);

        // Filter active companies
        const activeCompanies = crmData.crmList.filter(c => 
            ['onboarded', 'on progress', 'Quote Sent'].includes(c.status)
        );

        // Map stats
        const clientsWithStats = activeCompanies.map(client => {
            const clientTasks = tasksData.filter(t => t.companyId === client.id);
            const total = clientTasks.length;
            const completed = clientTasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length;
            const highPriority = clientTasks.filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Done').length;
            
            return {
                ...client,
                totalTasks: total,
                completedTasks: completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0,
                pendingHighPriority: highPriority
            };
        });

        setClients(clientsWithStats.sort((a, b) => b.id - a.id));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClients = clients.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  // Global Stats
  const totalActive = clients.length;
  const totalPendingTasks = clients.reduce((acc, c) => acc + (c.totalTasks - c.completedTasks), 0);
  const criticalTasks = clients.reduce((acc, c) => acc + c.pendingHighPriority, 0);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
             <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                        <ListTodo className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Client Projects</h1>
                </div>
                <p className="text-gray-500 font-medium ml-1">Monitor progress and deliverables across all active accounts.</p>
             </div>
             
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search active clients..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 shadow-sm transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
             </div>
           </div>

           {/* Stats Overview Bar */}
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 mb-10 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="flex-1 p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Active Projects</p>
                        <p className="text-2xl font-black text-gray-900">{totalActive}</p>
                    </div>
                </div>
                <div className="flex-1 p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Pending Tasks</p>
                        <p className="text-2xl font-black text-gray-900">{totalPendingTasks}</p>
                    </div>
                </div>
                <div className="flex-1 p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Critical Items</p>
                        <p className="text-2xl font-black text-gray-900">{criticalTasks}</p>
                    </div>
                </div>
           </div>

           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200 rounded-[2rem] animate-pulse" />)}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <Link 
                        key={client.id} 
                        to={`/client-tracker/${client.id}`}
                        className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                        {/* Decorative BG Blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-[4rem] -z-0 opacity-50 group-hover:scale-110 transition-transform origin-top-right duration-500" />

                        <div className="p-7 flex-1 z-10">
                            {/* Header: Logo & Identity - STRICT FLEX ALIGNMENT */}
                            <div className="flex items-start justify-between gap-3 mb-6">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Logo Container */}
                                    <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-brand-200 transition-colors shadow-sm relative">
                                        {client.companyImageUrl ? (
                                            <img 
                                                src={client.companyImageUrl} 
                                                alt={client.company} 
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    e.currentTarget.nextElementSibling?.classList.add('flex');
                                                }}
                                            />
                                        ) : null}
                                        {/* Fallback Icon - Centered (Shows if no image or error) */}
                                        <div className={`${client.companyImageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center text-gray-300 group-hover:text-brand-500 transition-colors`}>
                                            <Building className="h-7 w-7" />
                                        </div>
                                    </div>
                                    
                                    {/* Text Block */}
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors truncate">
                                            {client.company}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
                                            <User className="h-3 w-3 text-gray-400" />
                                            <span className="truncate max-w-[120px]">{client.contactName || 'No Contact'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border bg-white ${
                                    client.status === 'onboarded' ? 'text-emerald-700 border-emerald-100' : 
                                    client.status === 'Quote Sent' ? 'text-sky-700 border-sky-100' :
                                    'text-amber-700 border-amber-100'
                                } shadow-sm`}>
                                    {client.status}
                                </span>
                            </div>

                            {/* Mini Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 group-hover:border-brand-100 group-hover:bg-brand-50/30 transition-colors">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Tasks</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{client.completedTasks}</span>
                                        <span className="text-xs font-semibold text-gray-400">/{client.totalTasks}</span>
                                    </div>
                                </div>
                                <div className={`p-3 bg-gray-50/50 rounded-2xl border border-gray-100 transition-colors ${client.pendingHighPriority > 0 ? 'group-hover:bg-rose-50/30 group-hover:border-rose-100' : ''}`}>
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Critical</span>
                                    <div className={`flex items-center gap-1.5 ${client.pendingHighPriority > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-lg font-bold">{client.pendingHighPriority}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Footer */}
                        <div className="px-7 pb-7 pt-2 z-10">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Completion</span>
                                <span className="text-sm font-bold text-gray-900">{client.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        client.progress === 100 ? 'bg-emerald-500' : 'bg-brand-600'
                                    }`}
                                    style={{ width: `${client.progress}%` }} 
                                />
                            </div>
                        </div>
                    </Link>
                ))}
                
                {filteredClients.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg">No clients found</h3>
                        <p className="text-gray-500 mt-1">Try searching for a different company name.</p>
                    </div>
                )}
             </div>
           )}
        </main>
      </div>
    </div>
  );
};
