
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, crmApi } from '../services/api';
import { Task, TaskFilterState, TaskPriority, TaskStatus } from '../types';
import { TasksTable } from '../components/tasks/TasksTable';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckSquare, Plus, LayoutList, Kanban, Calendar as CalendarIcon, User, Archive, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type ViewMode = 'list' | 'kanban' | 'calendar' | 'mine';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companyMap, setCompanyMap] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Delete State
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
      const [tasksData, crmData] = await Promise.all([
          tasksApi.getAll(),
          crmApi.getAll()
      ]);
      
      setTasks(tasksData);
      
      // Build Company Map
      const map: Record<number, string> = {};
      crmData.crmList.forEach(c => {
          map[c.id] = c.company;
      });
      setCompanyMap(map);
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
      // 1. Core Visibility Logic:
      // Show if it's an internal task (no companyId) OR if it's explicitly pinned to Main Board
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

  // Split Active and Completed
  const { activeTasks, completedTasks } = useMemo(() => {
    const active = filteredTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done');
    const completed = filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Done');
    
    // Sort active by priority/date, sort completed by recent update
    active.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    completed.sort((a, b) => new Date(b.lastUpdatedAt || b.createdAt).getTime() - new Date(a.lastUpdatedAt || a.createdAt).getTime());

    return { activeTasks: active, completedTasks: completed };
  }, [filteredTasks]);

  // CRUD
  const handleCreate = () => {
      setEditingTask(undefined);
      setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
  };

  const handleRequestDelete = (id: number) => {
      setDeleteId(id);
  };

  const confirmDelete = async () => {
      if (!deleteId) return;
      const id = deleteId;
      
      // Optimistic
      setTasks(tasks.filter(t => t.id !== id));
      setDeleteId(null);
      
      try {
        await tasksApi.delete(id);
      } catch (e) {
        fetchData();
      }
  };

  const handleSave = async (data: Partial<Task>) => {
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
          fetchData();
      }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
      const updated = { 
          ...task, 
          status: newStatus,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { 
          status: newStatus,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      });
  };

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
      const updated = { 
          ...task, 
          priority: newPriority,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      await tasksApi.update(task.id, { 
          priority: newPriority,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      });
  };

  const itemToDeleteName = useMemo(() => {
      if (!deleteId) return '';
      const item = tasks.find(t => t.id === deleteId);
      return item ? item.title : '';
  }, [deleteId, tasks]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    Tasks Dashboard
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Manage your team's workload and track progress.</p>
             </div>
             
             <button 
                onClick={handleCreate}
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
             >
                <Plus className="h-5 w-5" />
                New Task
             </button>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
            
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 overflow-x-auto">
                {[
                    { id: 'list', label: 'All Tasks', icon: LayoutList },
                    { id: 'kanban', label: 'By Status', icon: Kanban },
                    { id: 'mine', label: 'My Tasks', icon: User },
                    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                ].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setViewMode(view.id as ViewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            viewMode === view.id 
                            ? 'bg-brand-50 text-brand-700' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        <view.icon className="h-4 w-4" />
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
                                            {isCompletedExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                                            <Archive className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                                Completed Archives ({completedTasks.length})
                                            </span>
                                        </button>
                                        
                                        {isCompletedExpanded && (
                                            <div className="bg-gray-50/30 opacity-75">
                                                 <TasksTable 
                                                    data={completedTasks} 
                                                    companyMap={companyMap}
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
            
            <div className="p-3 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
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
        itemName={itemToDeleteName}
      />
    </div>
  );
};
