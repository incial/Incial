
import React, { useState, useEffect } from 'react';
import { X, Save, Building, Hash, Check } from 'lucide-react';
import { Company, CompanyStatus } from '../../types';
import { getWorkTypeStyles } from '../../utils';

interface CompaniesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Company>) => void;
  initialData?: Company;
}

const WORK_TYPES = [
  "Marketing", "Website", "Poster", "Video", "VFX", 
  "LinkedIn", "Other", "Ads", "Branding", "UI/UX"
];

const STATUS_OPTIONS: { label: string; value: CompanyStatus }[] = [
    { label: "Running", value: "running" },
    { label: "Not Started", value: "not_started" },
    { label: "Completed", value: "completed" },
    { label: "Discontinued", value: "discontinued" },
];

export const CompaniesForm: React.FC<CompaniesFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Company>>({});
  
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset for Create Mode
            setFormData({
                name: '',
                referenceId: `REF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                work: [],
                status: 'not_started',
            });
        }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.status) {
        alert("Please fill in required fields");
        return;
    }
    onSubmit(formData);
    onClose();
  };

  const toggleWork = (type: string) => {
      const current = formData.work || [];
      if (current.includes(type)) {
          setFormData(prev => ({ ...prev, work: current.filter(t => t !== type) }));
      } else {
          setFormData(prev => ({ ...prev, work: [...current, type] }));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Reference ID & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Reference ID</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                required 
                                type="text" 
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-gray-50 font-mono text-sm" 
                                value={formData.referenceId || ''} 
                                onChange={e => setFormData({...formData, referenceId: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Client Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                             <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                required 
                                type="text" 
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                                value={formData.name || ''} 
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({...formData, status: opt.value})}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    formData.status === opt.value
                                    ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-gray-50'
                                }`}
                            >
                                {opt.label}
                                {formData.status === opt.value && <Check className="h-3.5 w-3.5" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Work Tags */}
                <div className="w-full">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Work Types <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        {WORK_TYPES.map(type => {
                            const isSelected = formData.work?.includes(type);
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleWork(type)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm ${
                                        isSelected
                                            ? getWorkTypeStyles(type) + ' ring-2 ring-offset-1 ring-current opacity-100'
                                            : 'bg-white text-gray-500 border-gray-200 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                    {(!formData.work || formData.work.length === 0) && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            ⚠️ Please select at least one work type.
                        </p>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-brand-500/30">
                        <Save className="h-4 w-4" /> Save Company
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
