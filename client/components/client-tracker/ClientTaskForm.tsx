
import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, AlignLeft, Tag, Layers, Flag, Link as LinkIcon } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../types';

interface ClientTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
  initialData?: Task;
  companyId: number;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];
const TYPES: TaskType[] = ['General', 'Reel', 'Post', 'Story', 'Carousel', 'Video'];
const ASSIGNEES = ['Vallapata', 'John Doe', 'Demo User', 'Admin User', 'Employee User'];

export const ClientTaskForm: React.FC<ClientTaskFormProps> = ({ isOpen, onClose, onSubmit, initialData, companyId }) => {
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          companyId,
          title: '',
          status: 'Not Started',
          priority: 'Medium',
          taskType: 'General',
          assignedTo: 'Vallapata',
          dueDate: new Date().toISOString().split('T')[0],
          taskLink: ''
        });
      }
    }
  }, [isOpen, initialData, companyId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Client Task' : 'New Client Task'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[85vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Task Name</label>
              <input 
                type="text"
                required
                className="w-full text-lg font-semibold placeholder-gray-300 border-none focus:ring-0 p-0 text-gray-900"
                placeholder="e.g. Create Instagram Reel"
                value={formData.title || ''}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

             {/* Link Input */}
             <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input 
                    type="url"
                    className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-gray-400 text-gray-900"
                    placeholder="Attach Link (e.g. https://google.com)"
                    value={formData.taskLink || ''}
                    onChange={e => setFormData({...formData, taskLink: e.target.value})}
                />
             </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                 
                 <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Layers className="h-4 w-4" /> Content Type
                    </label>
                    <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        value={formData.taskType}
                        onChange={e => setFormData({...formData, taskType: e.target.value as TaskType})}
                    >
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Flag className="h-4 w-4" /> Priority
                    </label>
                    <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                    >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                 <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <User className="h-4 w-4" /> Assignee
                    </label>
                    <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        value={formData.assignedTo}
                        onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                    >
                        {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                 <div>
                    <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4" /> Due Date
                    </label>
                    <input 
                        type="date"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        value={formData.dueDate || ''}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                    Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Save Task
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
