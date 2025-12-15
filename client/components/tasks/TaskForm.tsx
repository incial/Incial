
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User as UserIcon, AlignLeft, Flag, CheckCircle, History, Link as LinkIcon, ExternalLink, Edit2, Clock, Building, Maximize2, Minimize2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, User } from '../../types';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomSelect } from '../ui/CustomSelect';
import { UserSelect } from '../ui/UserSelect';
import { formatDate, formatDateTime } from '../../utils';
import { usersApi } from '../../services/api';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  companyMap?: Record<number, string>;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'In Review', 'Posted', 'Completed'];

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSubmit, initialData, companyMap }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
      const fetchUsers = async () => {
          try {
              const fetchedUsers = await usersApi.getAll();
              setUsers(fetchedUsers);
          } catch (e) {
              console.error("Failed to fetch assignees", e);
          }
      };
      if (isOpen) {
          fetchUsers();
      }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setMode('view');
      } else {
        // Use IST time for default date
        const today = new Date();
        const localIsoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(today);
        
        setFormData({
          title: '',
          description: '',
          status: 'Not Started',
          priority: 'Medium',
          assignedTo: 'Unassigned',
          dueDate: localIsoDate,
          taskLink: ''
        });
        setMode('edit');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit(formData);
    onClose();
  };

  const getPriorityColor = (p?: string) => {
      switch(p) {
          case 'High': return 'bg-red-50 text-red-700 border-red-100';
          case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
          case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
          default: return 'bg-gray-50 text-gray-700';
      }
  };

  const getStatusColor = (s?: string) => {
      switch(s) {
          case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
          case 'Posted': return 'bg-sky-100 text-sky-700 border-sky-200';
          case 'In Review': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
  };

  // --- RENDER VIEW MODE ---
  const renderView = () => (
      <div className="space-y-8">
          {/* Header Section */}
          <div>
              <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getPriorityColor(formData.priority)}`}>
                      {formData.priority} Priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(formData.status)}`}>
                      {formData.status}
                  </span>
                  {(formData.companyId && companyMap) && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          <Building className="h-3 w-3" />
                          {companyMap[formData.companyId]}
                      </span>
                  )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{formData.title}</h2>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <UserIcon className="h-3.5 w-3.5" /> Assignee
                  </p>
                  <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          {formData.assignedTo === 'Unassigned' || !formData.assignedTo ? '?' : formData.assignedTo?.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">{formData.assignedTo || 'Unassigned'}</span>
                  </div>
              </div>
              <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Due Date
                  </p>
                  <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">{formatDate(formData.dueDate || '')}</span>
                  </div>
              </div>
          </div>

          {/* Link Section */}
          {formData.taskLink && (
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <LinkIcon className="h-3.5 w-3.5" /> Attached Link
                  </h3>
                  <a 
                      href={formData.taskLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                      {formData.taskLink}
                      <ExternalLink className="h-3 w-3" />
                  </a>
              </div>
          )}

          {/* Description */}
          <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-gray-400" /> Description
                </h3>
                <button 
                    type="button" 
                    onClick={() => setIsDescriptionExpanded(true)}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                >
                    <Maximize2 className="h-3 w-3" /> Expand
                </button>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] shadow-sm">
                  {formData.description || <span className="text-gray-400 italic">No description provided.</span>}
              </div>
          </div>

          {/* Footer Metadata */}
          {formData.createdAt && (
               <div className="flex flex-col gap-1 pt-6 border-t border-gray-100 text-xs text-gray-400">
                    <p>Created on {new Date(formData.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    {formData.lastUpdatedBy && (
                        <p className="flex items-center gap-1">
                            <History className="h-3 w-3" /> 
                            Last updated by <span className="font-semibold">{formData.lastUpdatedBy}</span> 
                            on {formatDateTime(formData.lastUpdatedAt || '')}
                        </p>
                    )}
               </div>
          )}
      </div>
  );

  // --- RENDER EDIT MODE ---
  const renderEdit = () => (
      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Task Name</label>
              <input 
                type="text"
                required
                className="w-full text-lg font-semibold placeholder-gray-300 border-none focus:ring-0 p-0 text-gray-900 bg-transparent"
                placeholder="What needs to be done?"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                {/* Status */}
                <div>
                   <CustomSelect 
                        label="Status"
                        value={formData.status || ''}
                        onChange={(val) => setFormData({...formData, status: val as TaskStatus})}
                        options={STATUSES.map(s => ({ label: s, value: s }))}
                        placeholder="Select Status"
                   />
                </div>

                {/* Priority */}
                <div>
                   <CustomSelect 
                        label="Priority"
                        value={formData.priority || ''}
                        onChange={(val) => setFormData({...formData, priority: val as TaskPriority})}
                        options={PRIORITIES.map(p => ({ label: p, value: p }))}
                        placeholder="Select Priority"
                   />
                </div>

                {/* Assigned To - Using New UserSelect */}
                <div className="col-span-2 md:col-span-1">
                   <UserSelect 
                        label="Assignee"
                        value={formData.assignedTo || 'Unassigned'}
                        onChange={(val) => setFormData({...formData, assignedTo: val})}
                        users={users}
                        placeholder="Select Assignee"
                   />
                </div>

                {/* Due Date */}
                <div className="col-span-2 md:col-span-1">
                   <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Due Date
                   </label>
                   <div className="w-full">
                        <CustomDatePicker 
                            value={formData.dueDate || ''}
                            onChange={date => setFormData({...formData, dueDate: date})}
                            placeholder="Select Date"
                        />
                   </div>
                </div>
            </div>
            
            {/* Task Link Input */}
            <div>
                <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <LinkIcon className="h-4 w-4" /> Related Link
                </label>
                <input 
                    type="url"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-400"
                    placeholder="https://..."
                    value={formData.taskLink || ''}
                    onChange={e => setFormData({...formData, taskLink: e.target.value})}
                />
            </div>

            {/* Description */}
            <div>
                 <div className="flex items-center justify-between mb-2">
                     <label className="flex items-center gap-2 text-sm text-gray-500">
                        <AlignLeft className="h-4 w-4" /> Description
                     </label>
                     <button 
                        type="button" 
                        onClick={() => setIsDescriptionExpanded(true)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                    >
                        <Maximize2 className="h-3 w-3" /> Expand Editor
                    </button>
                 </div>
                 <textarea 
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:ring-2 focus:ring-brand-500 focus:outline-none h-32 resize-none shadow-sm"
                    placeholder="Add more details about this task..."
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                 />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={() => initialData ? setMode('view') : onClose()} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Save Task
                </button>
            </div>
      </form>
  );

  return (
    <>
        {/* Expanded Description Overlay */}
        {isDescriptionExpanded && (
            <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <AlignLeft className="h-5 w-5 text-gray-500" /> 
                        Description {mode === 'edit' ? '(Editing)' : ''}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsDescriptionExpanded(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                        >
                            <Minimize2 className="h-4 w-4" /> Done
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                    {mode === 'edit' ? (
                        <textarea 
                            className="w-full h-full p-4 text-base text-gray-800 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed"
                            placeholder="Type your detailed description here..."
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            autoFocus
                        />
                    ) : (
                        <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {formData.description || <span className="text-gray-400 italic">No description provided.</span>}
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-500">
                {mode === 'view' ? 'Task Details' : (initialData ? 'Edit Task' : 'New Task')}
            </h2>
            <div className="flex items-center gap-2">
                {mode === 'view' && (
                    <button 
                        onClick={() => setMode('edit')}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                        <Edit2 className="h-4 w-4" /> Edit
                    </button>
                )}
                <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
            </div>

            <div className="overflow-y-auto p-6 custom-scrollbar">
                {mode === 'view' ? renderView() : renderEdit()}
            </div>
        </div>
        </div>
    </>
  );
};
