
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, meetingsApi, crmApi } from '../services/api';
import { Task, Meeting, TaskStatus, MeetingStatus } from '../types';
import { ChevronLeft, ChevronRight, CheckSquare, Video, Clock, Filter, Calendar, Briefcase, X, Plus, AlertCircle, MoreHorizontal, Target, Zap } from 'lucide-react';
import { TaskForm } from '../components/tasks/TaskForm';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

type CalendarItem = {
    id: string; // Composite ID
    dateStr: string; // YYYY-MM-DD (Local) for grouping
    sortTime: number; // For sorting within day
    title: string;
    type: 'task' | 'meeting';
    data: Task | Meeting;
    status: string;
    priority?: string; // For tasks
};

interface PopoverState {
    x: number;
    y: number;
    item: CalendarItem;
}

export const UniversalCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [companyMap, setCompanyMap] = useState<Record<number, string>>({});

    // Filter States
    const [showTasks, setShowTasks] = useState(true);
    const [showMeetings, setShowMeetings] = useState(true);

    // Interaction States
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null); // YYYY-MM-DD
    const [popover, setPopover] = useState<PopoverState | null>(null);
    const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);

    // Modal States
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tasksData, meetingsData, crmData] = await Promise.all([
                tasksApi.getAll(),
                meetingsApi.getAll(),
                crmApi.getAll()
            ]);

            // Build Company Map for Task Form & Tooltip
            const map: Record<number, string> = {};
            crmData.crmList.forEach(c => map[c.id] = c.company);
            setCompanyMap(map);

            const allItems: CalendarItem[] = [];

            // Process Tasks
            tasksData.forEach(t => {
                if (t.status !== 'Completed' && t.status !== 'Done') { 
                    allItems.push({
                        id: `task-${t.id}`,
                        dateStr: t.dueDate,
                        sortTime: 0,
                        title: t.title,
                        type: 'task',
                        data: t,
                        status: t.status,
                        priority: t.priority
                    });
                }
            });

            // Process Meetings
            meetingsData.forEach(m => {
                const mDate = new Date(m.dateTime);
                const localDateStr = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}-${String(mDate.getDate()).padStart(2, '0')}`;
                
                allItems.push({
                    id: `meeting-${m.id}`,
                    dateStr: localDateStr,
                    sortTime: mDate.getTime(),
                    title: m.title,
                    type: 'meeting',
                    data: m,
                    status: m.status
                });
            });

            setItems(allItems);
        } catch (e) {
            console.error("Failed to fetch calendar data", e);
            showToast("Failed to sync calendar", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleGlobalClick = () => setPopover(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    // --- Stats Calculation ---
    const monthlyStats = useMemo(() => {
        const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const monthItems = items.filter(i => i.dateStr.startsWith(currentMonthStr));
        
        return {
            total: monthItems.length,
            tasks: monthItems.filter(i => i.type === 'task').length,
            meetings: monthItems.filter(i => i.type === 'meeting').length
        };
    }, [items, currentDate]);

    // --- Actions ---
    
    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
        setPopover(null);
    };

    const handleMeetingClick = (meeting: Meeting) => {
        setEditingMeeting(meeting);
        setIsMeetingModalOpen(true);
        setPopover(null);
    };

    const handleCreateTaskForDate = (dateStr: string) => {
        setEditingTask({ 
            title: '', 
            status: 'Not Started', 
            priority: 'Medium', 
            assignedTo: user?.name || 'Unassigned',
            dueDate: dateStr 
        } as Task);
        setIsTaskModalOpen(true);
    };

    const handleCreateMeetingForDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const now = new Date();
        date.setHours(now.getHours() + 1, 0, 0, 0);
        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`;

        setEditingMeeting({
            title: '',
            status: 'Scheduled',
            dateTime: formatted
        } as Meeting);
        setIsMeetingModalOpen(true);
    };

    const handleItemClick = (e: React.MouseEvent, item: CalendarItem) => {
        e.stopPropagation(); 
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(rect.left, window.innerWidth - 340); 
        const y = Math.min(rect.bottom + 10, window.innerHeight - 300); 

        setPopover({ x: x > 0 ? x : 10, y, item });
    };

    const handleTaskSave = async (data: Partial<Task>) => {
        const auditData = {
            lastUpdatedBy: user?.name || 'Unknown',
            lastUpdatedAt: new Date().toISOString()
        };
        const finalData = { ...data, ...auditData };

        try {
            if (editingTask && editingTask.id) {
                await tasksApi.update(editingTask.id, finalData);
                showToast("Task updated", "success");
            } else {
                await tasksApi.create(finalData as Task);
                showToast("Task created", "success");
            }
            fetchData();
        } catch(e) {
            showToast("Operation failed", "error");
        }
    };

    const handleMeetingSave = async (data: Partial<Meeting>) => {
        const auditData = {
            lastUpdatedBy: user?.name || 'Unknown',
            lastUpdatedAt: new Date().toISOString()
        };
        const finalData = { ...data, ...auditData };

        try {
            if (editingMeeting && editingMeeting.id) {
                await meetingsApi.update(editingMeeting.id, finalData);
                showToast("Meeting updated", "success");
            } else {
                await meetingsApi.create(finalData as Meeting);
                showToast("Meeting scheduled", "success");
            }
            fetchData();
        } catch(e) {
            showToast("Operation failed", "error");
        }
    };

    // --- Drag & Drop Logic ---

    const handleDragStart = (e: React.DragEvent, item: CalendarItem) => {
        setDraggedItem(item);
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
        // Create a transparent drag image if needed, usually browser default is fine
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, dateStr: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.dateStr === dateStr) return;

        const newItem = { ...draggedItem, dateStr };
        // Optimistic UI Update
        setItems(prev => prev.map(i => i.id === newItem.id ? newItem : i));

        try {
            if (newItem.type === 'task') {
                await tasksApi.update(newItem.data.id, { 
                    dueDate: dateStr,
                    lastUpdatedBy: user?.name,
                    lastUpdatedAt: new Date().toISOString()
                });
                showToast(`Task moved to ${dateStr}`, "success");
            } else {
                // For meetings, we need to preserve the time but change the date
                const oldDate = new Date((newItem.data as Meeting).dateTime);
                const [y, m, d] = dateStr.split('-').map(Number);
                const newDate = new Date(y, m - 1, d, oldDate.getHours(), oldDate.getMinutes());
                
                // Construct ISO String manually to avoid UTC shifts if using toISOString directly sometimes
                const pad = (n: number) => n.toString().padStart(2, '0');
                const isoStr = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(newDate.getMinutes())}:00`;

                await meetingsApi.update(newItem.data.id, { 
                    dateTime: isoStr,
                    lastUpdatedBy: user?.name,
                    lastUpdatedAt: new Date().toISOString()
                });
                showToast(`Meeting rescheduled to ${dateStr}`, "success");
            }
        } catch (e) {
            console.error("Drop update failed", e);
            showToast("Failed to move item", "error");
            fetchData(); // Revert
        } finally {
            setDraggedItem(null);
        }
    };

    // --- Calendar Render Logic ---

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const jumpToToday = () => setCurrentDate(new Date());

    const renderCells = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const cells = [];

        // Empty cells
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-gray-50/10 border-b border-r border-gray-100 min-h-[140px]" />);
        }

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const dayItems = items.filter(item => {
                const matchesType = (item.type === 'task' && showTasks) || (item.type === 'meeting' && showMeetings);
                return item.dateStr === dateStr && matchesType;
            });

            dayItems.sort((a, b) => a.sortTime - b.sortTime);

            const isToday = todayStr === dateStr;
            const isSelected = selectedDateStr === dateStr;

            cells.push(
                <div 
                    key={day} 
                    onClick={() => setSelectedDateStr(dateStr)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                    className={`border-b border-r border-gray-100 min-h-[140px] p-2 transition-all duration-200 group cursor-pointer relative flex flex-col ${
                        isToday ? 'bg-blue-50/20' : isSelected ? 'bg-brand-50/50' : 'hover:bg-gray-50/50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                            isToday 
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                            : 'text-gray-700 group-hover:bg-white group-hover:shadow-sm'
                        }`}>
                            {day}
                        </div>
                        {/* Hover Quick Add */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCreateTaskForDate(dateStr); }}
                                className="p-1 rounded-lg hover:bg-blue-100 text-blue-600"
                                title="Add Task"
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCreateMeetingForDate(dateStr); }}
                                className="p-1 rounded-lg hover:bg-purple-100 text-purple-600"
                                title="Add Meeting"
                            >
                                <Video className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 flex-1 overflow-hidden">
                        {dayItems.slice(0, 4).map(item => (
                            <div 
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onClick={(e) => handleItemClick(e, item)}
                                className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10px] shadow-sm transition-all hover:shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-grab active:cursor-grabbing ${
                                    item.type === 'task' 
                                    ? 'bg-white border-blue-100 text-blue-800 hover:border-blue-300' 
                                    : 'bg-gradient-to-r from-purple-50 to-white border-purple-100 text-purple-800 hover:border-purple-300'
                                }`}
                            >
                                {item.type === 'task' ? (
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.priority === 'High' ? 'bg-red-500' : 'bg-blue-400'}`} />
                                ) : (
                                    <Video className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                )}
                                
                                <span className="font-bold truncate flex-1">{item.title}</span>
                                
                                {item.type === 'meeting' && (
                                    <span className="text-[9px] opacity-70 font-mono">
                                        {new Date((item.data as Meeting).dateTime).toLocaleTimeString('en-IN', {hour: 'numeric', hour12: true, timeZone: 'Asia/Kolkata'}).replace(/\s[AP]M/, '')}
                                    </span>
                                )}
                            </div>
                        ))}
                        {dayItems.length > 4 && (
                            <div className="text-[10px] text-gray-400 font-bold pl-1">+{dayItems.length - 4} more</div>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    // Helper to get day name for agenda
    const getSelectedDateDisplay = () => {
        if (!selectedDateStr) return { weekday: '', full: '' };
        const [y, m, d] = selectedDateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return {
            weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
            full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
    };

    const getAgendaItems = () => {
        if (!selectedDateStr) return [];
        return items.filter(i => i.dateStr === selectedDateStr).sort((a, b) => a.sortTime - b.sortTime);
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 relative">
                <Navbar />
                
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] flex flex-col">
                    
                    {/* Premium Header */}
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-6 w-full xl:w-auto">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Calendar</h1>
                                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> {monthlyStats.tasks} Tasks</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {monthlyStats.meetings} Meetings</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronLeft className="h-5 w-5" /></button>
                                <span className="px-4 text-sm font-bold text-gray-900 min-w-[140px] text-center">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"><ChevronRight className="h-5 w-5" /></button>
                            </div>

                            <button 
                                onClick={jumpToToday}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors shadow-sm"
                            >
                                Today
                            </button>

                            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowMeetings(!showMeetings)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        showMeetings 
                                        ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-inner' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <Video className="h-3.5 w-3.5" /> Calls
                                </button>
                                <button 
                                    onClick={() => setShowTasks(!showTasks)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                        showTasks 
                                        ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-inner' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <CheckSquare className="h-3.5 w-3.5" /> Tasks
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col flex-1 overflow-hidden">
                        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                            {isLoading ? (
                                <div className="col-span-7 flex flex-col items-center justify-center h-full gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-brand-600" />
                                    <p className="text-gray-400 text-sm font-medium animate-pulse">Syncing Calendar...</p>
                                </div>
                            ) : renderCells()}
                        </div>
                    </div>
                </main>

                {/* Day Agenda Drawer */}
                {selectedDateStr && (
                    <div 
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedDateStr(null)}
                    >
                        <div 
                            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{getSelectedDateDisplay().weekday}</h2>
                                    <p className="text-gray-500 font-medium mt-1">{getSelectedDateDisplay().full}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDateStr(null)} 
                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-6 grid grid-cols-2 gap-4 border-b border-gray-100">
                                <button 
                                    onClick={() => handleCreateTaskForDate(selectedDateStr)}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 hover:scale-[1.02] transition-all border border-blue-100"
                                >
                                    <CheckSquare className="h-6 w-6" /> 
                                    Add Task
                                </button>
                                <button 
                                    onClick={() => handleCreateMeetingForDate(selectedDateStr)}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 hover:scale-[1.02] transition-all border border-purple-100"
                                >
                                    <Video className="h-6 w-6" /> 
                                    Schedule Call
                                </button>
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                                {getAgendaItems().length > 0 ? (
                                    getAgendaItems().map((item, idx) => (
                                        <div key={item.id} className="relative pl-8 border-l-2 border-dashed border-gray-200 last:border-0 pb-6 last:pb-0 group">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ring-2 ${item.type === 'meeting' ? 'bg-purple-500 ring-purple-100' : 'bg-blue-500 ring-blue-100'} transition-all group-hover:scale-125`}></div>
                                            
                                            <div 
                                                onClick={() => item.type === 'task' ? handleTaskClick(item.data as Task) : handleMeetingClick(item.data as Meeting)}
                                                className="cursor-pointer group-item"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
                                                        {item.type === 'meeting' 
                                                            ? new Date((item.data as Meeting).dateTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Kolkata'})
                                                            : 'ALL DAY'
                                                        }
                                                    </span>
                                                </div>
                                                
                                                <div className={`p-4 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 ${
                                                    item.type === 'meeting' ? 'bg-purple-50/30 border-purple-100' : 'bg-white border-gray-100 shadow-sm'
                                                }`}>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-gray-800 text-sm leading-snug">{item.title}</h4>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    
                                                    {item.type === 'meeting' && (item.data as Meeting).meetingLink && (
                                                        <div className="text-xs text-purple-600 font-medium truncate mt-2 bg-white px-2 py-1 rounded-md border border-purple-100 w-fit">
                                                            video link attached
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/50">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                            item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                        {item.type === 'task' && companyMap[(item.data as Task).companyId!] && (
                                                            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                                <Briefcase className="h-3 w-3" />
                                                                {companyMap[(item.data as Task).companyId!]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Calendar className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <p className="font-bold text-gray-900">No events scheduled</p>
                                        <p className="text-xs mt-1">Enjoy your free time or plan ahead!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Popover */}
                {popover && !selectedDateStr && (
                    <div 
                        className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-80 animate-in fade-in zoom-in-95 duration-200"
                        style={{ left: popover.x, top: popover.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setPopover(null)} 
                            className="absolute top-3 right-3 p-1 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3.5 rounded-2xl flex-shrink-0 shadow-sm ${popover.item.type === 'task' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {popover.item.type === 'task' ? <CheckSquare className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                            </div>
                            <div>
                                <span className={`inline-flex mb-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                    popover.item.type === 'task' 
                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                    : 'bg-purple-50 text-purple-700 border-purple-100'
                                }`}>
                                    {popover.item.type}
                                </span>
                                <h4 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{popover.item.title}</h4>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-5 border border-gray-100">
                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-bold font-mono">
                                    {popover.item.dateStr}
                                </span>
                                {popover.item.type === 'meeting' && (
                                    <span className="text-gray-500 font-medium">• {new Date((popover.item.data as Meeting).dateTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Kolkata'})}</span>
                                )}
                            </div>
                            
                            {popover.item.type === 'task' && (popover.item.data as Task).companyId && companyMap[(popover.item.data as Task).companyId!] && (
                                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium truncate max-w-[200px]">
                                        {companyMap[(popover.item.data as Task).companyId!]}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                <Target className="h-4 w-4 text-gray-400" />
                                <span className="font-medium capitalize">{popover.item.status}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                if (popover.item.type === 'task') handleTaskClick(popover.item.data as Task);
                                else handleMeetingClick(popover.item.data as Meeting);
                            }}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-gray-200 active:scale-95"
                        >
                            Open Details
                        </button>
                    </div>
                )}
            </div>

            <TaskForm 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSubmit={handleTaskSave}
                initialData={editingTask}
                companyMap={companyMap}
            />

            <MeetingForm 
                isOpen={isMeetingModalOpen} 
                onClose={() => setIsMeetingModalOpen(false)} 
                onSubmit={handleMeetingSave}
                initialData={editingMeeting}
            />
        </div>
    );
};
