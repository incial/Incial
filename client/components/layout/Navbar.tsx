
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, LogOut, ChevronDown, User, Settings, CreditCard, Menu, Check, LayoutDashboard, Users, CalendarDays, CheckSquare, Calendar, Briefcase, ListTodo, PieChart, BarChart2, Home, PanelLeft } from 'lucide-react';
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

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 transition-all">
      
      <div className="flex items-center gap-4 w-full max-w-md">
          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:bg-gray-200 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Search Bar - Global */}
          <div className="relative w-full hidden md:block group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </span>
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full pl-11 pr-14 py-2.5 bg-gray-50 border border-transparent hover:border-gray-200 focus:border-brand-500 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 shadow-sm">⌘ K</span>
            </div>
          </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 lg:gap-6 ml-auto">
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${isNotifOpen ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
            >
                <Bell className="h-5.5 w-5.5" />
                <span className="absolute top-2.5 right-3 h-2 w-2 bg-red-500 rounded-full border-2 border-white ring-1 ring-white"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        <span className="text-xs font-medium text-brand-600 cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">New lead assigned</p>
                                    <p className="text-xs text-gray-500 mt-0.5">John Doe assigned "Acme Corp" to you.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">2 min ago</p>
                                </div>
                            </div>
                         </div>
                         <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">Task Completed</p>
                                    <p className="text-xs text-gray-500 mt-0.5">"Website Redesign" marked as done.</p>
                                    <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                        <button className="text-xs font-semibold text-gray-500 hover:text-brand-600 transition-colors">View all notifications</button>
                    </div>
                </div>
            )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group outline-none"
            >
                <div className="relative">
                    {user?.avatarUrl ? (
                        <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                            {user?.name?.charAt(0)}
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="hidden sm:block">
                    <span className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-brand-600 transition-colors">{user?.name}</span>
                </div>
                
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {isProfileOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="p-2 border-b border-gray-50">
                        <div className="px-3 py-2 bg-gray-50 rounded-xl">
                             <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                             <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                             <p className="text-[10px] text-brand-600 font-bold mt-1 uppercase tracking-wide border border-brand-100 bg-brand-50 inline-block px-1.5 py-0.5 rounded">
                                 {role?.replace('ROLE_', '')}
                             </p>
                        </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                            <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <User className="h-4 w-4" />
                            </div>
                            My Profile
                        </button>
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                             <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <Settings className="h-4 w-4" />
                            </div>
                            Settings
                        </button>
                         <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-brand-600 transition-colors group">
                             <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-600 transition-colors">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            Billing
                        </button>
                    </div>
                    <div className="p-1.5 border-t border-gray-50">
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
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
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-3 px-4 flex flex-col gap-1 md:hidden max-h-[calc(100vh-5rem)] overflow-y-auto z-40 animate-in slide-in-from-top-2">
            <div className="mb-2 px-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Menu</p>
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
                    <MobileNavItem to="/client-tracker" icon={ListTodo} label="Client Tracker" active={currentPath.startsWith('/client-tracker')} />
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
            <MobileNavItem to="/settings" icon={Settings} label="Settings" active={currentPath === '/settings'} />
        </div>
      )}
    </header>
  );
};
