
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, crmApi, usersApi } from '../services/api';
import { Task, TaskFilterState, TaskPriority, TaskStatus } from '../types';
import { TasksTable } from '../components/tasks/TasksTable';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { Plus, LayoutList, Kanban, User, Archive, ChevronDown, ChevronRight, Activity, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { useToast } from '../context/ToastContext';

type ViewMode = 'list' | 'kanban' | 'mine';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isSidebarCollapsed } = useLayout();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<number, string>>({});
  const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<TaskFilterState>({ search: '', status: '', priority: '', assignedTo: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, crmData, usersData] = await Promise.all([tasksApi.getAll(), crmApi.getAll(), usersApi.getAll()]);
      setTasks(tasksData);
      const cMap: Record<number, string> = {};
      crmData.crmList.forEach(c => cMap[c.id] = c.company);
      setCompanyMap(cMap);
      const uMap: Record<string, string> = {};
      usersData.forEach(u => { if (u.avatarUrl) uMap[u.name] = u.avatarUrl; });
      setUserAvatarMap(uMap);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const isVisible = !t.companyId || t.isVisibleOnMainBoard;
      if (!isVisible && viewMode !== 'mine') return false; 
      const matchesSearch = (t.title || '').toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === '' || t.status === filters.status;
      const matchesPriority = filters.priority === '' || t.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === '' || t.assignedTo === filters.assignedTo;
      const matchesView = viewMode === 'mine' ? (user && t.assignedTo === user.name) : true;
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesView;
    });
  }, [tasks, filters, viewMode, user]);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = filteredTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
    const completed = filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
    return { activeTasks: active, completedTasks: completed };
  }, [filteredTasks]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateAt = (dateStr: string) => {
      setEditingTask({
          id: 0,
          title: '',
          status: 'Not Started',
          priority: 'Medium',
          dueDate: dateStr,
          assignedTo: user?.name || 'Unassigned',
          createdAt: new Date().toISOString(),
          companyId: undefined // Default to internal
      } as Task);
      setIsModalOpen(true);
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    try {
        if (data.id && data.id !== 0) {
            // Optimistic update for edits
            setTasks(prev => prev.map(t => t.id === data.id ? { ...t, ...data } as Task : t));
            
            await tasksApi.update(data.id, {
                ...data,
                lastUpdatedBy: user?.name || 'Unknown',
                lastUpdatedAt: new Date().toISOString()
            });
            showToast("Milestone synchronized", "success");
        } else {
            const newTask = await tasksApi.create({
                ...data,
                companyId: data.companyId || undefined, // Explicitly internal if not set
                isVisibleOnMainBoard: true // Main board tasks are always visible
            } as any);
            setTasks(prev => [...prev, newTask]);
            showToast("Internal milestone created", "success");
        }
    } catch (e) {
        showToast("Operation failed", "error");
        fetchData(); // Revert/Reload on error
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus, lastUpdatedAt: new Date().toISOString() } : t));
    
    try {
      await tasksApi.update(task.id, { 
        status: newStatus,
        lastUpdatedBy: user?.name || 'Unknown',
        lastUpdatedAt: new Date().toISOString()
      });
      // Silent success for smoother Kanban flow
    } catch (e) { 
        console.error(e);
        showToast("Status update failed", "error");
        setTasks(previousTasks); // Revert
    }
  };

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
      const previousTasks = [...tasks];
      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: newPriority, lastUpdatedAt: new Date().toISOString() } : t));

      try {
          await tasksApi.update(task.id, { 
              priority: newPriority,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          });
          showToast(`Priority updated to ${newPriority}`, "success");
      } catch (e) { 
          console.error(e);
          showToast("Priority update failed", "error");
          setTasks(previousTasks); // Revert
      }
  };

  return (
    <div className="flex min-h-screen mesh-bg relative">
      <div className="glass-canvas" />
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}`}>
        <Navbar />
        
        <div className="flex-1 px-4 lg:px-12 py-6 lg:py-10 pb-32">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 lg:gap-10 mb-10 lg:mb-16 animate-premium">
             <div>
                <div className="flex items-center gap-3 mb-2 lg:mb-4">
                     <div className="h-2 lg:h-2.5 w-2 lg:w-2.5 rounded-full bg-brand-500 animate-pulse" />
                     <span className="text-[9px] lg:text-[11px] font-black text-brand-600 uppercase tracking-[0.5em]">Global Task Nexus</span>
                </div>
                <h1 className="text-4xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none display-text">Workflow.</h1>
                <p className="text-slate-500 text-sm lg:text-xl mt-4 lg:mt-6 font-medium max-w-xl">Synchronizing strategic objectives and delivery milestones across nodes.</p>
             </div>
             
             <button 
                onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }} 
                className="bg-slate-950 hover:bg-slate-900 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-2xl lg:rounded-[2rem] flex items-center justify-center gap-3 lg:gap-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all group w-full sm:w-auto text-xs lg:text-sm"
             >
                <Plus className="h-5 w-5 lg:h-6 lg:w-6 text-brand-400 group-hover:rotate-90 transition-transform duration-300" /> New Milestone
             </button>
          </div>

          <div className="bg-white/30 backdrop-blur-3xl rounded-[2rem] lg:rounded-[3.5rem] border border-white/60 shadow-2xl flex flex-col mb-12 overflow-hidden">
            <div className="flex items-center gap-1.5 p-2 lg:p-3 border-b border-white/40 bg-white/20 overflow-x-auto no-scrollbar">
                {[
                    { id: 'list', label: 'Milestones', icon: LayoutList },
                    { id: 'kanban', label: 'Strategic Board', icon: Kanban },
                    { id: 'mine', label: 'My Focus', icon: User },
                ].map((view) => (
                    <button 
                        key={view.id} 
                        onClick={() => setViewMode(view.id as ViewMode)} 
                        className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-[9px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            viewMode === view.id 
                            ? 'bg-white text-brand-700 shadow-xl ring-1 ring-black/5' 
                            : 'text-slate-400 hover:text-slate-700 hover:bg-white/40'
                        }`}
                    >
                        <view.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> {view.label}
                    </button>
                ))}
            </div>

            <TasksFilter filters={filters} setFilters={setFilters} />

            <div className="pb-10 overflow-x-auto">
                {isLoading ? (
                    <div className="p-40 text-center flex flex-col items-center justify-center gap-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-[4px] border-slate-100 border-t-brand-600" />
                        <p className="text-slate-400 uppercase font-black tracking-[0.3em] text-xs animate-pulse">Scanning Operational Data...</p>
                    </div>
                ) : (
                    <>
                        {(viewMode === 'list' || viewMode === 'mine') && (
                            <div className="px-4 py-6">
                                <TasksTable 
                                    data={activeTasks} 
                                    companyMap={companyMap} 
                                    userAvatarMap={userAvatarMap} 
                                    onEdit={handleEdit} 
                                    onDelete={(id) => setDeleteId(id)}
                                    onStatusChange={handleStatusChange} 
                                    onPriorityChange={handlePriorityChange} 
                                />
                                
                                {completedTasks.length > 0 && (
                                    <div className="mt-12 border-t border-slate-950/5 px-2 lg:px-6">
                                        <button 
                                            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)} 
                                            className="w-full flex items-center gap-4 py-6 lg:py-8 hover:bg-white/40 transition-colors text-left rounded-[2rem] px-4 lg:px-8 group"
                                        >
                                            <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                                {isCompletedExpanded ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
                                            </div>
                                            <Archive className="h-6 w-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            <span className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Operational Archives ({completedTasks.length})</span>
                                        </button>
                                        
                                        {isCompletedExpanded && (
                                            <div className="animate-premium">
                                                <TasksTable 
                                                    data={completedTasks} 
                                                    companyMap={companyMap} 
                                                    userAvatarMap={userAvatarMap} 
                                                    onEdit={handleEdit} 
                                                    onDelete={(id) => setDeleteId(id)}
                                                    onStatusChange={handleStatusChange} 
                                                    onPriorityChange={handlePriorityChange} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {viewMode === 'kanban' && (
                            <div className="p-4 lg:p-8 h-[600px] lg:h-[700px] animate-premium overflow-x-auto">
                                <TasksKanban 
                                    tasks={filteredTasks} 
                                    userAvatarMap={userAvatarMap} 
                                    onEdit={handleEdit} 
                                    onStatusChange={handleStatusChange} 
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <div className="p-4 lg:p-8 border-t border-white/40 bg-white/20 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex justify-between rounded-b-[2rem] lg:rounded-b-[3.5rem]">
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-500" />
                    <span>System Index: Optimized</span>
                </div>
                <span>Sync Node: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <TaskForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveTask} 
        initialData={editingTask} 
        companyMap={companyMap}
        onDelete={(id) => {
            setIsModalOpen(false);
            setDeleteId(id);
        }}
      />
      
      <DeleteConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={async () => {
            if (!deleteId) return;
            try { 
                setTasks(prev => prev.filter(t => t.id !== deleteId)); // Optimistic delete
                await tasksApi.delete(deleteId); 
                showToast("Milestone purged from registry", "success");
            } catch (e) { 
                showToast("Purge action failed", "error");
                fetchData();
            }
            setDeleteId(null);
        }} 
        title="Archive Milestone" 
        message="Are you sure you want to permanently remove this objective from the tactical timeline?"
      />
    </div>
  );
};
    