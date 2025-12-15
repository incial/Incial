
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { tasksApi, meetingsApi } from '../services/api';
import { Task, Meeting } from '../types';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    ArrowRight, 
    Video, 
    Plus, 
    CheckCircle2, 
    Briefcase,
    CalendarDays,
    ChevronRight,
    ChevronLeft,
    Target,
    Zap,
    Layout,
    CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils';

export const MyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [tasksData, meetingsData] = await Promise.all([
                    tasksApi.getAll(),
                    meetingsApi.getAll()
                ]);

                // Filter tasks assigned to user
                const myTasks = tasksData.filter(t => t.assignedTo === user?.name);
                setAllTasks(myTasks);

                // Meetings: Keep all, user might want to see team meetings or filter later
                // For now, let's just use all meetings for the calendar dots
                setMeetings(meetingsData);

            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    // --- Derived Metrics & Data ---

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const activeTasks = allTasks.filter(t => !['Completed', 'Done', 'Dropped'].includes(t.status));
    const completedTasks = allTasks.filter(t => ['Completed', 'Done'].includes(t.status));
    
    // Hero Section Data: Next Meeting or High Priority Task
    const upcomingMeetings = meetings
        .filter(m => new Date(m.dateTime) >= new Date() && m.status !== 'Cancelled')
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    const nextMeeting = upcomingMeetings[0];
    
    // Efficiency Score
    const efficiency = allTasks.length > 0 
        ? Math.round((completedTasks.length / allTasks.length) * 100) 
        : 0;

    // Greeting Logic
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const currentDateDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Sorted Priority Tasks (Top 5 for Queue)
    const priorityTasks = useMemo(() => {
        const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return [...activeTasks].sort((a, b) => {
            if (a.dueDate === todayStr && b.dueDate !== todayStr) return -1;
            if (b.dueDate === todayStr && a.dueDate !== todayStr) return 1;
            
            const weightDiff = weight[b.priority] - weight[a.priority];
            if (weightDiff !== 0) return weightDiff;
            
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }).slice(0, 5);
    }, [activeTasks, todayStr]);

    // --- Calendar Logic ---
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));

    const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    // Agenda for Selected Date
    const agendaItems = useMemo(() => {
        const dateStr = selectedDateStr; // YYYY-MM-DD
        
        const dayMeetings = meetings.filter(m => m.dateTime.startsWith(dateStr));
        const dayTasks = allTasks.filter(t => t.dueDate === dateStr && !['Completed', 'Done'].includes(t.status));

        return {
            meetings: dayMeetings.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
            tasks: dayTasks
        };
    }, [selectedDateStr, meetings, allTasks]);

    // Calendar Render
    const renderCalendar = () => {
        const totalDays = daysInMonth(calendarViewDate);
        const startDay = firstDayOfMonth(calendarViewDate);
        const cells = [];

        // Empty cells
        for (let i = 0; i < startDay; i++) {
            cells.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${calendarViewDate.getFullYear()}-${String(calendarViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = todayStr === dateStr;
            const isSelected = selectedDateStr === dateStr;
            
            // Check for events
            const hasMeeting = meetings.some(m => m.dateTime.startsWith(dateStr));
            const hasTask = allTasks.some(t => t.dueDate === dateStr && !['Completed', 'Done'].includes(t.status));

            cells.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day))}
                    className={`h-10 w-10 rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 ${
                        isSelected 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
                        : isToday 
                            ? 'bg-brand-50 text-brand-700 font-bold' 
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <span className="text-sm leading-none">{day}</span>
                    <div className="flex gap-0.5 mt-1">
                        {hasMeeting && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-purple-300' : 'bg-purple-500'}`} />}
                        {hasTask && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-500'}`} />}
                    </div>
                </button>
            );
        }
        return cells;
    };

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="p-8 space-y-8">
                        <div className="h-16 bg-gray-100 rounded-xl w-1/3 animate-pulse" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
                                <div className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
                            </div>
                            <div className="h-full bg-gray-100 rounded-3xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                
                <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto custom-scrollbar h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
                    
                    {/* Header */}
                    <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-px w-8 bg-brand-300"></span>
                                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{currentDateDisplay}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                                {greeting}, <span className="text-gray-400">{user?.name?.split(' ')[0]}</span>
                            </h1>
                        </div>
                        <Link to="/tasks" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors group">
                            Go to Board <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        
                        {/* LEFT COLUMN: PRIMARY WORKFLOW (8/12) */}
                        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                            
                            {/* 1. HERO FOCUS CARD */}
                            <div className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Target className="h-5 w-5 text-brand-500" />
                                            Current Focus
                                        </h2>
                                        <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            {nextMeeting ? 'Meeting Soon' : 'Top Priority'}
                                        </span>
                                    </div>

                                    {nextMeeting ? (
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <Video className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2 truncate">{nextMeeting.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {new Date(nextMeeting.dateTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Kolkata'})}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span>Via {nextMeeting.meetingLink ? 'Video Call' : 'Scheduled Location'}</span>
                                                </div>
                                            </div>
                                            {nextMeeting.meetingLink && (
                                                <a href={nextMeeting.meetingLink} target="_blank" rel="noreferrer" className="w-full md:w-auto mt-4 md:mt-0 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                                                    Join Now <ArrowRight className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    ) : priorityTasks.length > 0 ? (
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                                <Zap className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">HIGH PRIORITY</span>
                                                    <span className="text-xs text-gray-400 font-medium">Due {formatDate(priorityTasks[0].dueDate)}</span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight truncate">{priorityTasks[0].title}</h3>
                                            </div>
                                            <Link to="/tasks" className="w-full md:w-auto mt-4 md:mt-0 px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                                View Details <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="inline-flex p-3 bg-green-50 text-green-600 rounded-full mb-3">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">All clear!</h3>
                                            <p className="text-gray-500">You have no pending high-priority items.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. TASK QUEUE */}
                            <div>
                                <div className="flex items-center justify-between px-2 mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Layout className="h-5 w-5 text-gray-400" />
                                        Your Queue
                                    </h2>
                                    <Link to="/tasks" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Plus className="h-4 w-4 text-gray-600" />
                                    </Link>
                                </div>

                                <div className="bg-white rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                                    {priorityTasks.length > 0 ? (
                                        <div className="divide-y divide-gray-50">
                                            {priorityTasks.map((task) => (
                                                <div key={task.id} className="group p-4 md:p-5 flex items-center gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer">
                                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                                        task.status === 'Completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-brand-400'
                                                    }`}>
                                                        {task.status === 'Completed' && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{task.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                                            <span className={`flex items-center gap-1 ${task.dueDate === todayStr ? 'text-red-500 font-semibold' : ''}`}>
                                                                <CalendarIcon className="h-3 w-3" />
                                                                {task.dueDate === todayStr ? 'Today' : formatDate(task.dueDate)}
                                                            </span>
                                                            {task.priority === 'High' && (
                                                                <span className="text-red-600 font-semibold bg-red-50 px-1.5 rounded">High</span>
                                                            )}
                                                            <span className="bg-gray-100 px-1.5 rounded hidden sm:inline-block">{task.status}</span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                                                </div>
                                            ))}
                                            <Link to="/tasks" className="block p-4 text-center text-xs font-bold text-gray-400 hover:text-brand-600 hover:bg-gray-50 transition-colors uppercase tracking-widest">
                                                View all {activeTasks.length} tasks
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Briefcase className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No active tasks in queue.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: CALENDAR & AGENDA (4/12) */}
                        <div className="lg:col-span-4 space-y-6 lg:space-y-8">
                            
                            {/* Calendar Widget */}
                            <div className="bg-white rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5 text-brand-600" />
                                        {calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                                        <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {renderCalendar()}
                                </div>

                                {/* Agenda Section */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center justify-between">
                                        Agenda for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        {selectedDateStr === todayStr && <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Today</span>}
                                    </h4>
                                    
                                    <div className="space-y-3 min-h-[150px]">
                                        {/* Meetings */}
                                        {agendaItems.meetings.map(m => (
                                            <div key={m.id} className="flex gap-3 items-start group">
                                                <div className="flex flex-col items-center min-w-[40px]">
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {new Date(m.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                                <div className="flex-1 p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-sm">
                                                    <p className="font-bold text-purple-900 leading-tight">{m.title}</p>
                                                    {m.meetingLink && (
                                                        <a href={m.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-1 hover:underline">
                                                            <Video className="h-3 w-3" /> Join Call
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Tasks */}
                                        {agendaItems.tasks.map(t => (
                                            <div key={t.id} className="flex gap-3 items-center group">
                                                <div className="flex flex-col items-center min-w-[40px] text-gray-400">
                                                    <CheckSquare className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm group-hover:border-blue-200 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-bold text-gray-800 text-xs leading-snug">{t.title}</p>
                                                        {t.priority === 'High' && <div className="h-1.5 w-1.5 rounded-full bg-red-500" title="High Priority" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {agendaItems.meetings.length === 0 && agendaItems.tasks.length === 0 && (
                                            <div className="text-center py-8 text-gray-400">
                                                <p className="text-xs">No events scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Link to="/calendar" className="block text-center mt-4 text-xs font-bold text-brand-600 hover:underline">
                                        Open Full Calendar
                                    </Link>
                                </div>
                            </div>

                            {/* 2. PRODUCTIVITY STATS */}
                            <div className="bg-brand-900 rounded-3xl md:rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl"></div>
                                
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1">Weekly Pulse</h3>
                                    <p className="text-brand-200 text-xs mb-6">Task completion rate based on your activity.</p>
                                    
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-4xl font-extrabold tracking-tight">{efficiency}%</span>
                                        <span className="text-sm font-medium text-brand-300 mb-1.5">Efficiency</span>
                                    </div>
                                    
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-4">
                                        <div 
                                            className="bg-gradient-to-r from-brand-300 to-white h-full rounded-full" 
                                            style={{ width: `${efficiency}%` }}
                                        ></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                            <p className="text-xs text-brand-200 uppercase font-bold tracking-wider">Done</p>
                                            <p className="text-xl font-bold">{completedTasks.length}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                            <p className="text-xs text-brand-200 uppercase font-bold tracking-wider">Active</p>
                                            <p className="text-xl font-bold">{activeTasks.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
