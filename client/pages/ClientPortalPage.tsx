
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry, Task, TaskFilterState, TaskStatus } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { CheckCircle, HardDrive, LayoutList, Calendar as CalendarIcon, User, ExternalLink, Kanban, Archive, ChevronDown, ChevronRight, AlertCircle, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

type ViewMode = 'list' | 'kanban' | 'calendar';

export const ClientPortalPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [client, setClient] = useState<CRMEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Filters State (Client can filter their own tasks)
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Security Check: Ensure user has a companyId linked
      if (!user?.companyId) {
          setIsLoading(false);
          return; 
      }

      try {
        const crmData = await crmApi.getAll();
        const foundClient = crmData.crmList.find(c => c.id === user.companyId);
        setClient(foundClient || null);

        const tasksData = await tasksApi.getAll();
        // Strict filtering by companyId
        const clientTasks = tasksData.filter(t => t.companyId === user.companyId);
        setTasks(clientTasks);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Base filtering based on search/dropdowns
  const filteredBaseTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === '' || t.status === filters.status;
      const matchesPriority = filters.priority === '' || t.priority === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [tasks, filters]);

  // Split tasks for the "List" view
  const { activeTasks, completedTasks } = useMemo(() => {
      const active = filteredBaseTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
      const completed = filteredBaseTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
      completed.sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt).getTime() - new Date(a.lastUpdatedAt || a.createdAt).getTime());
      return { activeTasks: active, completedTasks: completed };
  }, [filteredBaseTasks]);

  // Stats Calculation
  const progressStats = useMemo(() => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Done').length;
      return { total, completed, progress, highPriority };
  }, [tasks]);

  // Read-only handlers
  const handleEdit = (task: Task) => { /* No-op for clients for now */ };
  const handleDelete = (id: number) => { /* No-op for clients */ };
  const handleStatusChange = (task: Task, status: TaskStatus) => { /* No-op */ };
  const handleToggleVisibility = (task: Task) => { /* No-op */ };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Loading Project Data...</div>;
  
  if (!user?.companyId || !client) {
      return (
        <div className="flex h-screen items-center justify-center bg-[#F8FAFC] flex-col gap-4 p-4 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">No Project Found</h2>
                <p className="text-gray-500 mt-1">Your account is not linked to an active project.</p>
            </div>
            <button 
                onClick={logout}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Header */}
           <div className="mb-6">
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Portal</h1>
               <p className="text-gray-500">Track progress and updates for your project.</p>
           </div>

           {/* Premium Project Card */}
           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
               <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                   <div className="flex-1">
                       <div className="flex items-center gap-4 mb-3">
                           <div className="h-16 w-16 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
                               {client.company.charAt(0)}
                           </div>
                           <div>
                               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.company}</h1>
                               <div className="flex items-center gap-3 mt-1">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                       {client.status}
                                   </span>
                                   <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                       <User className="h-3.5 w-3.5" /> Project Lead: {client.assignedTo}
                                   </span>
                               </div>
                           </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-3 mt-6">
                           {client.driveLink && (
                               <a href={client.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-white hover:border-blue-200 hover:text-blue-600 border border-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm">
                                    <HardDrive className="h-4 w-4" /> Assets Folder
                               </a>
                           )}
                           {client.socials?.website && (
                                <a href={client.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-white hover:border-brand-200 hover:text-brand-600 border border-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm">
                                     <ExternalLink className="h-4 w-4" /> Live Website
                                </a>
                           )}
                       </div>
                   </div>

                   {/* Right Side Stats */}
                   <div className="flex items-center gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 backdrop-blur-sm">
                       <div className="relative h-24 w-24 flex-shrink-0">
                           <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                               <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                               <path className="text-brand-600 transition-all duration-1000 ease-out" strokeDasharray={`${progressStats.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                               <span className="text-xl font-bold text-gray-900">{progressStats.progress}%</span>
                               <span className="text-[9px] font-bold text-gray-400 uppercase">Done</span>
                           </div>
                       </div>

                       <div className="space-y-3 min-w-[140px]">
                           <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-500 font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Completed</span>
                               <span className="font-bold text-gray-900">{progressStats.completed}/{progressStats.total}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-500 font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Pending High</span>
                               <span className="font-bold text-gray-900">{progressStats.highPriority}</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* Toolbar & Table Container */}
           <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden min-h-[500px]">
                
                {/* Header Toolbar */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-b border-gray-100">
                    <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 w-full lg:w-auto overflow-x-auto">
                        {[
                            { id: 'list', label: 'List View', icon: LayoutList },
                            { id: 'kanban', label: 'Kanban', icon: Kanban },
                            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                        ].map((view) => (
                            <button
                                key={view.id}
                                onClick={() => setViewMode(view.id as ViewMode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    viewMode === view.id 
                                    ? 'bg-white text-brand-700 shadow-sm ring-1 ring-black/5' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                            >
                                <view.icon className="h-3.5 w-3.5" />
                                {view.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                {viewMode !== 'calendar' && (
                    <TasksFilter filters={filters} setFilters={setFilters} />
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white p-0">
                    {/* LIST view */}
                    {viewMode === 'list' && (
                        <div>
                             <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-20">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Queue ({activeTasks.length})</h3>
                             </div>
                             
                             <ClientTaskTable 
                                tasks={activeTasks} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete} 
                                onStatusChange={handleStatusChange}
                                onToggleVisibility={handleToggleVisibility}
                                readOnly={true} // Clients cannot edit
                            />

                            {/* Completed Section */}
                            {completedTasks.length > 0 && (
                                <div className="border-t border-gray-100 mt-4">
                                     <button 
                                        onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                                        className="w-full flex items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                                    >
                                        <div className="p-1 rounded-md bg-gray-200 group-hover:bg-gray-300 transition-colors">
                                            {isCompletedExpanded ? <ChevronDown className="h-3 w-3 text-gray-600" /> : <ChevronRight className="h-3 w-3 text-gray-600" />}
                                        </div>
                                        <Archive className="h-4 w-4 text-gray-400" />
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                            Completed Archives ({completedTasks.length})
                                        </h3>
                                    </button>

                                    {isCompletedExpanded && (
                                        <div className="bg-gray-50/30">
                                            <ClientTaskTable 
                                                tasks={completedTasks} 
                                                onEdit={handleEdit} 
                                                onDelete={handleDelete} 
                                                onStatusChange={handleStatusChange}
                                                onToggleVisibility={handleToggleVisibility}
                                                readOnly={true} // Clients cannot edit
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* KANBAN view */}
                    {viewMode === 'kanban' && (
                        <div className="h-full p-6 bg-gray-50/30">
                            <TasksKanban 
                                tasks={filteredBaseTasks} 
                                onEdit={handleEdit} 
                                onStatusChange={handleStatusChange} 
                                readOnly={true} // Disable dragging for clients
                            />
                        </div>
                    )}

                    {/* CALENDAR view */}
                    {viewMode === 'calendar' && (
                        <div className="h-full p-6">
                            <TasksCalendar tasks={filteredBaseTasks} onEdit={handleEdit} />
                        </div>
                    )}
                </div>
           </div>
        </main>
      </div>
    </div>
  );
};
