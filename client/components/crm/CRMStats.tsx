
import React from 'react';
import { TrendingUp, Users, Briefcase, Activity } from 'lucide-react';
import { CRMEntry } from '../../types';

export const CRMStats: React.FC<{ entries: CRMEntry[] }> = ({ entries }) => {
    // Active deals are those in pipeline (not lost, not won/completed)
    const activeDeals = entries.filter(e => 
        e.status !== 'drop' && 
        e.status !== 'onboarded' && 
        e.status !== 'completed'
    ).length;

    // Won Business includes currently active clients (onboarded) and finished projects (completed)
    const wonDeals = entries.filter(e => 
        e.status === 'onboarded' || 
        e.status === 'completed'
    ).length;

    const totalLeads = entries.length;

    return (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm mb-8 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-hidden">
            
            <div className="flex-1 p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Pipeline</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-gray-900">{activeDeals}</h3>
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Deals</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Won Business</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-gray-900">{wonDeals}</h3>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Closed</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Volume</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-extrabold text-gray-900">{totalLeads}</h3>
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Leads</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
