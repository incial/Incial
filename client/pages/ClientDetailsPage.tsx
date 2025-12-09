
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useParams, Link } from 'react-router-dom';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry, Task, TaskFilterState, TaskStatus } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { ClientTaskForm } from '../components/client-tracker/ClientTaskForm';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckCircle, Plus, HardDrive, LayoutList, Calendar as CalendarIcon, User, ArrowLeft, ExternalLink, Kanban, Archive, ChevronDown, ChevronRight, PieChart, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'list' | 'kanban' | 'mine' | 'calendar';

export const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<CRMEntry | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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
        const crmData = await crmApi.getAll();
        const foundClient = crmData.crmList.find(c => c.id === parseInt(id));
        setClient(foundClient || null);

        const tasksData = await tasksApi.getAll();
        const clientTasks = tasksData.filter(t => t.companyId === parseInt(id));
        setTasks(clientTasks);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Base filtering based on search/dropdowns
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

  // Split tasks for the "List" view
  const { activeTasks, completedTasks } = useMemo(() => {
      const active = filteredBaseTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
      const completed = filteredBaseTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
      // Sort completed by newest update
      completed.sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt).getTime() - new Date(a.lastUpdatedAt || a.createdAt).getTime());
      return { activeTasks: active, completedTasks: completed };
  }, [filteredBaseTasks]);

  // Stats Calculation for Header
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
      const newTasks = tasks.filter(t => t.id !== deleteId);
      setTasks(newTasks);
      setDeleteId(null);
      await tasksApi.delete(deleteId);
      const allTasks = await tasksApi.getAll();
      const updatedAll = allTasks.filter(t => t.id !== deleteId);
      localStorage.setItem('mock_tasks_data', JSON.stringify(updatedAll));
  };

  const handleSave = async (data: Partial<Task>) => {
      if (!client) return;
      const auditData = {
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      const finalData = { ...data, ...auditData };

      if (editingTask) {
          const updated = { ...editingTask, ...finalData } as Task;
          const newTasks = tasks.map(t => t.id === updated.id ? updated : t);
          setTasks(newTasks);
          await tasksApi.update(updated.id, finalData);
          
          const allTasks = await tasksApi.getAll();
          const updatedAll = allTasks.map(t => t.id === updated.id ? updated : t);
          localStorage.setItem('mock_tasks_data', JSON.stringify(updatedAll));
      } else {
          const newTask = await tasksApi.create(finalData as Task);
          setTasks([newTask, ...tasks]);
          
          const allTasks = await tasksApi.getAll();
          localStorage.setItem('mock_tasks_data', JSON.stringify([newTask, ...allTasks]));
      }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
      const updated = { ...task, status: newStatus };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      const allTasks = await tasksApi.getAll();
      const updatedAll = allTasks.map(t => t.id === task.id ? updated : t);
      localStorage.setItem('mock_tasks_data', JSON.stringify(updatedAll));
  };

  const handleToggleVisibility = async (task: Task) => {
      const updated = { ...task, isVisibleOnMainBoard: !task.isVisibleOnMainBoard };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      await tasksApi.update(task.id, { isVisibleOnMainBoard: !task.isVisibleOnMainBoard });
      const allTasks = await tasksApi.getAll();
      const updatedAll = allTasks.map(t => t.id === task.id ? updated : t);
      localStorage.setItem('mock_tasks_data', JSON.stringify(updatedAll));
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  if (!client) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Client not found</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Breadcrumbs */}
           <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Link to="/client-tracker" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Clients
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">{client.company}</span>
           </div>

           {/* Premium Header */}
           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                   <LayoutList className="h-64 w-64 text-brand-600 -rotate-12 transform translate-x-12 -translate-y-12" />
               </div>

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

                   {/* Right Side Stats */}
                   <div className="flex items-center gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 backdrop-blur-sm">
                       {/* Circular Progress */}
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

           {/* Toolbar & Table Container */}
           <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden min-h-[500px]">
                
                {/* Header Toolbar */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border-b border-gray-100">
                    
                    {/* Modern Tabs */}
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

                {/* Filters */}
                {viewMode !== 'calendar' && (
                    <TasksFilter filters={filters} setFilters={setFilters} />
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white p-0">
                    {/* LIST or MINE view */}
                    {(viewMode === 'list' || viewMode === 'mine') && (
                        <div>
                             {/* Active Section */}
                             <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-20">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Queue ({activeTasks.length})</h3>
                             </div>
                             
                             <ClientTaskTable 
                                tasks={activeTasks} 
                                onEdit={handleEdit} 
                                onDelete={(id) => setDeleteId(id)} 
                                onStatusChange={handleStatusChange}
                                onToggleVisibility={handleToggleVisibility}
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
                                                onDelete={(id) => setDeleteId(id)} 
                                                onStatusChange={handleStatusChange}
                                                onToggleVisibility={handleToggleVisibility}
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
