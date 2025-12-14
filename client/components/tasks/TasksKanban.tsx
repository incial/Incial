
import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { getTaskPriorityStyles, isRecentlyUpdated, formatDate } from '../../utils';
import { MoreHorizontal, Plus, Calendar } from 'lucide-react';

interface TasksKanbanProps {
  tasks: Task[];
  userAvatarMap?: Record<string, string>;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  readOnly?: boolean; 
}

const KanbanColumn = ({ 
    title, 
    status, 
    tasks, 
    color,
    userAvatarMap,
    onEdit,
    onDrop,
    readOnly
}: { 
    title: string, 
    status: TaskStatus, 
    tasks: Task[], 
    color: string,
    userAvatarMap?: Record<string, string>,
    onEdit: (t: Task) => void,
    onDrop: (taskId: number, newStatus: TaskStatus) => void,
    readOnly?: boolean
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        if (!readOnly) {
            e.preventDefault();
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        if (!readOnly) {
            e.preventDefault();
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!readOnly) {
            e.preventDefault();
            // Prevent flickering when dragging over child elements
            if (e.currentTarget.contains(e.relatedTarget as Node)) {
                return;
            }
            setIsDragOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
            onDrop(parseInt(taskId), status);
        }
    };

    return (
        <div 
            className={`flex-1 min-w-[280px] rounded-2xl p-4 border flex flex-col h-full transition-all duration-200
                ${isDragOver 
                    ? 'bg-brand-50/50 border-brand-300 shadow-[inset_0_0_0_2px_rgba(37,99,235,0.1)] scale-[1.01]' 
                    : 'bg-gray-50/50 border-gray-100 shadow-sm'
                }
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
                    <span className="text-xs text-gray-400 font-medium ml-1">{tasks.length}</span>
                </div>
                {!readOnly && (
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className={`space-y-3 flex-1 overflow-y-auto pr-1 pb-10 custom-scrollbar transition-opacity duration-200 ${isDragOver ? 'opacity-90' : ''}`}>
                {tasks.map(task => {
                    const isCompleted = (task.status === 'Completed' || task.status === 'Done');
                    const shouldAnimate = isCompleted && isRecentlyUpdated(task.lastUpdatedAt, 10);
                    const userAvatarUrl = task.assignedTo && userAvatarMap ? userAvatarMap[task.assignedTo] : undefined;

                    return (
                    <div 
                        key={task.id}
                        draggable={!readOnly}
                        onDragStart={(e) => {
                            if (!readOnly) {
                                e.dataTransfer.setData("taskId", task.id.toString());
                                e.dataTransfer.effectAllowed = "move";
                            }
                        }}
                        onClick={() => !readOnly && onEdit(task)}
                        className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all group 
                            ${!readOnly ? 'hover:shadow-md cursor-pointer active:cursor-grabbing hover:-translate-y-1' : 'cursor-default'}
                            ${shouldAnimate ? 'animate-task-complete ring-2 ring-green-100' : ''}
                        `}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTaskPriorityStyles(task.priority)}`}>
                                {task.priority}
                            </span>
                            {!readOnly && (
                                <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            )}
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
                                <>
                                    {userAvatarUrl ? (
                                        <img src={userAvatarUrl} alt={task.assignedTo} className="h-6 w-6 rounded-full object-cover border border-gray-100" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-brand-50 text-brand-600 text-[10px] font-bold flex items-center justify-center border border-brand-100">
                                            {task.assignedTo?.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )})}
                
                {/* Visual placeholder when dragging over empty column or simply to indicate drop area at bottom */}
                {isDragOver && (
                    <div className="h-20 border-2 border-dashed border-brand-300/50 rounded-xl bg-brand-50/30 flex items-center justify-center text-brand-400 text-xs font-bold animate-pulse">
                        Drop to move here
                    </div>
                )}
            </div>
        </div>
    );
};

export const TasksKanban: React.FC<TasksKanbanProps> = ({ tasks, userAvatarMap, onEdit, onStatusChange, readOnly = false }) => {
    
    const handleDrop = (taskId: number, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            onStatusChange(task, newStatus);
        }
    };

    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4 items-stretch px-2 snap-x">
            <KanbanColumn 
                title="To Do" 
                status="Not Started" 
                color="bg-gray-400" 
                tasks={tasks.filter(t => t.status === 'Not Started')} 
                userAvatarMap={userAvatarMap}
                onEdit={onEdit}
                onDrop={handleDrop}
                readOnly={readOnly}
            />
            <KanbanColumn 
                title="In Progress" 
                status="In Progress" 
                color="bg-blue-500" 
                tasks={tasks.filter(t => t.status === 'In Progress')} 
                userAvatarMap={userAvatarMap}
                onEdit={onEdit}
                onDrop={handleDrop}
                readOnly={readOnly}
            />
            <KanbanColumn 
                title="In Review" 
                status="In Review" 
                color="bg-purple-500" 
                tasks={tasks.filter(t => t.status === 'In Review')} 
                userAvatarMap={userAvatarMap}
                onEdit={onEdit}
                onDrop={handleDrop}
                readOnly={readOnly}
            />
            <KanbanColumn 
                title="Posted" 
                status="Posted" 
                color="bg-sky-500" 
                tasks={tasks.filter(t => t.status === 'Posted')} 
                userAvatarMap={userAvatarMap}
                onEdit={onEdit}
                onDrop={handleDrop}
                readOnly={readOnly}
            />
            <KanbanColumn 
                title="Completed" 
                status="Completed" 
                color="bg-green-500" 
                tasks={tasks.filter(t => t.status === 'Completed' || t.status === 'Done')} 
                userAvatarMap={userAvatarMap}
                onEdit={onEdit}
                onDrop={handleDrop}
                readOnly={readOnly}
            />
        </div>
    );
};
