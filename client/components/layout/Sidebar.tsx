
import React from 'react';
import { Users, Briefcase, Settings, PieChart, ChevronRight, CheckSquare, ListTodo, BarChart2, Calendar, CalendarDays, LayoutDashboard, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active: boolean }) => (
  <Link
    to={to}
    className={`group flex items-center justify-between px-4 py-3 mx-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
    }`}
  >
    <div className="flex items-center gap-3">
        <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span>{label}</span>
    </div>
    {active && <ChevronRight className="h-4 w-4 text-white/70" />}
  </Link>
);

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const currentPath = location ? location.pathname : '/dashboard';
    
    const role = user?.role;
    const isSuperAdmin = role === 'ROLE_SUPER_ADMIN';
    const isAdmin = role === 'ROLE_ADMIN' || isSuperAdmin;
    const isEmployee = role === 'ROLE_EMPLOYEE' || isAdmin; // Employees and above
    const isClient = role === 'ROLE_CLIENT';

  return (
    <aside className="w-72 bg-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 hidden md:flex shadow-2xl">
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
            <img src="/logo.png" alt="Incial" className="h-9 w-9 rounded-xl bg-white shadow-lg object-contain p-1" />
            Incial
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 no-scrollbar">
        <div className="mb-8">
            <p className="px-7 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overview</p>
            <div className="space-y-1">
                {/* Client Specific View */}
                {isClient && (
                    <NavItem icon={Home} label="My Project" to="/portal" active={currentPath === '/portal'} />
                )}

                {/* Internal Team Views */}
                {!isClient && (
                    <NavItem icon={LayoutDashboard} label="My Dashboard" to="/dashboard" active={currentPath === '/dashboard'} />
                )}
                
                {/* CRM - Admin & Super Admin Only */}
                {isAdmin && <NavItem icon={Users} label="CRM & Leads" to="/crm" active={currentPath === '/crm'} />}
                
                {/* Operational - Everyone except Client (Client has Portal) */}
                {isEmployee && (
                    <>
                        <NavItem icon={CalendarDays} label="Calendar" to="/calendar" active={currentPath === '/calendar'} />
                        <NavItem icon={CheckSquare} label="Tasks" to="/tasks" active={currentPath.startsWith('/tasks')} />
                        <NavItem icon={Calendar} label="Meeting Tracker" to="/meetings" active={currentPath.startsWith('/meetings')} />
                        <NavItem icon={Briefcase} label="Companies" to="/companies" active={currentPath.startsWith('/companies')} />
                        <NavItem icon={ListTodo} label="Client Tracker" to="/client-tracker" active={currentPath.startsWith('/client-tracker')} />
                    </>
                )}
            </div>
        </div>

        {/* Analytics Section - Only for Super Admin */}
        {isSuperAdmin && (
            <div className="mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="px-7 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Analytics</p>
                <div className="space-y-1">
                    <NavItem icon={PieChart} label="Reports" to="/reports" active={currentPath === '/reports'} />
                    <NavItem icon={BarChart2} label="Team Performance" to="/admin/performance" active={currentPath === '/admin/performance'} />
                </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-[#0F172A]">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-all">
            <Settings className="h-5 w-5" />
            <span className="font-medium text-sm">Settings</span>
        </Link>
      </div>
    </aside>
  );
};
