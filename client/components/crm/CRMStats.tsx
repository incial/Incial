
import React from 'react';
import { TrendingUp, Users, Briefcase, PieChart } from 'lucide-react';
import { CRMEntry } from '../../types';

export const CRMStats: React.FC<{ entries: CRMEntry[] }> = ({ entries }) => {
    // Helper for case-insensitive status check
    const checkStatus = (status: string | undefined, target: string) => {
        return (status?.toLowerCase() || '') === target.toLowerCase();
    };

    // Active deals are those in pipeline (not lost, not won/completed)
    const activeDeals = entries.filter(e => {
        const s = e.status?.toLowerCase() || '';
        return s !== 'drop' && s !== 'onboarded' && s !== 'completed';
    }).length;

    // Won Business includes currently active clients (onboarded) and finished projects (completed)
    const wonDeals = entries.filter(e => {
        const s = e.status?.toLowerCase() || '';
        return s === 'onboarded' || s === 'completed';
    }).length;

    const totalLeads = entries.length;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    return (
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] mb-8 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                
                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Active Pipeline</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{activeDeals}</h3>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">Deals</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Won Business</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{wonDeals}</h3>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Closed</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <PieChart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Conversion</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{conversionRate.toFixed(1)}%</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">Win Rate</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Volume</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{totalLeads}</h3>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">Leads</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
