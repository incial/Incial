
import React from 'react';
import { Task, TaskStatus } from '../../types';
import { getTaskPriorityStyles } from '../../utils';
import { MoreHorizontal, Plus, Calendar } from 'lucide-react';
import { formatDate } from '../../utils';

interface TasksKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

const KanbanColumn = ({ 
    title, 
    status, 
    tasks, 
    color,
    onEdit,
    onDrop
}: { 
    title: string, 
    status: TaskStatus, 
    tasks: Task[], 
    color: string,
    onEdit: (t: Task) => void,
    onDrop: (taskId: number, newStatus: TaskStatus) => void
}) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            onDrop(parseInt(taskId), status);
        }
    };

    return (
        <div 
            className="flex-1 min-w-[280px] bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
                    <span className="text-xs text-gray-400 font-medium ml-1">{tasks.length}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-10 custom-scrollbar">
                {tasks.map(task => (
                    <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("taskId", task.id.toString());
                            e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => onEdit(task)}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group active:cursor-grabbing"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTaskPriorityStyles(task.priority)}`}>
                                {task.priority}
                            </span>
                            <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{task.title}</h4>
                        {task.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                                <Calendar className="h-3 w-3" />
                                {formatDate(task.dueDate).split(',')[0]}
                            </div>
                            {task.assignedTo !== 'Unassigned' && (
                                <div className="h-6 w-6 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold flex items-center justify-center border border-brand-100">
                                    {task.assignedTo.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TasksKanban: React.FC<TasksKanbanProps> = ({ tasks, onEdit, onStatusChange }) => {
    
    const handleDrop = (taskId: number, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            onStatusChange(task, newStatus);
        }
    };

    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4 items-stretch px-2">
            <KanbanColumn 
                title="To Do" 
                status="Not Started" 
                color="bg-gray-400" 
                tasks={tasks.filter(t => t.status === 'Not Started')} 
                onEdit={onEdit}
                onDrop={handleDrop}
            />
            <KanbanColumn 
                title="In Progress" 
                status="In Progress" 
                color="bg-blue-500" 
                tasks={tasks.filter(t => t.status === 'In Progress')} 
                onEdit={onEdit}
                onDrop={handleDrop}
            />
            <KanbanColumn 
                title="In Review" 
                status="In Review" 
                color="bg-purple-500" 
                tasks={tasks.filter(t => t.status === 'In Review')} 
                onEdit={onEdit}
                onDrop={handleDrop}
            />
            <KanbanColumn 
                title="Posted" 
                status="Posted" 
                color="bg-sky-500" 
                tasks={tasks.filter(t => t.status === 'Posted')} 
                onEdit={onEdit}
                onDrop={handleDrop}
            />
            <KanbanColumn 
                title="Completed" 
                status="Completed" 
                color="bg-green-500" 
                tasks={tasks.filter(t => t.status === 'Completed' || t.status === 'Done')} 
                onEdit={onEdit}
                onDrop={handleDrop}
            />
        </div>
    );
};
