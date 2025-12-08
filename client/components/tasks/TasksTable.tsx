
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDate, getTaskPriorityStyles, getTaskStatusStyles } from '../../utils';
import { Edit2, Trash2, ChevronDown, Calendar, Check, Building } from 'lucide-react';

interface TasksTableProps {
  data: Task[];
  companyMap?: Record<number, string>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onPriorityChange: (task: Task, newPriority: TaskPriority) => void;
}

const Avatar = ({ name }: { name: string }) => {
    const initials = name === 'Unassigned' ? '?' : name.slice(0, 2).toUpperCase();
    const bg = name === 'Unassigned' ? 'bg-gray-100 text-gray-400' : 'bg-brand-100 text-brand-700';
    return (
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${bg} border border-white shadow-sm`} title={name}>
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm transition-all hover:opacity-80 active:scale-95 ${getTaskStatusStyles(task.status)}`}
            >
                {task.status}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                                    task.status === opt ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                    opt === 'Completed' ? 'bg-green-500' : 
                                    opt === 'Posted' ? 'bg-sky-500' :
                                    opt === 'In Review' ? 'bg-purple-500' :
                                    opt === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                {opt}
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all hover:opacity-80 active:scale-95 ${getTaskPriorityStyles(task.priority)}`}
            >
                {task.priority}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onPriorityChange(task, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                                    task.priority === opt ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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


export const TasksTable: React.FC<TasksTableProps> = ({ data, companyMap, onEdit, onDelete, onStatusChange, onPriorityChange }) => {
  return (
    <div className="overflow-x-auto bg-white min-h-[400px] pb-32">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-1/4">Task Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.map(task => {
                    const clientName = (task.companyId && companyMap) ? companyMap[task.companyId] : null;
                    
                    return (
                    <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-3">
                            <button onClick={() => onEdit(task)} className="text-sm font-bold text-gray-800 hover:text-brand-600 hover:underline text-left truncate max-w-xs block">
                                {task.title}
                            </button>
                            {task.description && (
                                <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">{task.description}</p>
                            )}
                        </td>

                        {/* Client */}
                        <td className="px-6 py-3">
                            {clientName ? (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                    <Building className="h-3 w-3 text-gray-400" />
                                    {clientName}
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400 italic">Internal</span>
                            )}
                        </td>

                        {/* Status (Custom Dropdown) */}
                        <td className="px-6 py-3">
                            <StatusDropdown task={task} onStatusChange={onStatusChange} />
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-3">
                             <div className="flex items-center gap-2">
                                <Avatar name={task.assignedTo} />
                                <span className="text-xs font-medium text-gray-600">{task.assignedTo}</span>
                             </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs font-medium">{formatDate(task.dueDate)}</span>
                            </div>
                        </td>

                        {/* Priority (Custom Dropdown) */}
                        <td className="px-6 py-3">
                             <PriorityDropdown task={task} onPriorityChange={onPriorityChange} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                )})}
                {data.length === 0 && (
                     <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Check className="h-6 w-6 text-gray-300" />
                                </div>
                                <p>No tasks found. Create one to get started!</p>
                            </div>
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
