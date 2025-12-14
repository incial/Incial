
import React from 'react';
import { Users, Briefcase, Settings, PieChart, ChevronRight, CheckSquare, ListTodo, BarChart2, Calendar, CalendarDays, LayoutDashboard, Home, Command } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const NavItem = ({ icon: Icon, label, to, active, collapsed }: { icon: any, label: string, to: string, active: boolean, collapsed: boolean }) => (
  <Link
    to={to}
    title={collapsed ? label : ''}
    className={`relative group flex items-center ${collapsed ? 'justify-center px-2' : 'px-4 mx-3'} py-3 mb-1 rounded-2xl text-sm font-medium transition-all duration-300 ease-out ${
      active 
        ? 'bg-brand-600 text-white shadow-xl shadow-brand-900/20 ring-1 ring-white/10' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {/* Subtle Inner Highlight for Active State */}
    {active && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    )}

    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3.5'} z-10 w-full`}>
        <Icon 
            className={`
                ${collapsed ? 'h-6 w-6' : 'h-[18px] w-[18px]'} 
                transition-transform duration-300 
                ${active ? 'text-white' : 'text-slate-500 group-hover:text-brand-300 group-hover:scale-110'}
            `} 
            strokeWidth={active ? 2.5 : 2}
        />
        
        {!collapsed && (
            <span className={`tracking-wide truncate ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
            </span>
        )}
        
        {!collapsed && active && (
            <ChevronRight className="h-4 w-4 text-white/50 ml-auto transition-transform duration-300 group-hover:translate-x-1" />
        )}
    </div>
  </Link>
);

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { isSidebarCollapsed } = useLayout();
    const currentPath = location ? location.pathname : '/dashboard';
    
    const role = user?.role;
    const isSuperAdmin = role === 'ROLE_SUPER_ADMIN';
    const isAdmin = role === 'ROLE_ADMIN' || isSuperAdmin;
    const isEmployee = role === 'ROLE_EMPLOYEE' || isAdmin; // Employees and above
    const isClient = role === 'ROLE_CLIENT';

  return (
    <aside 
        className={`${
            isSidebarCollapsed ? 'w-[5.5rem]' : 'w-[19rem]'
        } bg-[#0B1121] border-r border-slate-800/60 flex flex-col h-screen sticky top-0 z-30 hidden md:flex shadow-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)`}
    >
      {/* Header / Logo */}
      <div className={`h-[88px] flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-8'} transition-all duration-300`}>
        <div className="flex items-center gap-3.5 overflow-hidden whitespace-nowrap group cursor-pointer">
            <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 transition-all duration-500 ${isSidebarCollapsed ? 'h-10 w-10' : 'h-9 w-9'}`}>
                <img src="/logo.png" alt="Incial" className="h-9 w-9 rounded-xl bg-white shadow-lg object-contain p-1 flex-shrink-0" />
            </div>
            
            {!isSidebarCollapsed && (
                <div className="flex flex-col opacity-100 transition-opacity duration-300">
                    <span className="text-white font-bold text-xl tracking-tight leading-none">Incial</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Workspace</span>
                </div>
            )}
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-6 no-scrollbar space-y-8">
        
        {/* Section: Overview */}
        <div>
            {!isSidebarCollapsed ? (
                <p className="px-8 text-[11px] font-bold text-slate-500/80 uppercase tracking-widest mb-3 transition-opacity opacity-100">Main Menu</p>
            ) : (
                <div className="flex justify-center mb-3">
                    <div className="h-0.5 w-4 bg-slate-800 rounded-full" />
                </div>
            )}
            
            <div className="space-y-0.5">
                {/* Client Specific View */}
                {isClient && (
                    <NavItem collapsed={isSidebarCollapsed} icon={Home} label="My Project" to="/portal" active={currentPath === '/portal'} />
                )}

                {/* Internal Team Views */}
                {!isClient && (
                    <NavItem collapsed={isSidebarCollapsed} icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={currentPath === '/dashboard'} />
                )}
                
                {/* CRM - Admin & Super Admin Only */}
                {isAdmin && <NavItem collapsed={isSidebarCollapsed} icon={Users} label="CRM & Leads" to="/crm" active={currentPath === '/crm'} />}
                
                {/* Operational - Everyone except Client */}
                {isEmployee && (
                    <>
                        <NavItem collapsed={isSidebarCollapsed} icon={CalendarDays} label="Calendar" to="/calendar" active={currentPath === '/calendar'} />
                        <NavItem collapsed={isSidebarCollapsed} icon={CheckSquare} label="Tasks Board" to="/tasks" active={currentPath.startsWith('/tasks')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={Calendar} label="Meetings" to="/meetings" active={currentPath.startsWith('/meetings')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={Briefcase} label="Companies" to="/companies" active={currentPath.startsWith('/companies')} />
                        <NavItem collapsed={isSidebarCollapsed} icon={ListTodo} label="Client Tracker" to="/client-tracker" active={currentPath.startsWith('/client-tracker')} />
                    </>
                )}
            </div>
        </div>

        {/* Section: Analytics - Super Admin Only */}
        {isSuperAdmin && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
                {!isSidebarCollapsed ? (
                    <p className="px-8 text-[11px] font-bold text-slate-500/80 uppercase tracking-widest mb-3 transition-opacity opacity-100">Intelligence</p>
                ) : (
                    <div className="flex justify-center mb-3">
                        <div className="h-0.5 w-4 bg-slate-800 rounded-full" />
                    </div>
                )}
                <div className="space-y-0.5">
                    <NavItem collapsed={isSidebarCollapsed} icon={PieChart} label="Reports" to="/reports" active={currentPath === '/reports'} />
                    <NavItem collapsed={isSidebarCollapsed} icon={BarChart2} label="Performance" to="/admin/performance" active={currentPath === '/admin/performance'} />
                </div>
            </div>
        )}
      </div>

      {/* Footer / User Profile Snippet */}
      <div className={`p-4 border-t border-slate-800/60 bg-[#0B1121] ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
        <Link 
            to="/settings" 
            title={isSidebarCollapsed ? "Settings" : ""}
            className={`group flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'} rounded-2xl hover:bg-slate-800/50 transition-all duration-300`}
        >
            <div className={`relative flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-all ${isSidebarCollapsed ? 'h-9 w-9' : 'h-8 w-8'}`}>
                <Settings className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
            </div>
            
            {!isSidebarCollapsed && (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Settings</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Manage account</span>
                </div>
            )}
        </Link>
      </div>
    </aside>
  );
};
