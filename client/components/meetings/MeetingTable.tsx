
import React, { useState, useRef, useEffect } from 'react';
import { Meeting, MeetingStatus } from '../../types';
import { formatDateTime, getMeetingStatusStyles } from '../../utils';
import { Video, Calendar, Link as LinkIcon, ExternalLink, ChevronDown, Check, Clock } from 'lucide-react';

interface MeetingTableProps {
  data: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onStatusChange: (meeting: Meeting, newStatus: MeetingStatus) => void;
}

const MeetingStatusDropdown = ({ meeting, onStatusChange }: { meeting: Meeting; onStatusChange: (m: Meeting, s: MeetingStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const options: MeetingStatus[] = ['Scheduled', 'Completed', 'Cancelled', 'Postponed'];

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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 ${getMeetingStatusStyles(meeting.status)}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                {meeting.status}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onStatusChange(meeting, opt); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                                    meeting.status === opt ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {opt}
                                {meeting.status === opt && <Check className="h-3 w-3 text-brand-600 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const MeetingTable: React.FC<MeetingTableProps> = ({ data, onEdit, onStatusChange }) => {
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="p-20 text-center bg-white">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-bold text-lg">No meetings found</h3>
        <p className="text-gray-500 mt-1">Schedule a new meeting to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white min-h-[400px] pb-24">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-1/4">Meeting Title</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-1/4">Notes</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.map(meeting => (
                    <tr key={meeting.id} className="group hover:bg-gray-50/50 transition-colors">
                        
                        {/* Title */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <button onClick={() => onEdit(meeting)} className="font-bold text-sm text-gray-900 hover:text-brand-600 hover:underline text-left">
                                    {meeting.title}
                                </button>
                            </div>
                        </td>

                        {/* Date Time - Formatted clearly */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold ${new Date(meeting.dateTime) < new Date() && meeting.status !== 'Completed' && meeting.status !== 'Cancelled' ? 'text-red-600' : 'text-gray-800'}`}>
                                    {new Date(meeting.dateTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(meeting.dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                        </td>

                        {/* Status (Dropdown) */}
                        <td className="px-6 py-4">
                            <MeetingStatusDropdown meeting={meeting} onStatusChange={onStatusChange} />
                        </td>

                        {/* Link */}
                        <td className="px-6 py-4">
                            {meeting.meetingLink ? (
                                <a 
                                    href={meeting.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors max-w-[150px] truncate"
                                    title={meeting.meetingLink}
                                >
                                    <Video className="h-3 w-3 flex-shrink-0" />
                                    Link
                                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0 ml-auto" />
                                </a>
                            ) : (
                                <span className="text-gray-300 text-xs">-</span>
                            )}
                        </td>

                        {/* Notes */}
                        <td className="px-6 py-4">
                            <div 
                                className="relative text-xs text-gray-600 max-w-xs cursor-pointer group/note"
                                onClick={() => setExpandedNoteId(expandedNoteId === meeting.id ? null : meeting.id)}
                            >
                                <p className={`${expandedNoteId === meeting.id ? '' : 'truncate'}`}>
                                    {meeting.notes || <span className="text-gray-300 italic">No notes</span>}
                                </p>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};
