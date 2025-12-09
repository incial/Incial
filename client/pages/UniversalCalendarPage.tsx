
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { tasksApi, meetingsApi, crmApi } from '../services/api';
import { Task, Meeting } from '../types';
import { ChevronLeft, ChevronRight, CheckSquare, Video, Clock, Filter, Calendar, Briefcase, X, Plus, AlertCircle } from 'lucide-react';
import { TaskForm } from '../components/tasks/TaskForm';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { useAuth } from '../context/AuthContext';

type CalendarItem = {
    id: string; // Composite ID
    date: Date;
    title: string;
    type: 'task' | 'meeting';
    data: Task | Meeting;
    status: string;
};

interface PopoverState {
    x: number;
    y: number;
    item: CalendarItem;
}

export const UniversalCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<CalendarItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [companyMap, setCompanyMap] = useState<Record<number, string>>({});

    // Filter States
    const [showTasks, setShowTasks] = useState(true);
    const [showMeetings, setShowMeetings] = useState(true);

    // Interaction States
    const [selectedDate, setSelectedDate] = useState<Date | null>(null); // For Agenda Drawer
    const [popover, setPopover] = useState<PopoverState | null>(null);

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
                        date: new Date(t.dueDate),
                        title: t.title,
                        type: 'task',
                        data: t,
                        status: t.status
                    });
                }
            });

            // Process Meetings
            meetingsData.forEach(m => {
                allItems.push({
                    id: `meeting-${m.id}`,
                    date: new Date(m.dateTime),
                    title: m.title,
                    type: 'meeting',
                    data: m,
                    status: m.status
                });
            });

            setItems(allItems);
        } catch (e) {
            console.error("Failed to fetch calendar data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Global click listener to close popover
        const handleGlobalClick = () => setPopover(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    // --- Actions ---
    
    const handleTaskClick = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
        setPopover(null);
        // Do NOT close selectedDate to keep context if opened from drawer
    };

    const handleMeetingClick = (meeting: Meeting) => {
        setEditingMeeting(meeting);
        setIsMeetingModalOpen(true);
        setPopover(null);
    };

    const handleCreateTaskForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        setEditingTask({ 
            title: '', 
            status: 'Not Started', 
            priority: 'Medium', 
            assignedTo: user?.name || 'Unassigned',
            dueDate: dateStr 
        } as Task);
        setIsTaskModalOpen(true);
    };

    const handleCreateMeetingForDate = (date: Date) => {
        // Set time to current time but on selected date
        const now = new Date();
        const meetingDate = new Date(date);
        meetingDate.setHours(now.getHours() + 1, 0, 0, 0);
        
        // Adjust for timezone offset for input[type="datetime-local"]
        meetingDate.setMinutes(meetingDate.getMinutes() - meetingDate.getTimezoneOffset());

        setEditingMeeting({
            title: '',
            status: 'Scheduled',
            dateTime: meetingDate.toISOString().slice(0, 16)
        } as Meeting);
        setIsMeetingModalOpen(true);
    };

    const handleItemClick = (e: React.MouseEvent, item: CalendarItem) => {
        e.stopPropagation(); // Prevent opening agenda drawer
        const rect = e.currentTarget.getBoundingClientRect();
        
        const x = Math.min(rect.left, window.innerWidth - 320); 
        const y = Math.min(rect.bottom + 5, window.innerHeight - 250); 

        setPopover({
            x: x > 0 ? x : 10,
            y: y,
            item
        });
    };

    const handleTaskSave = async (data: Partial<Task>) => {
        const auditData = {
            lastUpdatedBy: user?.name || 'Unknown',
            lastUpdatedAt: new Date().toISOString()
        };
        const finalData = { ...data, ...auditData };

        if (editingTask && editingTask.id) {
            await tasksApi.update(editingTask.id, finalData);
        } else {
            await tasksApi.create(finalData as Task);
        }
        fetchData();
    };

    const handleMeetingSave = async (data: Partial<Meeting>) => {
        const auditData = {
            lastUpdatedBy: user?.name || 'Unknown',
            lastUpdatedAt: new Date().toISOString()
        };
        const finalData = { ...data, ...auditData };

        if (editingMeeting && editingMeeting.id) {
            await meetingsApi.update(editingMeeting.id, finalData);
        } else {
            await meetingsApi.create(finalData as Meeting);
        }
        fetchData();
    };

    // --- Calendar Render Logic ---

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const renderCells = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const cells = [];

        // Empty cells
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-gray-50/20 border-b border-r border-gray-100 min-h-[140px]" />);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const dayItems = items.filter(item => {
                const itemDateStr = item.date.toISOString().split('T')[0];
                const matchesType = (item.type === 'task' && showTasks) || (item.type === 'meeting' && showMeetings);
                return itemDateStr === dateStr && matchesType;
            });

            dayItems.sort((a, b) => {
                if (a.type === 'meeting' && b.type === 'meeting') return a.date.getTime() - b.date.getTime();
                if (a.type === 'meeting') return -1;
                if (b.type === 'meeting') return 1;
                return 0;
            });

            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate?.toISOString().split('T')[0] === dateStr;

            cells.push(
                <div 
                    key={day} 
                    onClick={() => setSelectedDate(dateObj)}
                    className={`border-b border-r border-gray-100 min-h-[140px] p-2 transition-colors group cursor-pointer relative ${
                        isToday ? 'bg-indigo-50/30' : isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white shadow-md' : 'text-gray-500'}`}>
                            {day}
                        </span>
                        {/* Hover hint */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                            <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar pointer-events-none">
                        {dayItems.map(item => (
                            <button 
                                key={item.id}
                                onClick={(e) => handleItemClick(e, item)}
                                className={`w-full text-left p-1.5 rounded-md border text-[10px] shadow-sm transition-all hover:shadow-md hover:scale-[1.02] flex items-center gap-2 pointer-events-auto ${
                                    item.type === 'task' 
                                    ? 'bg-white border-blue-100 text-blue-800 hover:border-blue-300' 
                                    : 'bg-white border-purple-100 text-purple-800 hover:border-purple-300'
                                }`}
                            >
                                {item.type === 'task' ? <CheckSquare className="h-3 w-3 text-blue-500 flex-shrink-0" /> : <Video className="h-3 w-3 text-purple-500 flex-shrink-0" />}
                                
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold truncate">{item.title}</div>
                                    {item.type === 'meeting' && (
                                        <div className="text-[9px] opacity-70 font-medium flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return cells;
    };

    // Helper to get items for agenda view
    const getAgendaItems = () => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return items.filter(i => i.date.toISOString().split('T')[0] === dateStr).sort((a, b) => {
             // Sort meetings by time, tasks put at specific time or top
             if(a.type === 'meeting' && b.type === 'meeting') return a.date.getTime() - b.date.getTime();
             if(a.type === 'meeting') return 1; // Meetings at bottom typically or specific time
             if(b.type === 'meeting') return -1;
             return 0;
        });
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 relative">
                <Navbar />
                
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)] flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-brand-600" /> Universal Calendar
                            </h1>
                            <p className="text-gray-500 mt-1 font-medium">Unified view of your schedule and tasks.</p>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                            <button 
                                onClick={() => setShowMeetings(!showMeetings)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    showMeetings ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <Video className="h-3.5 w-3.5" /> Meetings
                            </button>
                            <button 
                                onClick={() => setShowTasks(!showTasks)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    showTasks ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <CheckSquare className="h-3.5 w-3.5" /> Tasks
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex gap-1">
                                <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                                <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"><ChevronRight className="h-5 w-5" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t border-gray-100">
                            {isLoading ? (
                                <div className="col-span-7 flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
                                </div>
                            ) : renderCells()}
                        </div>
                    </div>
                </main>

                {/* Day Agenda Drawer */}
                {selectedDate && (
                    <div 
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedDate(null)}
                    >
                        <div 
                            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
                                    <p className="text-gray-500 font-medium">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDate(null)} 
                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-100">
                                <button 
                                    onClick={() => handleCreateTaskForDate(selectedDate)}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                                >
                                    <CheckSquare className="h-4 w-4" /> Add Task
                                </button>
                                <button 
                                    onClick={() => handleCreateMeetingForDate(selectedDate)}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-colors"
                                >
                                    <Video className="h-4 w-4" /> Schedule Call
                                </button>
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {getAgendaItems().length > 0 ? (
                                    getAgendaItems().map((item, idx) => (
                                        <div key={item.id} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-4 last:pb-0">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ring-1 ring-gray-200 ${item.type === 'meeting' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                            
                                            <div 
                                                onClick={() => item.type === 'task' ? handleTaskClick(item.data as Task) : handleMeetingClick(item.data as Meeting)}
                                                className="group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                        {item.type === 'meeting' 
                                                            ? item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                            : 'All Day'
                                                        }
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        item.type === 'meeting' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                                
                                                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:shadow-md group-hover:border-brand-200 transition-all">
                                                    <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
                                                    
                                                    {item.type === 'meeting' && (item.data as Meeting).meetingLink && (
                                                        <div className="text-xs text-blue-600 underline truncate mb-1">{(item.data as Meeting).meetingLink}</div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-500 font-medium capitalize flex items-center gap-1">
                                                            {item.status}
                                                        </span>
                                                        {item.type === 'task' && companyMap[(item.data as Task).companyId!] && (
                                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                                {companyMap[(item.data as Task).companyId!]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                                        <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Calendar className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium">No events scheduled.</p>
                                        <p className="text-xs mt-1">Enjoy your free time!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inline Tooltip / Popover (Only shows if popover state is set AND no drawer open) */}
                {popover && !selectedDate && (
                    <div 
                        className="fixed z-[100] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-80 animate-in fade-in zoom-in-95 duration-200"
                        style={{ left: popover.x, top: popover.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setPopover(null)} 
                            className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${popover.item.type === 'task' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {popover.item.type === 'task' ? <CheckSquare className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">{popover.item.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                        popover.item.type === 'task' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                        : 'bg-purple-50 text-purple-700 border-purple-100'
                                    }`}>
                                        {popover.item.type}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium capitalize border border-gray-100 px-2 py-0.5 rounded bg-gray-50">
                                        {popover.item.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4 border border-gray-100">
                            <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">
                                    {popover.item.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {popover.item.type === 'meeting' && (
                                    <span className="text-gray-400">• {popover.item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                )}
                            </div>
                            
                            {/* For Tasks: Show Company */}
                            {popover.item.type === 'task' && (popover.item.data as Task).companyId && companyMap[(popover.item.data as Task).companyId!] && (
                                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium truncate max-w-[200px]">
                                        {companyMap[(popover.item.data as Task).companyId!]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => {
                                if (popover.item.type === 'task') handleTaskClick(popover.item.data as Task);
                                else handleMeetingClick(popover.item.data as Meeting);
                            }}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                        >
                            View Full Details
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
