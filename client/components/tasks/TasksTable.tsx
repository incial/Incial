
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDate, getTaskPriorityStyles, getTaskStatusStyles, isRecentlyUpdated } from '../../utils';
import { Edit2, Trash2, ChevronDown, Calendar, Check, Building, Layout } from 'lucide-react';

interface TasksTableProps {
  data: Task[];
  companyMap?: Record<number, string>;
  userAvatarMap?: Record<string, string>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onPriorityChange: (task: Task, newPriority: TaskPriority) => void;
}

const Avatar = ({ name, url }: { name: string | null | undefined; url?: string }) => {
    const safeName = name || 'Unassigned';
    const initials = safeName === 'Unassigned' ? '?' : safeName.slice(0, 2).toUpperCase();
    
    if (url) {
        return (
            <img 
                src={url} 
                alt={safeName} 
                title={safeName}
                className="h-6 w-6 rounded-lg object-cover border border-white shadow-sm ring-1 ring-gray-100" 
            />
        );
    }

    const bg = safeName === 'Unassigned' ? 'bg-gray-100 text-gray-400' : 'bg-brand-50 text-brand-700';
    return (
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${bg} border border-white shadow-sm ring-1 ring-gray-100`} title={safeName}>
            {initials}
        </div>
    );
};

// --- Custom Status Dropdown ---
const StatusDropdown = ({ task, onStatusChange }: { task: Task; onStatusChange: (t: Task, s: TaskStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskStatus[] = ['Not Started', 'In Progress', 'In Review', 'Posted', 'Completed'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 ${getTaskStatusStyles(task.status)}`}
            >
                {task.status}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors ${
                                    task.status === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        opt === 'Completed' ? 'bg-green-500' : 
                                        opt === 'Posted' ? 'bg-sky-500' :
                                        opt === 'In Review' ? 'bg-purple-500' :
                                        opt === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`} />
                                    {opt}
                                </div>
                                {task.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Custom Priority Dropdown ---
const PriorityDropdown = ({ task, onPriorityChange }: { task: Task; onPriorityChange: (t: Task, p: TaskPriority) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskPriority[] = ['Low', 'Medium', 'High'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 uppercase tracking-wide ${getTaskPriorityStyles(task.priority)}`}
            >
                {task.priority}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onPriorityChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg text-left transition-colors uppercase tracking-wide ${
                                    task.priority === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {opt}
                                {task.priority === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export const TasksTable: React.FC<TasksTableProps> = ({ data, companyMap, userAvatarMap, onEdit, onDelete, onStatusChange, onPriorityChange }) => {
  return (
    <div className="overflow-x-auto bg-white min-h-[400px] pb-32">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Task Name</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.map(task => {
                    const clientName = (task.companyId && companyMap) ? companyMap[task.companyId] : null;
                    const isCompleted = (task.status === 'Completed' || task.status === 'Done');
                    const shouldAnimate = isCompleted && isRecentlyUpdated(task.lastUpdatedAt, 10);
                    const userAvatarUrl = task.assignedTo && userAvatarMap ? userAvatarMap[task.assignedTo] : undefined;

                    return (
                    <tr 
                        key={task.id} 
                        className={`group hover:bg-slate-50/50 transition-colors duration-200 ${shouldAnimate ? 'animate-task-complete' : ''}`}
                    >
                        {/* Name */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <button onClick={() => onEdit(task)} className="text-sm font-bold text-gray-900 hover:text-brand-600 transition-colors text-left truncate max-w-xs block leading-snug">
                                    {task.title}
                                </button>
                                {task.description && (
                                    <p className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5 font-medium">{task.description}</p>
                                )}
                            </div>
                        </td>

                        {/* Client */}
                        <td className="px-6 py-4">
                            {clientName ? (
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 w-fit">
                                    <Building className="h-3 w-3 text-gray-400" />
                                    <span className="truncate max-w-[120px]">{clientName}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-100">INTERNAL</span>
                            )}
                        </td>

                        {/* Status (Custom Dropdown) */}
                        <td className="px-6 py-4">
                            <StatusDropdown task={task} onStatusChange={onStatusChange} />
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <Avatar name={task.assignedTo} url={userAvatarUrl} />
                                <span className="text-xs font-semibold text-gray-600">{task.assignedTo || 'Unassigned'}</span>
                             </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs font-bold font-mono">{formatDate(task.dueDate)}</span>
                            </div>
                        </td>

                        {/* Priority (Custom Dropdown) */}
                        <td className="px-6 py-4">
                             <PriorityDropdown task={task} onPriorityChange={onPriorityChange} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                <button onClick={() => onEdit(task)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                )})}
                {data.length === 0 && (
                     <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-gray-400 text-sm">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="h-12 w-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">No tasks found. Create one to get started!</p>
                            </div>
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
