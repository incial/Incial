
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../types';
import { formatDate, isRecentlyUpdated } from '../../utils';
import { Edit2, Trash2, Paperclip, Check, ChevronDown, ExternalLink, Layout } from 'lucide-react';

interface ClientTaskTableProps {
  tasks: Task[];
  userAvatarMap?: Record<string, string>;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onToggleVisibility: (task: Task) => void;
  readOnly?: boolean;
}

// Helper to get consistent styles
const getStatusStyles = (status: string) => {
    switch(status) {
        case 'Done': 
        case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
        case 'Posted': return 'bg-sky-100 text-sky-700 border-sky-200';
        case 'In Review': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Dropped': 
        case 'drop': return 'bg-red-100 text-red-700 border-red-200';
        case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

// --- Custom Status Badge & Dropdown ---
const StatusDropdown = ({ task, onStatusChange }: { task: Task; onStatusChange: (t: Task, s: TaskStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: TaskStatus[] = ['Not Started', 'In Progress', 'In Review', 'Posted', 'Done', 'Dropped'];

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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm transition-all hover:opacity-90 active:scale-95 whitespace-nowrap ${getStatusStyles(task.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {task.status === 'drop' as any ? 'Dropped' : task.status}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(task, opt); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-between group ${task.status === opt ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
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
    if (!type || type === 'General') return <span className="text-gray-300 text-xs font-medium italic">-</span>;
    return (
        <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-bold uppercase tracking-wide border border-violet-100">
            {type}
        </span>
    );
};

export const ClientTaskTable: React.FC<ClientTaskTableProps> = ({ tasks, userAvatarMap, onEdit, onDelete, onStatusChange, onToggleVisibility, readOnly = false }) => {
  return (
    <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-white z-10 w-64">Task name</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Status</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Assign</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Type</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Due date</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-32">Priority</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-20">Link</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-28">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {tasks.map(task => {
                    const isCompleted = (task.status === 'Completed' || task.status === 'Done');
                    const shouldAnimate = isCompleted && isRecentlyUpdated(task.lastUpdatedAt, 10);
                    const userAvatarUrl = task.assignedTo && userAvatarMap ? userAvatarMap[task.assignedTo] : undefined;

                    return (
                    <tr 
                        key={task.id} 
                        className={`group hover:bg-slate-50/50 transition-all duration-200 ${shouldAnimate ? 'animate-task-complete' : ''}`}
                    >
                        {/* Task Name */}
                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors border-r border-transparent group-hover:border-gray-100 z-10">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => !readOnly && onEdit(task)} 
                                        className={`text-sm font-bold text-gray-900 text-left truncate max-w-[180px] ${!readOnly ? 'hover:text-brand-600 hover:underline' : 'cursor-default'}`}
                                    >
                                        {task.title}
                                    </button>
                                    {task.isVisibleOnMainBoard && !readOnly && (
                                        <div className="flex-shrink-0" title="Visible on Main Dashboard">
                                             <span className="inline-flex items-center justify-center p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                                <Layout className="h-3 w-3" />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                            {readOnly ? (
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-sm w-fit ${getStatusStyles(task.status)}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                    {task.status === 'drop' as any ? 'Dropped' : task.status}
                                </span>
                            ) : (
                                <StatusDropdown task={task} onStatusChange={onStatusChange} />
                            )}
                        </td>

                        {/* Assign */}
                        <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                {userAvatarUrl ? (
                                    <img src={userAvatarUrl} alt={task.assignedTo || 'Assignee'} className="h-6 w-6 rounded-lg object-cover border border-white shadow-sm ring-1 ring-gray-100" />
                                ) : (
                                    <div className="h-6 w-6 rounded-lg bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                        {(task.assignedTo && task.assignedTo !== 'Unassigned') ? task.assignedTo.charAt(0) : '?'}
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-gray-600 truncate max-w-[100px]">
                                    {task.assignedTo === 'Vallapata' ? 'Athul' : (task.assignedTo ? task.assignedTo.split(' ')[0] : 'Unassigned')}
                                </span>
                             </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                             <TypeBadge type={task.taskType} />
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-500 font-mono">{formatDate(task.dueDate)}</span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4">
                            <PriorityBadge priority={task.priority} />
                        </td>

                        {/* Attachments / Link */}
                        <td className="px-6 py-4 text-center">
                             {task.taskLink ? (
                                <a 
                                    href={task.taskLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg inline-flex transition-colors border border-blue-100"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                             ) : (
                                 <span className="text-gray-300">-</span>
                             )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                             {!readOnly && (
                                 <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                    <button 
                                        onClick={() => onToggleVisibility(task)} 
                                        className={`p-2 rounded-lg transition-colors ${task.isVisibleOnMainBoard ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`} 
                                        title={task.isVisibleOnMainBoard ? "Remove from Main Dashboard" : "Move to Main Dashboard"}
                                    >
                                        <Layout className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => onEdit(task)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                 </div>
                             )}
                        </td>
                    </tr>
                )})}
                {tasks.length === 0 && (
                     <tr>
                        <td colSpan={8} className="px-6 py-16 text-center text-gray-400 text-sm">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                                    <Paperclip className="h-5 w-5 text-gray-300" />
                                </div>
                                <p className="font-medium">No tasks found for this client. Create one to get started.</p>
                            </div>
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
