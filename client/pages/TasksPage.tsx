
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, crmApi, usersApi } from '../services/api';
import { Task, TaskFilterState, TaskPriority, TaskStatus } from '../types';
import { TasksTable } from '../components/tasks/TasksTable';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckSquare, Plus, LayoutList, Kanban, Calendar as CalendarIcon, User, Archive, ChevronDown, ChevronRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'mine';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<number, string>>({});
  const [userAvatarMap, setUserAvatarMap] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    status: '',
    priority: '',
    assignedTo: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, crmData, usersData] = await Promise.all([
          tasksApi.getAll(),
          crmApi.getAll(),
          usersApi.getAll()
      ]);
      setTasks(tasksData);
      
      const cMap: Record<number, string> = {};
      crmData.crmList.forEach(c => cMap[c.id] = c.company);
      setCompanyMap(cMap);

      const uMap: Record<string, string> = {};
      usersData.forEach(u => {
          if (u.avatarUrl) uMap[u.name] = u.avatarUrl;
      });
      setUserAvatarMap(uMap);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const isVisible = !t.companyId || t.isVisibleOnMainBoard;
      if (!isVisible) return false;

      const matchesSearch = t.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === '' || t.status === filters.status;
      const matchesPriority = filters.priority === '' || t.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === '' || t.assignedTo === filters.assignedTo;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    if (viewMode === 'mine' && user) {
        result = result.filter(t => t.assignedTo === user.name);
    }

    return result;
  }, [tasks, filters, viewMode, user]);

  const { activeTasks, completedTasks } = useMemo(() => {
    const active = filteredTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
    const completed = filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
    active.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    completed.sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt).getTime() - new Date(a.lastUpdatedAt || a.createdAt).getTime());
    return { activeTasks: active, completedTasks: completed };
  }, [filteredTasks]);

  // Task Velocity Stats
  const velocityStats = useMemo(() => {
      const highPriority = activeTasks.filter(t => t.priority === 'High').length;
      const dueToday = activeTasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length;
      return { highPriority, dueToday };
  }, [activeTasks]);

  // ... (CRUD handlers same as before) ...
  const handleCreate = () => { setEditingTask(undefined); setIsModalOpen(true); };
  const handleEdit = (task: Task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleRequestDelete = (id: number) => { setDeleteId(id); };
  const confirmDelete = async () => {
      if (!deleteId) return;
      const id = deleteId;
      setTasks(tasks.filter(t => t.id !== id));
      setDeleteId(null);
      try { await tasksApi.delete(id); } catch (e) { fetchData(); }
  };
  const handleSave = async (data: Partial<Task>) => {
      const auditData = { lastUpdatedBy: user?.name || 'Unknown', lastUpdatedAt: new Date().toISOString() };
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
      } catch(e) { fetchData(); }
  };
  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
      const updated = { ...task, status: newStatus, lastUpdatedBy: user?.name || 'Unknown', lastUpdatedAt: new Date().toISOString() };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { status: newStatus, lastUpdatedBy: user?.name || 'Unknown', lastUpdatedAt: new Date().toISOString() });
  };
  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
      const updated = { ...task, priority: newPriority, lastUpdatedBy: user?.name || 'Unknown', lastUpdatedAt: new Date().toISOString() };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { priority: newPriority, lastUpdatedBy: user?.name || 'Unknown', lastUpdatedAt: new Date().toISOString() });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          {/* Header & Stats Bar */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
             <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        Tasks Dashboard
                    </h1>
                    <button 
                        onClick={handleCreate}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        New Task
                    </button>
                </div>

                {/* Velocity Bar */}
                <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-full md:w-fit">
                    <div className="px-5 py-2 flex items-center gap-3 border-r border-gray-100">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Activity className="h-4 w-4" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active</span>
                            <span className="text-lg font-bold text-gray-900">{activeTasks.length}</span>
                        </div>
                    </div>
                    <div className="px-5 py-2 flex items-center gap-3 border-r border-gray-100">
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Zap className="h-4 w-4" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">High Priority</span>
                            <span className="text-lg font-bold text-gray-900">{velocityStats.highPriority}</span>
                        </div>
                    </div>
                    <div className="px-5 py-2 flex items-center gap-3">
                        <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 className="h-4 w-4" /></div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Done</span>
                            <span className="text-lg font-bold text-gray-900">{completedTasks.length}</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
            
            {/* View Switcher */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 overflow-x-auto bg-gray-50/30">
                {[
                    { id: 'list', label: 'All Tasks', icon: LayoutList },
                    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
                    { id: 'mine', label: 'My Tasks', icon: User },
                    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                ].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setViewMode(view.id as ViewMode)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                            viewMode === view.id 
                            ? 'bg-white text-brand-700 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <view.icon className="h-3.5 w-3.5" />
                        {view.label}
                    </button>
                ))}
            </div>

            {viewMode !== 'calendar' && (
                <TasksFilter filters={filters} setFilters={setFilters} />
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
                    </div>
                ) : (
                    <>
                        {(viewMode === 'list' || viewMode === 'mine') && (
                            <div>
                                <TasksTable 
                                    data={activeTasks} 
                                    companyMap={companyMap}
                                    userAvatarMap={userAvatarMap}
                                    onEdit={handleEdit} 
                                    onDelete={handleRequestDelete}
                                    onStatusChange={handleStatusChange}
                                    onPriorityChange={handlePriorityChange}
                                />
                                
                                {completedTasks.length > 0 && (
                                    <div className="border-t border-gray-100">
                                        <button 
                                            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                                            className="w-full flex items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                        >
                                            <div className="p-1 rounded-md bg-gray-200 group-hover:bg-gray-300 transition-colors">
                                                {isCompletedExpanded ? <ChevronDown className="h-3 w-3 text-gray-600" /> : <ChevronRight className="h-3 w-3 text-gray-600" />}
                                            </div>
                                            <Archive className="h-4 w-4 text-gray-500" />
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                                Completed Archives ({completedTasks.length})
                                            </span>
                                        </button>
                                        
                                        {isCompletedExpanded && (
                                            <div className="bg-gray-50/30 opacity-75">
                                                 <TasksTable 
                                                    data={completedTasks} 
                                                    companyMap={companyMap}
                                                    userAvatarMap={userAvatarMap}
                                                    onEdit={handleEdit} 
                                                    onDelete={handleRequestDelete}
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
                            <div className="h-full p-6 bg-gray-50/30">
                                <TasksKanban 
                                    tasks={filteredTasks} 
                                    userAvatarMap={userAvatarMap}
                                    onEdit={handleEdit} 
                                    onStatusChange={handleStatusChange} 
                                />
                            </div>
                        )}
                        {viewMode === 'calendar' && (
                            <div className="h-full p-6">
                                <TasksCalendar tasks={filteredTasks} onEdit={handleEdit} />
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <div className="p-3 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between rounded-b-[2.5rem]">
                <span>{activeTasks.length} active · {completedTasks.length} completed</span>
                <span>Sorted by Priority & Date</span>
            </div>
          </div>
        </main>
      </div>

      <TaskForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingTask}
        companyMap={companyMap}
      />

      <DeleteConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
      />
    </div>
  );
};
