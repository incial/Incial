
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, LogOut, ChevronDown, User, Menu, Check, LayoutDashboard, Users, CalendarDays, CheckSquare, Calendar, Briefcase, ListTodo, PieChart, BarChart2, Home, PanelLeft, Gamepad2, Plus, Zap, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const MobileNavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      active 
        ? 'bg-brand-50 text-brand-700' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-gray-400'}`} />
    {label}
  </Link>
);

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useLayout();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname;
  
  const role = user?.role;
  const isSuperAdmin = role === 'ROLE_SUPER_ADMIN';
  const isAdmin = role === 'ROLE_ADMIN' || isSuperAdmin;
  const isEmployee = role === 'ROLE_EMPLOYEE' || isAdmin;
  const isClient = role === 'ROLE_CLIENT';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (currentPath === '/dashboard') return 'Dashboard';
    if (currentPath === '/crm') return 'CRM Pipeline';
    if (currentPath.startsWith('/tasks')) return 'Tasks Board';
    if (currentPath.startsWith('/companies')) return 'Companies Registry';
    if (currentPath.startsWith('/meetings')) return 'Meeting Tracker';
    if (currentPath.startsWith('/calendar')) return 'Universal Calendar';
    if (currentPath.startsWith('/client-tracker')) return 'Client Projects';
    if (currentPath === '/reports') return 'Analytics Reports';
    if (currentPath === '/admin/performance') return 'Team Performance';
    if (currentPath === '/profile') return 'My Profile';
    if (currentPath === '/break') return 'Focus Break';
    if (currentPath === '/portal') return 'Project Portal';
    return 'Incial CRM';
  };

  return (
    <header className="h-[72px] bg-white/90 backdrop-blur-xl border-b border-gray-200/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
      
      {/* Left Section */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-2xl">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
            title="Toggle Sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Title (Mobile) / Search (Desktop) */}
          <div className="flex-1 flex items-center gap-4">
             <span className="md:hidden text-lg font-bold text-gray-900 truncate">
                {getPageTitle()}
             </span>

             <div className="relative w-full max-w-md hidden md:block group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={`Search in ${getPageTitle()}...`}
                    className="w-full pl-10 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                    <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
             </div>
          </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 lg:gap-6 ml-auto">
        
        {/* Quick Action (Desktop) */}
        {!isClient && (
            <Link 
                to="/tasks"
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200/50 rounded-xl transition-all active:scale-95 group"
            >
                <div className="bg-white rounded-md p-0.5 shadow-sm group-hover:shadow text-brand-600">
                    <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide">New</span>
            </Link>
        )}

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${isNotifOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-3 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button className="text-xs font-bold text-brand-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex gap-3">
                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 font-semibold">New lead assigned</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">The system assigned "Acme Corp" to your pipeline.</p>
                                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">2 min ago</p>
                                </div>
                            </div>
                         </div>
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex gap-3">
                                <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 border border-green-100">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900 font-semibold">Task Completed</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">"Website Redesign" marked as done by Sarah.</p>
                                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">1 hour ago</p>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">View All Activity</button>
                    </div>
                </div>
            )}
        </div>
        
        {/* User Profile */}
        <div className="relative pl-2" ref={profileRef}>
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group flex items-center gap-3 outline-none"
            >
                <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">{user?.role.replace('ROLE_', '')}</p>
                </div>
                <div className="relative">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105 active:scale-95">
                        <div className="h-full w-full rounded-[10px] bg-white overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-50 text-brand-700 font-bold text-sm">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden xl:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-1.5">
                        <div className="px-4 py-3 bg-gray-50/50 rounded-xl mb-1 lg:hidden">
                             <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                             <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        
                        <div className="space-y-0.5">
                            <Link 
                                to="/profile" 
                                onClick={() => setIsProfileOpen(false)} 
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                            >
                                <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                    <User className="h-4 w-4" />
                                </div>
                                My Profile
                            </Link>
                            
                            <Link 
                                to="/settings" 
                                onClick={() => setIsProfileOpen(false)} 
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                            >
                                <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                    <Settings className="h-4 w-4" />
                                </div>
                                Settings
                            </Link>

                            <Link 
                                to="/break" 
                                onClick={() => setIsProfileOpen(false)} 
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                            >
                                <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Gamepad2 className="h-4 w-4" />
                                </div>
                                Focus Break
                            </Link>
                        </div>
                    </div>
                    
                    <div className="p-1.5 border-t border-gray-50">
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 text-red-500 transition-colors">
                                <LogOut className="h-4 w-4" />
                            </div>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-3 px-4 flex flex-col gap-1 md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto z-40 animate-in slide-in-from-top-2">
            <div className="mb-2 px-2 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
            </div>
            
            {isClient && <MobileNavItem to="/portal" icon={Home} label="My Project" active={currentPath === '/portal'} />}

            {!isClient && <MobileNavItem to="/dashboard" icon={LayoutDashboard} label="My Dashboard" active={currentPath === '/dashboard'} />}
            
            {isAdmin && <MobileNavItem to="/crm" icon={Users} label="CRM & Leads" active={currentPath === '/crm'} />}
            
            {isEmployee && (
                <>
                    <MobileNavItem to="/calendar" icon={CalendarDays} label="Universal Calendar" active={currentPath === '/calendar'} />
                    <MobileNavItem to="/tasks" icon={CheckSquare} label="Tasks" active={currentPath.startsWith('/tasks')} />
                    <MobileNavItem to="/meetings" icon={Calendar} label="Meeting Tracker" active={currentPath.startsWith('/meetings')} />
                    <MobileNavItem to="/companies" icon={Briefcase} label="Companies" active={currentPath.startsWith('/companies')} />
                    <MobileNavItem to="/client-tracker" icon={ListTodo} label="Client Projects" active={currentPath.startsWith('/client-tracker')} />
                </>
            )}
            
            {isSuperAdmin && (
                <>
                    <div className="my-2 border-t border-gray-100" />
                    <div className="mb-2 px-2 mt-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analytics</p>
                    </div>
                    <MobileNavItem to="/reports" icon={PieChart} label="Reports" active={currentPath === '/reports'} />
                    <MobileNavItem to="/admin/performance" icon={BarChart2} label="Team Performance" active={currentPath === '/admin/performance'} />
                </>
            )}

            <div className="my-2 border-t border-gray-100" />
            <MobileNavItem to="/profile" icon={User} label="My Profile" active={currentPath === '/profile'} />
            <div className="p-2">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
      )}
    </header>
  );
};
