
import React, { useState } from 'react';
import { Meeting } from '../../types';
import { ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';
import { getMeetingStatusStyles } from '../../utils';

interface MeetingsCalendarProps {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
}

export const MeetingsCalendar: React.FC<MeetingsCalendarProps> = ({ meetings, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

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
            cells.push(<div key={`empty-${i}`} className="bg-gray-50/30 border-b border-r border-gray-100 min-h-[120px]" />);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayMeetings = meetings.filter(m => m.dateTime.startsWith(dateStr));
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            // Sort by time
            dayMeetings.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

            cells.push(
                <div key={day} className={`border-b border-r border-gray-100 min-h-[120px] p-2 hover:bg-gray-50 transition-colors group ${isToday ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-500'}`}>
                            {day}
                        </span>
                        {dayMeetings.length > 0 && (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded-md">
                                {dayMeetings.length}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar">
                        {dayMeetings.map(meeting => (
                            <button 
                                key={meeting.id} 
                                type="button"
                                onClick={() => onEdit(meeting)}
                                className={`w-full text-left p-1.5 rounded-lg border text-[10px] shadow-sm transition-all hover:shadow-md hover:scale-[1.02] ${getMeetingStatusStyles(meeting.status)} bg-white`}
                            >
                                <div className="font-bold truncate text-gray-800">{meeting.title}</div>
                                <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        {new Date(meeting.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="bg-white rounded-2xl h-full flex flex-col border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Video className="h-5 w-5 text-brand-600" />
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight className="h-5 w-5" /></button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {d}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t border-gray-100">
                {renderCells()}
            </div>
        </div>
    );
};
