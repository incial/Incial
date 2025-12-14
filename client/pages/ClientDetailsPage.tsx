
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useParams, Link } from 'react-router-dom';
import { crmApi, tasksApi, usersApi } from '../services/api';
import { CRMEntry, Task, TaskFilterState, TaskStatus } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { ClientTaskForm } from '../components/client-tracker/ClientTaskForm';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckCircle, Plus, HardDrive, LayoutList, Calendar as CalendarIcon, User, ArrowLeft, ExternalLink, Kanban, Archive, ChevronDown, ChevronRight, PieChart, AlertCircle, Clock, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'list' | 'kanban' | 'mine' | 'calendar';

export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<CRMEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    status: '',
    priority: '',
    assignedTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!id) return;
      try {
        const [crmData, tasksData, usersData] = await Promise.all([
            crmApi.getAll(),
            tasksApi.getAll(),
            usersApi.getAll()
        ]);

        const foundClient = crmData.crmList.find(c => c.id === parseInt(id));
        setClient(foundClient || null);

        const clientTasks = tasksData.filter(t => t.companyId === parseInt(id));
        setTasks(clientTasks);

        const uMap: Record<string, string> = {};
        usersData.forEach(u => {
            if (u.avatarUrl) uMap[u.name] = u.avatarUrl;
        });
        setUserAvatarMap(uMap);

      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filteredBaseTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === '' || t.status === filters.status;
      const matchesPriority = filters.priority === '' || t.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === '' || t.assignedTo === filters.assignedTo;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    if (viewMode === 'mine' && user) {
        result = result.filter(t => t.assignedTo === user.name);
    }
    
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [tasks, viewMode, user, filters]);

  const { activeTasks, completedTasks } = useMemo(() => {
      const active = filteredBaseTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
      const completed = filteredBaseTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
      completed.sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt).getTime() - new Date(a.lastUpdatedAt || a.createdAt).getTime());
      return { activeTasks: active, completedTasks: completed };
  }, [filteredBaseTasks]);

  const progressStats = useMemo(() => {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Done' || t.status === 'Posted').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed' && t.status !== 'Done').length;
      return { total, completed, progress, highPriority };
  }, [tasks]);


  const handleCreate = () => {
      setEditingTask(undefined);
      setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
  };

  const handleDelete = async () => {
      if (!deleteId) return;
      
      const id = deleteId;
      setTasks(tasks.filter(t => t.id !== id));
      setDeleteId(null);
      
      try {
        await tasksApi.delete(id);
      } catch (e) {
        // Revert? For now simple error logging
        console.error("Delete failed", e);
      }
  };

  const handleSave = async (data: Partial<Task>) => {
      if (!client) return;
      const auditData = {
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      const finalData = { ...data, ...auditData };

      try {
          if (editingTask) {
              const updated = { ...editingTask, ...finalData } as Task;
              setTasks(tasks.map(t => t.id === updated.id ? updated : t));
              await tasksApi.update(updated.id, finalData);
          } else {
              const newTask = await tasksApi.create(finalData as Task);
              setTasks([newTask, ...tasks]);
          }
      } catch(e) {
          console.error("Save failed", e);
      }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
      const updated = { ...task, status: newStatus };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { status: newStatus });
  };

  const handleToggleVisibility = async (task: Task) => {
      const updated = { ...task, isVisibleOnMainBoard: !task.isVisibleOnMainBoard };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { isVisibleOnMainBoard: !task.isVisibleOnMainBoard });
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  if (!client) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Client not found</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link to="/client-tracker" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Clients
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">{client.company}</span>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                   <LayoutList className="h-64 w-64 text-brand-600 -rotate-12 transform translate-x-12 -translate-y-12" />
               </div>

               <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                   <div className="flex-1">
                       <div className="flex items-center gap-4 mb-3">
                           {/* Logo Logic */}
                           <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm relative">
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
                                <div className={`${client.companyImageUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center text-gray-300`}>
                                    <Building className="h-8 w-8" />
                                </div>
                           </div>

                           <div>
                               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.company}</h1>
                               <div className="flex items-center gap-3 mt-1">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                       {client.status}
                                   </span>
                                   <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                       <User className="h-3.5 w-3.5" /> {client.contactName}
                                   </span>
                               </div>
                           </div>
                       </div>
                       
                       <p className="text-gray-500 max-w-2xl mt-4 leading-relaxed">
                            {client.notes || 'Manage all tasks, deliverables, and assets for this client project here.'}
                       </p>

                       <div className="flex flex-wrap gap-3 mt-6">
                           {client.driveLink && (
                               <a href={client.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-white hover:border-blue-200 hover:text-blue-600 border border-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm">
                                    <HardDrive className="h-4 w-4" /> Project Assets
                               </a>
                           )}
                           {client.socials?.website && (
                                <a href={client.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 hover:bg-white hover:border-brand-200 hover:text-brand-600 border border-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm">
                                     <ExternalLink className="h-4 w-4" /> Website
                                </a>
                           )}
                       </div>
                   </div>

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
                               <span className="text-gray-500 font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> High Priority</span>
                               <span className="font-bold text-gray-900">{progressStats.highPriority}</span>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden min-h-[500px]">
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-b border-gray-100">
                    <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 w-full lg:w-auto overflow-x-auto">
                        {[
                            { id: 'list', label: 'List View', icon: LayoutList },
                            { id: 'kanban', label: 'Kanban', icon: Kanban },
                            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                            { id: 'mine', label: 'My Tasks', icon: User },
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

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button 
                            onClick={handleCreate}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 ml-auto lg:ml-0"
                        >
                            <Plus className="h-4 w-4" />
                            Add Task
                        </button>
                    </div>
                </div>

                {viewMode !== 'calendar' && (
                    <TasksFilter filters={filters} setFilters={setFilters} />
                )}

                <div className="flex-1 overflow-y-auto bg-white p-0">
                    {(viewMode === 'list' || viewMode === 'mine') && (
                        <div>
                             <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-20">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Queue ({activeTasks.length})</h3>
                             </div>
                             
                             <ClientTaskTable 
                                tasks={activeTasks} 
                                userAvatarMap={userAvatarMap}
                                onEdit={handleEdit} 
                                onDelete={(id) => setDeleteId(id)} 
                                onStatusChange={handleStatusChange}
                                onToggleVisibility={handleToggleVisibility}
                                readOnly={false}
                            />

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
                                                userAvatarMap={userAvatarMap}
                                                onEdit={handleEdit} 
                                                onDelete={(id) => setDeleteId(id)} 
                                                onStatusChange={handleStatusChange}
                                                onToggleVisibility={handleToggleVisibility}
                                                readOnly={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'kanban' && (
                        <div className="h-full p-6 bg-gray-50/30">
                            <TasksKanban 
                                tasks={filteredBaseTasks} 
                                userAvatarMap={userAvatarMap}
                                onEdit={handleEdit} 
                                onStatusChange={handleStatusChange} 
                                readOnly={false}
                            />
                        </div>
                    )}

                    {viewMode === 'calendar' && (
                        <div className="h-full p-6">
                            <TasksCalendar tasks={filteredBaseTasks} onEdit={handleEdit} />
                        </div>
                    )}
                </div>
                
                <div className="p-3 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                    <span>{filteredBaseTasks.length} total tasks</span>
                    <span>Last synced just now</span>
                </div>
           </div>

        </main>
      </div>

      <ClientTaskForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingTask}
        companyId={client.id}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to remove this task?"
      />
    </div>
  );
};
