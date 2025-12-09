
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { PieChart, BarChart, TrendingUp, AlertCircle, Lock, Download, FileText, CheckSquare, Users, HelpCircle, Layers, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crmApi, tasksApi } from '../services/api';
import { formatMoney } from '../utils';
import { CRMEntry } from '../types';

interface AnalyticsPageProps {
  title: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ title }) => {
    const { user } = useAuth();
    const [entries, setEntries] = useState<CRMEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const loadData = async () => {
            if (user?.role === 'ROLE_ADMIN') {
                try {
                    const data = await crmApi.getAll();
                    setEntries(data.crmList);
                } catch (error) {
                    console.error("Failed to fetch analytics data", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadData();
    }, [user]);

    const handleExport = async (type: 'crm' | 'tasks') => {
        if (!window.confirm(`Are you sure you want to export ${type.toUpperCase()} data to CSV?`)) return;

        try {
            let data: any[] = [];
            let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

            if (type === 'crm') {
                const res = await crmApi.getAll();
                data = res.crmList;
            } else if (type === 'tasks') {
                data = await tasksApi.getAll();
            }

            if (!data || data.length === 0) {
                alert("No data available to export.");
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(obj => 
                Object.values(obj).map(val => {
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');
            
            // Trigger Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export data. Please try again.");
        }
    };

    // Safety check although route is protected
    if (user?.role !== 'ROLE_ADMIN') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    // --- Key Metrics Calculation ---
    const totalRevenue = entries.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
    const wonDeals = entries.filter(e => e.status === 'onboarded').length;
    const conversionRate = entries.length > 0 ? (wonDeals / entries.length) * 100 : 0;
    const avgDealSize = entries.length > 0 ? totalRevenue / entries.length : 0;

    // --- New Reports Calculation ---
    
    // 1. Revenue by Lead Source
    const revenueBySource: Record<string, number> = {};
    entries.forEach(e => {
        const source = (e.leadSources && e.leadSources[0]) ? e.leadSources[0] : 'Unknown';
        revenueBySource[source] = (revenueBySource[source] || 0) + (e.dealValue || 0);
    });
    const sortedSources = Object.entries(revenueBySource)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5
    const maxSourceRevenue = sortedSources.length > 0 ? sortedSources[0][1] : 0;

    // 2. Pipeline Status Distribution
    const statusCounts: Record<string, number> = {};
    entries.forEach(e => {
        const status = e.status || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const totalDeals = entries.length;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                
                <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
                     <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                        <p className="text-gray-500 mt-1 font-medium">Detailed insights and performance metrics.</p>
                     </div>

                     {/* Top Row: Key Metrics */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400">Total Revenue (Pipeline)</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : formatMoney(totalRevenue)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold text-gray-400">Conversion Rate</p>
                                        <div className="relative group/tooltip">
                                            <HelpCircle className="h-3.5 w-3.5 text-gray-300 cursor-help" />
                                            {/* Tooltip */}
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none text-center leading-relaxed z-10">
                                                ( Won Deals / Total Leads ) × 100
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : `${conversionRate.toFixed(1)}%`}
                                    </h3>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <PieChart className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(conversionRate, 100)}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-400">Avg Deal Size</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '...' : formatMoney(avgDealSize)}
                                    </h3>
                                </div>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <BarChart className="h-5 w-5" />
                                </div>
                            </div>
                             <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                     </div>

                     {/* Second Row: Detailed Reports */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        
                        {/* Report 1: Revenue by Source */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" /> Revenue by Lead Source
                            </h3>
                            <div className="space-y-5">
                                {sortedSources.map(([source, value]) => (
                                    <div key={source}>
                                        <div className="flex justify-between text-sm font-medium mb-1.5">
                                            <span className="text-gray-700">{source}</span>
                                            <span className="text-gray-900 font-bold">{formatMoney(value)}</span>
                                        </div>
                                        <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${(value / maxSourceRevenue) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {sortedSources.length === 0 && <p className="text-sm text-gray-400">No revenue data available.</p>}
                            </div>
                        </div>

                        {/* Report 2: Pipeline Distribution */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-blue-600" /> Pipeline Distribution
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${
                                                status === 'onboarded' ? 'bg-green-500' :
                                                status === 'drop' ? 'bg-red-500' :
                                                status === 'lead' ? 'bg-blue-500' : 'bg-amber-500'
                                            }`} />
                                            <span className="text-sm font-semibold text-gray-700 capitalize">{status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{count}</span>
                                            <span className="text-xs text-gray-400 font-medium w-12 text-right">
                                                {totalDeals > 0 ? ((count / totalDeals) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>

                     {/* Data Exports Section */}
                     <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" /> Data Exports
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <button 
                                onClick={() => handleExport('crm')}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4"
                            >
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Export All CRM Data</h3>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Download all leads, deals, and company records to CSV.</p>
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                        Download CSV <Download className="h-3 w-3" />
                                    </span>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleExport('tasks')}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4"
                            >
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                                    <CheckSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Export Tasks</h3>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Download all task assignments and priorities.</p>
                                    <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                                        Download CSV <Download className="h-3 w-3" />
                                    </span>
                                </div>
                            </button>

                        </div>
                     </div>
                </main>
            </div>
        </div>
    );
};
