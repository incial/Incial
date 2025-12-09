
import React, { useState, useEffect } from 'react';
import { X, Save, Building, Hash, Check, History, HardDrive, Globe, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, User } from 'lucide-react';
import { CRMEntry, CRMStatus, SocialLinks } from '../../types';
import { getWorkTypeStyles } from '../../utils';

interface CompaniesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
}

const WORK_TYPES = [
  "Marketing", "Website", "Poster", "Video", "VFX", 
  "LinkedIn", "Other", "Ads", "Branding", "UI/UX"
];

// Restricted statuses allowed for "Companies" view
const STATUS_OPTIONS: { label: string; value: CRMStatus }[] = [
    { label: "On Progress", value: "on progress" },
    { label: "Onboarded", value: "onboarded" },
    { label: "Quote Sent", value: "Quote Sent" },
    { label: "Completed", value: "completed" },
    { label: "Dropped", value: "drop" },
];

export const CompaniesForm: React.FC<CompaniesFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  
  useEffect(() => {
    if (isOpen && initialData) {
        setFormData(initialData);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.status) {
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

  const updateSocials = (key: keyof SocialLinks, value: string) => {
    setFormData(prev => ({
        ...prev,
        socials: {
            ...prev.socials,
            [key]: value
        }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Edit Company Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-white custom-scrollbar">
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
                                placeholder="Auto-generated"
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
                                value={formData.company || ''} 
                                onChange={e => setFormData({...formData, company: e.target.value})}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Person (Full Width) */}
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Contact Person</label>
                    <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                            value={formData.contactName || ''} 
                            onChange={e => setFormData({...formData, contactName: e.target.value})}
                            placeholder="Primary Contact Name"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-3">
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
                </div>

                {/* Drive Link Input */}
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-gray-500" /> Google Drive Link
                    </label>
                    <input 
                        type="url" 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.driveLink || ''} 
                        onChange={e => setFormData({...formData, driveLink: e.target.value})} 
                        placeholder="https://drive.google.com/..."
                    />
                </div>

                {/* Social Media Inputs */}
                <div className="w-full border-t border-gray-100 pt-4 mt-2">
                    <label className="block mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Online Presence</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="Website URL"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.website || ''}
                                onChange={e => updateSocials('website', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="LinkedIn URL"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.linkedin || ''}
                                onChange={e => updateSocials('linkedin', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="Instagram URL"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.instagram || ''}
                                onChange={e => updateSocials('instagram', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="Facebook URL"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.facebook || ''}
                                onChange={e => updateSocials('facebook', e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="Twitter (X) URL"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.twitter || ''}
                                onChange={e => updateSocials('twitter', e.target.value)}
                            />
                        </div>
                         <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="Other Link"
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={formData.socials?.other || ''}
                                onChange={e => updateSocials('other', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Update History Footer */}
                {formData.lastUpdatedBy && (
                    <div className="flex items-center justify-end pt-4 mt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <History className="h-3.5 w-3.5" />
                            <span>
                                Last updated by <span className="font-semibold text-gray-600">{formData.lastUpdatedBy}</span> on {new Date(formData.lastUpdatedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-brand-500/30">
                        <Save className="h-4 w-4" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
