
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../types';
import { formatDate } from '../../utils';
import { Edit2, Trash2, Paperclip, Check, ChevronDown, ExternalLink } from 'lucide-react';

interface ClientTaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

// --- Custom Status Badge & Dropdown ---
const StatusDropdown = ({ task, onStatusChange }: { task: Task; onStatusChange: (t: Task, s: TaskStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskStatus[] = ['Not Started', 'In Progress', 'Done', 'Dropped'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStyles = (status: string) => {
        switch(status) {
            case 'Done': 
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Dropped': 
            case 'drop': return 'bg-red-100 text-red-700 border-red-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm transition-all hover:opacity-80 active:scale-95 whitespace-nowrap ${getStyles(task.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {task.status === 'drop' as any ? 'Dropped' : task.status}
                <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(task, opt); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between group ${task.status === opt ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {opt}
                                {task.status === opt && <Check className="h-3 w-3 text-brand-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
    let styles = "";
    if (priority === 'High') styles = "bg-red-50 text-red-700 border-red-100";
    else if (priority === 'Medium') styles = "bg-amber-50 text-amber-700 border-amber-100";
    else styles = "bg-emerald-50 text-emerald-700 border-emerald-100";

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
            {priority}
        </span>
    );
};

const TypeBadge = ({ type }: { type?: TaskType }) => {
    if (!type || type === 'General') return <span className="text-gray-300 text-xs">-</span>;
    return (
        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-200">
            {type}
        </span>
    );
};

export const ClientTaskTable: React.FC<ClientTaskTableProps> = ({ tasks, onEdit, onDelete, onStatusChange }) => {
  return (
    <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50/95 backdrop-blur-sm z-10 w-64">Task name</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32">Assign</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32">Type</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32">Due date</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-32">Priority</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center w-20">Link</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right w-20">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {tasks.map(task => (
                    <tr key={task.id} className="group hover:bg-gray-50/80 transition-all duration-200">
                        {/* Task Name */}
                        <td className="px-6 py-3 sticky left-0 bg-white group-hover:bg-gray-50/80 transition-all border-r border-transparent group-hover:border-gray-100 z-10">
                            <button 
                                onClick={() => onEdit(task)} 
                                className="text-sm font-bold text-gray-900 hover:text-brand-600 hover:underline text-left truncate max-w-[200px]"
                            >
                                {task.title}
                            </button>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3">
                            <StatusDropdown task={task} onStatusChange={onStatusChange} />
                        </td>

                        {/* Assign */}
                        <td className="px-6 py-3">
                             <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center text-[10px] font-bold">
                                    {task.assignedTo === 'Unassigned' ? '?' : task.assignedTo.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-600 font-medium truncate max-w-[100px]">
                                    {task.assignedTo === 'Vallapata' ? 'Athul' : task.assignedTo.split(' ')[0]}
                                </span>
                             </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-3">
                             <TypeBadge type={task.taskType} />
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-3">
                            <span className="text-sm text-gray-600 font-medium">{formatDate(task.dueDate)}</span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-3">
                            <PriorityBadge priority={task.priority} />
                        </td>

                        {/* Attachments / Link */}
                        <td className="px-6 py-3 text-center">
                             {task.taskLink ? (
                                <a 
                                    href={task.taskLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md inline-flex transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                             ) : (
                                 <span className="text-gray-300">-</span>
                             )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                ))}
                {tasks.length === 0 && (
                     <tr>
                        <td colSpan={8} className="px-6 py-16 text-center text-gray-400 text-sm">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
                                    <Paperclip className="h-5 w-5 text-gray-300" />
                                </div>
                                <p>No tasks found for this client. Create one to get started.</p>
                            </div>
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
