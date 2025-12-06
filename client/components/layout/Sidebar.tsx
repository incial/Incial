
import React from 'react';
import { LayoutDashboard, Users, Briefcase, Settings, PieChart, Layers, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    const currentPath = location ? location.pathname : '/crm';

  return (
    <aside className="w-72 bg-[#0F172A] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 hidden md:flex shadow-2xl">
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
            <div className="h-9 w-9 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                W
            </div>
            WorkHub
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8">
        <div className="mb-8">
            <p className="px-7 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overview</p>
            <div className="space-y-1">
                <NavItem icon={LayoutDashboard} label="Dashboard" to="/" active={currentPath === '/'} />
                <NavItem icon={Users} label="CRM & Leads" to="/crm" active={currentPath === '/crm'} />
                <NavItem icon={Briefcase} label="Companies" to="/companies" active={currentPath === '/companies'} />
            </div>
        </div>

        <div className="mb-8">
            <p className="px-7 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Analytics</p>
             <div className="space-y-1">
                <NavItem icon={PieChart} label="Reports" to="/reports" active={false} />
                <NavItem icon={Layers} label="Pipelines" to="/pipelines" active={false} />
            </div>
        </div>
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
