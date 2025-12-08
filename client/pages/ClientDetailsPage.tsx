
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useParams, Link } from 'react-router-dom';
import { crmApi, tasksApi } from '../services/api';
import { CRMEntry, Task, TaskStatus, TaskFilterState } from '../types';
import { ClientTaskTable } from '../components/client-tracker/ClientTaskTable';
import { ClientTaskForm } from '../components/client-tracker/ClientTaskForm';
import { TasksKanban } from '../components/tasks/TasksKanban';
import { TasksCalendar } from '../components/tasks/TasksCalendar';
import { TasksFilter } from '../components/tasks/TasksFilter';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CheckCircle, Plus, HardDrive, LayoutList, Calendar as CalendarIcon, User, Info, ArrowLeft, ExternalLink, Kanban } from 'lucide-react';
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

  const filteredTasks = useMemo(() => {
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

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  if (!client) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">Client not found</div>;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Breadcrumbs */}
           <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <Link to="/client-tracker" className="hover:text-brand-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back to Directory
                </Link>
                <span className="text-gray-300">/</span>
                <span className="font-semibold text-gray-900">{client.company}</span>
           </div>

           {/* Header Info */}
           <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
               <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                   <div>
                       <div className="flex items-center gap-3 mb-2">
                           <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                               <CheckCircle className="h-5 w-5 text-green-600" />
                           </div>
                           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.company}</h1>
                       </div>
                       <p className="text-gray-500 max-w-2xl pl-[52px]">
                            {client.notes || 'Manage tasks, content, and deliverables for this client.'}
                       </p>

                       <div className="pl-[52px] mt-4 flex flex-wrap gap-4 text-sm">
                           {client.driveLink && (
                               <a href={client.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                                    <HardDrive className="h-4 w-4" /> Drive Folder
                               </a>
                           )}
                           {client.socials?.website && (
                                <a href={client.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-brand-600 bg-gray-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-gray-100">
                                     <ExternalLink className="h-4 w-4" /> Website
                                </a>
                           )}
                       </div>
                   </div>
                   
                   <button 
                        onClick={handleCreate}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Create Task
                    </button>
               </div>
           </div>

           {/* Toolbar & Table Container */}
           <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden min-h-[500px]">
                
                {/* View Tabs */}
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

                {/* Filters */}
                {viewMode !== 'calendar' && (
                    <TasksFilter filters={filters} setFilters={setFilters} />
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-white p-0">
                    {/* LIST or MINE view */}
                    {(viewMode === 'list' || viewMode === 'mine') && (
                        <ClientTaskTable 
                            tasks={filteredTasks} 
                            onEdit={handleEdit} 
                            onDelete={(id) => setDeleteId(id)} 
                            onStatusChange={handleStatusChange}
                        />
                    )}

                    {/* KANBAN view */}
                    {viewMode === 'kanban' && (
                        <div className="h-full p-6 bg-gray-50/30">
                            <TasksKanban 
                                tasks={filteredTasks} 
                                onEdit={handleEdit} 
                                onStatusChange={handleStatusChange} 
                            />
                        </div>
                    )}

                    {/* CALENDAR view */}
                    {viewMode === 'calendar' && (
                        <div className="h-full p-6">
                            <TasksCalendar tasks={filteredTasks} onEdit={handleEdit} />
                        </div>
                    )}
                </div>
                
                <div className="p-3 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                    <span>{filteredTasks.length} tasks visible</span>
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
