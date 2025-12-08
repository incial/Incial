
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import { crmApi } from '../services/api';
import { CRMEntry } from '../types';
import { ListTodo, ArrowRight, Search, Building } from 'lucide-react';

export const ClientTrackerPage: React.FC = () => {
  const [companies, setCompanies] = useState<CRMEntry[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await crmApi.getAll();
        // Filter for active companies only
        const active = data.crmList.filter(c => ['onboarded', 'on progress', 'Quote Sent'].includes(c.status));
        setCompanies(active);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <ListTodo className="h-8 w-8 text-brand-600" /> Client Tracker
                </h1>
                <p className="text-gray-500 mt-2 text-lg">Select a client to manage their specific task board.</p>
             </div>
             
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
             </div>
           </div>

           {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(client => (
                    <Link 
                        key={client.id} 
                        to={`/client-tracker/${client.id}`}
                        className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-brand-200 transition-colors">
                                <Building className="h-6 w-6 text-gray-400 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{client.company}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{client.notes || 'No description available.'}</p>
                        
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                {client.status}
                            </span>
                        </div>
                    </Link>
                ))}
                
                {filteredCompanies.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        No clients found matching your search.
                    </div>
                )}
             </div>
           )}
        </main>
      </div>
    </div>
  );
};
