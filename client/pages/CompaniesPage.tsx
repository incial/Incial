
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesFilters } from '../components/companies/CompaniesFilters';
import { CompanyDetailsModal } from '../components/companies/CompanyDetailsModal';
import { CompaniesForm } from '../components/companies/CompaniesForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CRMEntry, CompanyFilterState, CRMStatus } from '../types';
import { Briefcase, Building, Archive, CheckCircle } from 'lucide-react';
import { companiesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [crmEntries, setCrmEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'dropped' | 'past'>('active');
  const [viewingCompany, setViewingCompany] = useState<CRMEntry | undefined>(undefined);
  const [editingCompany, setEditingCompany] = useState<CRMEntry | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<CompanyFilterState>({
    search: '',
    status: '',
    workType: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await companiesApi.getAll();
      setCrmEntries(data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      showToast("Failed to load companies", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allCompanies = useMemo(() => {
    return crmEntries.filter(entry => entry.status !== 'lead');
  }, [crmEntries]);

  const categorizedData = useMemo(() => {
      const active = allCompanies.filter(c => ['onboarded', 'on progress', 'Quote Sent'].includes(c.status));
      const dropped = allCompanies.filter(c => c.status === 'drop');
      const past = allCompanies.filter(c => c.status === 'completed');
      return { active, dropped, past };
  }, [allCompanies]);

  const displayData = useMemo(() => {
    let sourceList = categorizedData.active;
    if (activeTab === 'dropped') sourceList = categorizedData.dropped;
    if (activeTab === 'past') sourceList = categorizedData.past;

    let result = sourceList.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.contactName && item.contactName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.referenceId && item.referenceId.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === '' || item.status === filters.status;
      const matchesWork = filters.workType === '' || item.work.includes(filters.workType);

      return matchesSearch && matchesStatus && matchesWork;
    });

    return result.sort((a, b) => b.id - a.id);
  }, [categorizedData, activeTab, filters]);

  const handleEdit = (company: CRMEntry) => {
      setEditingCompany(company);
      setIsViewModalOpen(false);
      setIsEditModalOpen(true);
  };

  const handleUpdateCompany = async (updatedData: Partial<CRMEntry>) => {
      if (editingCompany) {
          const updatedEntry: CRMEntry = {
              ...editingCompany,
              ...updatedData,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          };
          setCrmEntries(crmEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
          setIsEditModalOpen(false);
          try {
            await companiesApi.update(updatedEntry.id, updatedEntry);
            showToast("Company details updated", "success");
          } catch(e) {
            fetchData();
            showToast("Failed to update company", "error");
          }
      }
  };

  const handleStatusChange = async (company: CRMEntry, newStatus: CRMStatus) => {
      const updatedEntry = {
          ...company,
          status: newStatus,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      setCrmEntries(prev => prev.map(e => e.id === company.id ? updatedEntry : e));
      try {
          await companiesApi.update(company.id, updatedEntry);
          showToast(`Status updated to ${newStatus}`, "success");
      } catch (e) {
          fetchData();
          showToast("Failed to update status", "error");
      }
  };

  const handleView = (company: CRMEntry) => {
      setViewingCompany(company);
      setIsViewModalOpen(true);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      const id = deleteId;
      setCrmEntries(crmEntries.filter(e => e.id !== id));
      setDeleteId(null);
      try {
          console.warn("Delete action requested. Ensure backend permissions.");
      } catch (err) {
          fetchData();
      }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Companies Registry</h1>
                    <p className="text-gray-500 mt-1 font-medium">Unified directory of all active accounts and past projects.</p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
            
            {/* Premium Tab Bar */}
            <div className="px-6 pt-6 pb-2 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'active' 
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <Building className="h-4 w-4" />
                        Active
                        <span className={`px-2 py-0.5 rounded-md text-xs border ml-1 ${activeTab === 'active' ? 'bg-gray-50 border-gray-200' : 'bg-gray-200 border-transparent'}`}>
                            {categorizedData.active.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'past' 
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Past Works
                        <span className={`px-2 py-0.5 rounded-md text-xs border ml-1 ${activeTab === 'past' ? 'bg-gray-50 border-gray-200' : 'bg-gray-200 border-transparent'}`}>
                            {categorizedData.past.length}
                        </span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('dropped')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'dropped' 
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <Archive className="h-4 w-4" />
                        Archived
                        <span className={`px-2 py-0.5 rounded-md text-xs border ml-1 ${activeTab === 'dropped' ? 'bg-gray-50 border-gray-200' : 'bg-gray-200 border-transparent'}`}>
                            {categorizedData.dropped.length}
                        </span>
                    </button>
                </div>
            </div>

            <CompaniesFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            
            <div className="flex-1 overflow-auto bg-white">
                <CompaniesTable 
                    data={displayData} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={(id) => setDeleteId(id)}
                    onStatusChange={handleStatusChange}
                />
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between rounded-b-[2.5rem]">
                <span>
                    Showing {displayData.length} records
                </span>
                <span>Synced with CRM</span>
            </div>
          </div>
        </main>

        <CompanyDetailsModal 
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            onEdit={handleEdit}
            company={viewingCompany}
        />
        
        <CompaniesForm
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateCompany}
            initialData={editingCompany}
        />

        <DeleteConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Remove Company"
            message="Are you sure you want to remove this company?"
        />
      </div>
    </div>
  );
};
