
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface UserSelectProps {
  label?: string;
  value: string; // The user's name (as stored in DB currently)
  onChange: (value: string) => void;
  users: User[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const UserSelect: React.FC<UserSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  users, 
  placeholder = "Assign to...",
  className = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find(u => u.name === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
        setSearch(''); // Reset search on close
    }
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // Helper to render avatar
  const renderAvatar = (u: User | undefined, size: 'sm' | 'md' = 'sm') => {
      const sizeClasses = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-9 w-9 text-xs';
      
      if (u?.avatarUrl) {
          return <img src={u.avatarUrl} alt={u.name} className={`${sizeClasses} rounded-full object-cover border border-gray-200`} />;
      }
      
      const initials = u?.name ? u.name.slice(0, 2).toUpperCase() : '??';
      const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600'];
      const colorClass = u?.name ? colors[u.name.length % colors.length] : 'bg-gray-100 text-gray-500';

      return (
          <div className={`${sizeClasses} rounded-full flex items-center justify-center font-bold ${colorClass} border border-white/50 shadow-sm`}>
              {initials}
          </div>
      );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              {label} {required && <span className="text-red-500">*</span>}
          </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-xl text-sm transition-all duration-300 outline-none group ${
          isOpen 
            ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' 
            : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
            {value && value !== 'Unassigned' ? (
                <>
                    {renderAvatar(selectedUser)}
                    <span className="font-bold text-gray-900 leading-none">{value}</span>
                </>
            ) : (
                <span className="text-gray-400 font-medium flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                        <UserIcon className="h-3 w-3 text-gray-400" />
                    </div>
                    {placeholder}
                </span>
            )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-600' : 'group-hover:text-gray-600'}`} />
      </button>

      {/* Elongated Premium Pop */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-3 w-full sm:w-[340px] bg-white border border-gray-100/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/50 backdrop-blur-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder-gray-400"
                        placeholder="Search team members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-white">
                <button
                    type="button"
                    onClick={() => { onChange('Unassigned'); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                        value === 'Unassigned' || !value ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="h-9 w-9 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:border-brand-300 group-hover:text-brand-500 transition-colors">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700">Unassigned</span>
                    </div>
                    {(value === 'Unassigned' || !value) && <Check className="h-4 w-4 text-gray-400 ml-auto" />}
                </button>

                <div className="h-px bg-gray-100 my-1 mx-2" />

                {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                        <button
                            key={u.id}
                            type="button"
                            onClick={() => { onChange(u.name); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                                value === u.name 
                                ? 'bg-brand-50 ring-1 ring-brand-100' 
                                : 'hover:bg-gray-50'
                            }`}
                        >
                            {renderAvatar(u, 'md')}
                            <div className="flex flex-col items-start min-w-0">
                                <span className={`text-sm font-bold truncate ${value === u.name ? 'text-brand-900' : 'text-gray-700'}`}>
                                    {u.name}
                                </span>
                                <span className="text-[10px] text-gray-400 truncate max-w-[160px]">{u.email}</span>
                            </div>
                            {value === u.name && (
                                <div className="ml-auto bg-brand-600 rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </button>
                    ))
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-xs text-gray-400 font-medium">No team members found.</p>
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-medium text-center">
                Showing {filteredUsers.length} members
            </div>
        </div>
      )}
    </div>
  );
};
