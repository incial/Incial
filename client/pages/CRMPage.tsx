
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CRMFilters } from '../components/crm/CRMFilters';
import { CRMTable } from '../components/crm/CRMTable';
import { CRMStats } from '../components/crm/CRMStats';
import { CRMForm } from '../components/crm/CRMForm';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { FilterState, CRMEntry, CRMStatus } from '../types';
import { Plus } from 'lucide-react';
import { crmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CRMPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<CRMEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CRMEntry | undefined>(undefined);
  
  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    assignedTo: '',
    search: '',
    dateRangeStart: '',
    dateRangeEnd: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await crmApi.getAll();
      setEntries(response.crmList);
    } catch (error) {
      console.error("Failed to fetch CRM data", error);
      showToast("Failed to load CRM data", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side Filtering
  const filteredData = useMemo(() => {
    const result = entries.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.contactName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(filters.search.toLowerCase()));

      let matchesStatus = true;
      if (filters.status === 'ALL') {
         matchesStatus = true;
      } else if (filters.status === '') {
         matchesStatus = !['drop', 'completed', 'onboarded'].includes(item.status);
      } else {
         matchesStatus = item.status === filters.status;
      }

      const matchesAssignee = filters.assignedTo === '' || item.assignedTo === filters.assignedTo;
      const matchesDate = filters.dateRangeStart === '' || (item.nextFollowUp && item.nextFollowUp >= filters.dateRangeStart);

      return matchesSearch && matchesStatus && matchesAssignee && matchesDate;
    });

    return result.sort((a, b) => b.id - a.id);
  }, [entries, filters]);

  // CRUD Handlers
  const handleCreate = () => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: CRMEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (id: number) => {
      setDeleteId(id);
  };

  const confirmDelete = async () => {
      if(!deleteId) return;
      
      const id = deleteId;
      // Optimistic Update
      setEntries(entries.filter(e => e.id !== id));
      setDeleteId(null);
      
      try {
        await crmApi.delete(id);
        showToast("Deal removed successfully", 'success');
      } catch (e) {
        showToast("Failed to delete item", 'error');
        fetchData();
      }
  };

  const handleSave = async (data: Partial<CRMEntry>) => {
      const auditData = {
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      const finalData = { ...data, ...auditData };

      try {
          if (editingEntry) {
              const updatedEntry = { ...editingEntry, ...finalData } as CRMEntry;
              setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)); // Optimistic
              await crmApi.update(updatedEntry.id, finalData);
              showToast("Deal details updated", 'success');
          } else {
              const newEntry = await crmApi.create(finalData as CRMEntry);
              setEntries([newEntry, ...entries]);
              showToast("New deal added to pipeline", 'success');
          }
      } catch (e) {
          console.error("Failed to save", e);
          showToast("Failed to save deal", 'error');
          fetchData(); // Revert on error
      }
  };

  const handleStatusChange = async (entry: CRMEntry, newStatus: CRMStatus) => {
      const updatedEntry = { 
          ...entry, 
          status: newStatus,
          lastUpdatedBy: user?.name || 'Unknown',
          lastUpdatedAt: new Date().toISOString()
      };
      
      // Optimistic Update
      setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
      
      try {
          await crmApi.update(entry.id, { 
              status: newStatus,
              lastUpdatedBy: user?.name || 'Unknown',
              lastUpdatedAt: new Date().toISOString()
          });
          showToast(`Status updated to ${newStatus}`, 'success');
      } catch (e) {
          showToast("Failed to update status", 'error');
          fetchData(); // Revert
      }
  };

  const itemToDeleteName = useMemo(() => {
      if (!deleteId) return '';
      const item = entries.find(e => e.id === deleteId);
      return item ? item.company : '';
  }, [deleteId, entries]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pipeline Dashboard</h1>
                <p className="text-gray-500 mt-1 font-medium">Track and manage your customer relationships.</p>
             </div>
             
             <button 
                onClick={handleCreate}
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
             >
                <Plus className="h-5 w-5" />
                Add New Deal
             </button>
          </div>

          <CRMStats entries={entries} />

          <div className="bg-white rounded-[2.5rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col flex-1 overflow-hidden relative">
            <CRMFilters 
                filters={filters} 
                setFilters={setFilters} 
                onRefresh={fetchData} 
            />
            
            <div className="flex-1 overflow-auto bg-white">
                <CRMTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    onView={handleEdit} 
                    onDelete={handleRequestDelete}
                    onStatusChange={handleStatusChange}
                />
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-bold text-gray-400 flex justify-between uppercase tracking-wider rounded-b-[2.5rem]">
                <span>Showing {filteredData.length} records</span>
                <span>Sorted by Newest</span>
            </div>
          </div>
        </main>

        <CRMForm 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSave}
            initialData={editingEntry}
        />

        <DeleteConfirmationModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={confirmDelete}
            title="Delete Deal"
            itemName={itemToDeleteName}
        />
      </div>
    </div>
  );
};
