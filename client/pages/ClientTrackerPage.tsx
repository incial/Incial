
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry, Task } from '../types';
import { ListTodo, Search, Building, MoreHorizontal, CheckCircle2, Clock, PieChart, ArrowRight } from 'lucide-react';

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

        // Sort by progress (lowest first implies needs attention) or ID
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
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <ListTodo className="h-8 w-8 text-brand-600" /> Client Projects
                </h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Monitor progress and deliverables across all active accounts.</p>
             </div>
             
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
             </div>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{totalPendingTasks}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <PieChart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Critical Items</p>
                        <p className="text-2xl font-bold text-gray-900">{criticalTasks}</p>
                    </div>
                </div>
           </div>

           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <Link 
                        key={client.id} 
                        to={`/client-tracker/${client.id}`}
                        className="group relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-100 transition-all duration-300 flex flex-col overflow-hidden"
                    >
                        {/* Card Header */}
                        <div className="p-6 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-14 w-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-105 transition-transform shadow-sm text-xl font-bold text-gray-400 group-hover:text-brand-600 group-hover:from-brand-50 group-hover:to-white">
                                    {client.company.charAt(0)}
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg border ${
                                    client.status === 'onboarded' ? 'bg-green-50 text-green-700 border-green-100' : 
                                    client.status === 'Quote Sent' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                    {client.status}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">
                                {client.company}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <Building className="h-3.5 w-3.5" />
                                {client.contactName || 'No Contact'}
                            </div>

                            {/* Progress Section */}
                            <div className="mb-2">
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-gray-500">Project Progress</span>
                                    <span className="text-gray-900">{client.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            client.progress === 100 ? 'bg-green-500' : 'bg-brand-600'
                                        }`}
                                        style={{ width: `${client.progress}%` }} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-auto px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between group-hover:bg-brand-50/30 transition-colors">
                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>{client.completedTasks}/{client.totalTasks} Tasks</span>
                                </div>
                                {client.pendingHighPriority > 0 && (
                                    <div className="flex items-center gap-1.5 text-red-600">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                        <span>{client.pendingHighPriority} Critical</span>
                                    </div>
                                )}
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-brand-200 group-hover:text-brand-600 transition-colors shadow-sm">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>
                ))}
                
                {filteredClients.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-gray-300" />
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
