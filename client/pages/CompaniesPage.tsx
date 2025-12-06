
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompaniesFilters } from '../components/companies/CompaniesFilters';
import { CompaniesForm } from '../components/companies/CompaniesForm';
import { Company, CompanyFilterState } from '../types';
import { Plus, Download, Briefcase } from 'lucide-react';
import { companiesApi } from '../services/api';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  
  const [filters, setFilters] = useState<CompanyFilterState>({
    search: '',
    status: '',
    workType: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await companiesApi.getAll();
      setCompanies(data);
      // Sync mock storage
      localStorage.setItem('mock_companies_data', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side Filtering & Sorting
  const filteredData = useMemo(() => {
    let result = companies.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === '' || item.status === filters.status;
      const matchesWork = filters.workType === '' || item.work.includes(filters.workType);

      return matchesSearch && matchesStatus && matchesWork;
    });

    // Default Sort: ID Descending (Newest first)
    return result.sort((a, b) => b.id - a.id);
  }, [companies, filters]);

  // CRUD Handlers
  const handleCreate = () => {
      setEditingCompany(undefined);
      setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
      setEditingCompany(company);
      setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
      if(!window.confirm("Are you sure you want to delete this company?")) return;
      
      // Optimistic Update
      setCompanies(prev => prev.filter(e => e.id !== id));
      
      try {
          await companiesApi.delete(id);
          // Sync simulated storage
          const current = JSON.parse(localStorage.getItem('mock_companies_data') || '[]');
          const updated = current.filter((e: Company) => e.id !== id);
          localStorage.setItem('mock_companies_data', JSON.stringify(updated));
      } catch (err) {
          alert("Failed to delete");
          fetchData(); // Revert
      }
  };

  const handleFormSubmit = async (data: Partial<Company>) => {
      if (editingCompany) {
          // Update
          const updated = { ...editingCompany, ...data } as Company;
          setCompanies(prev => prev.map(e => e.id === updated.id ? updated : e));
          
          await companiesApi.update(updated.id, data);
          
          // Sync Storage
          const current = JSON.parse(localStorage.getItem('mock_companies_data') || '[]');
          const newStore = current.map((e: Company) => e.id === updated.id ? updated : e);
          localStorage.setItem('mock_companies_data', JSON.stringify(newStore));

      } else {
          // Create
          const newEntry = await companiesApi.create(data as Company); 
          setCompanies(prev => [newEntry, ...prev]);
          
          // Sync Storage
          const current = JSON.parse(localStorage.getItem('mock_companies_data') || '[]');
          localStorage.setItem('mock_companies_data', JSON.stringify([newEntry, ...current]));
      }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
          
          <div className="flex justify-between items-end mb-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                    <Briefcase className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Companies</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your client registry and project statuses.</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-sm border border-gray-200 transition-all">
                    <Download className="h-4.5 w-4.5" />
                    Export
                </button>
                <button 
                    onClick={handleCreate}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus className="h-5 w-5" />
                    New Company
                </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col flex-1 overflow-hidden">
            <CompaniesFilters filters={filters} setFilters={setFilters} onRefresh={fetchData} />
            <div className="flex-1 overflow-auto bg-white">
                <CompaniesTable 
                    data={filteredData} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            <div className="p-4 border-t border-gray-50 bg-white text-xs font-medium text-gray-400 flex justify-between rounded-b-3xl">
                <span>Showing {filteredData.length} companies</span>
                <span>WorkHub CRM v1.2</span>
            </div>
          </div>
        </main>
      </div>

      <CompaniesForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingCompany}
      />
    </div>
  );
};
