
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesFilters } from '../components/companies/CompaniesFilters';
import { CompanyDetailsModal } from '../components/companies/CompanyDetailsModal';
import { CompaniesForm } from '../components/companies/CompaniesForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CRMEntry, CompanyFilterState } from '../types';
import { Briefcase, Building, Archive, CheckCircle } from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const [crmEntries, setCrmEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'dropped' | 'past'>('active');
  const [viewingCompany, setViewingCompany] = useState<CRMEntry | undefined>(undefined);
  const [editingCompany, setEditingCompany] = useState<CRMEntry | undefined>(undefined);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [filters, setFilters] = useState<CompanyFilterState>({
    search: '',
    status: '',
    workType: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const crmData = await crmApi.getAll();
      setCrmEntries(crmData.crmList);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter out Leads - We only want "Companies"
  // Rule: Exclude 'lead' status.
  const allCompanies = useMemo(() => {
    return crmEntries.filter(entry => entry.status !== 'lead');
  }, [crmEntries]);

  // Separate into Active, Dropped, and Past
  const categorizedData = useMemo(() => {
      const active = allCompanies.filter(c => 
          ['onboarded', 'on progress', 'Quote Sent'].includes(c.status)
      );
      const dropped = allCompanies.filter(c => c.status === 'drop');
      const past = allCompanies.filter(c => c.status === 'completed');
      return { active, dropped, past };
  }, [allCompanies]);

  // Filtering & Sorting
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

    // Default Sort: ID Descending (Newest first)
    return result.sort((a, b) => b.id - a.id);
  }, [categorizedData, activeTab, filters]);

  const handleEdit = (company: CRMEntry) => {
      setEditingCompany(company);
      setIsViewModalOpen(false); // Close view modal if open
      setIsEditModalOpen(true);
  };

  const handleUpdateCompany = async (updatedData: Partial<CRMEntry>) => {
      if (editingCompany) {
          // Update Existing
          const updatedEntry: CRMEntry = {
              ...editingCompany,
              ...updatedData,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          };
          
          const newEntries = crmEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
          setCrmEntries(newEntries);
          await crmApi.update(updatedEntry.id, updatedEntry);
          localStorage.setItem('mock_crm_data', JSON.stringify(newEntries));
      }
      setIsEditModalOpen(false);
  };

  const handleView = (company: CRMEntry) => {
      setViewingCompany(company);
      setIsViewModalOpen(true);
  };

  const handleRequestDelete = (id: number) => {
      setDeleteId(id);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      const id = deleteId;
      
      // Optimistic Update
      const newEntries = crmEntries.filter(e => e.id !== id);
      setCrmEntries(newEntries);
      setDeleteId(null);

      try {
          await crmApi.delete(id);
          localStorage.setItem('mock_crm_data', JSON.stringify(newEntries));
      } catch (err) {
          alert("Failed to delete");
          fetchData(); // Revert
      }
  };

  const getTabLabel = () => {
      switch(activeTab) {
          case 'active': return 'active';
          case 'dropped': return 'dropped';
          case 'past': return 'past work';
          default: return 'records';
      }
  }

  // Helper to get name for delete modal
  const itemToDeleteName = useMemo(() => {
      if (!deleteId) return '';
      const item = crmEntries.find(e => e.id === deleteId);
      return item ? item.company : '';
  }, [deleteId, crmEntries]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Companies Registry</h1>
                    <p className="text-gray-500 mt-1 font-medium">Unified directory of all active accounts and past projects.</p>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'active' 
                        ? 'bg-white text-brand-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                    <Building className="h-4 w-4" />
                    Active Companies
                    <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md text-xs border border-brand-100 ml-1">
                        {categorizedData.active.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('past')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'past' 
                        ? 'bg-white text-purple-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                    <CheckCircle className="h-4 w-4" />
                    Past Works
                    <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-xs border border-purple-100 ml-1">
                        {categorizedData.past.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveTab('dropped')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === 'dropped' 
                        ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                >
                    <Archive className="h-4 w-4" />
                    Dropped Firms
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs border border-gray-200 ml-1">
                        {categorizedData.dropped.length}
                    </span>
                </button>
            </div>

            <CompaniesFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            
            <div className="flex-1 overflow-auto bg-white">
                <CompaniesTable 
                    data={displayData} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleRequestDelete}
                />
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between">
                <span>
                    Showing {displayData.length} {getTabLabel()} records
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
            message="Are you sure you want to remove this company? This will also remove the associated deal from the CRM."
            itemName={itemToDeleteName}
        />
      </div>
    </div>
  );
};
