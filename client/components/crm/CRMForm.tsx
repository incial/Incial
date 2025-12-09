
import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, User, Phone, Mail, Calendar, Briefcase, FileText, Tag, DollarSign, CheckCircle, Clock, AlertCircle, History, ExternalLink, HardDrive, Linkedin, Instagram, Facebook, Twitter, Globe, Link as LinkIcon, Maximize2, Minimize2, MapPin } from 'lucide-react';
import { CRMEntry, SocialLinks } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor, formatMoney } from '../../utils';
import { CustomDatePicker } from '../ui/CustomDatePicker';

interface CRMFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
}

const LEAD_SOURCES = [
  'Google Business',
  'Direct Call',
  'Website',
  'Referral',
  'Social Media',
  'Email Campaign',
  'Cold Call',
  'Event',
  'Partner',
  'Direct Mail'
];

const TAG_OPTIONS = [
  { label: 'Lead', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Customer', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'VIP', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Follow-up', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Cold', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: 'Hot', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Inactive', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { label: 'Partner', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const WORK_OPTIONS = [
  { label: 'branding', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'poster', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { label: 'video', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'design', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'ui ux', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { label: 'shopify', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { label: 'website', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'marketing', color: 'bg-gray-700 text-white border-gray-600' },
  { label: 'Logo design', color: 'bg-gray-200 text-gray-800 border-gray-300' },
  { label: 'software', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { label: 'consulting', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { label: 'development', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
];

export const CRMForm: React.FC<CRMFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
            setMode('view');
        } else {
            // Reset for Create Mode
            setFormData({
                company: '',
                contactName: '',
                email: '',
                phone: '',
                status: 'lead',
                assignedTo: 'Vallapata',
                dealValue: 0,
                tags: [],
                work: [],
                leadSources: [],
                driveLink: '',
                address: '',
                referenceId: '',
                socials: {},
                lastContact: new Date().toISOString().split('T')[0],
                nextFollowUp: new Date().toISOString().split('T')[0],
                notes: '',
            });
            setMode('edit');
        }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const toggleTag = (tag: string) => {
      const currentTags = formData.tags || [];
      if (currentTags.includes(tag)) {
          setFormData(prev => ({ ...prev, tags: currentTags.filter(t => t !== tag) }));
      } else {
          setFormData(prev => ({ ...prev, tags: [...currentTags, tag] }));
      }
  };

  const toggleWork = (workLabel: string) => {
      const currentWork = formData.work || [];
      // Clean up legacy objects if present during edit toggling
      const cleanWork = currentWork.map((w: any) => typeof w === 'object' ? w.name : w);
      
      const exists = cleanWork.includes(workLabel);
      
      if (exists) {
          setFormData(prev => ({ ...prev, work: cleanWork.filter(w => w !== workLabel) }));
      } else {
          setFormData(prev => ({ ...prev, work: [...cleanWork, workLabel] }));
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

  const toggleEdit = () => {
    setMode('edit');
  };

  const handleCancel = () => {
    if (initialData && mode === 'edit') {
        setFormData(initialData);
        setMode('view');
    } else {
        onClose();
    }
  };

  const isView = mode === 'view';

  // --- PREMIUM VIEW RENDERER ---
  const renderView = () => (
    <div className="space-y-6">
        {/* Header Hero */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{formData.company}</h2>
                        {formData.referenceId && (
                            <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 text-xs font-mono font-bold border border-gray-300">
                                {formData.referenceId}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{formData.contactName}</span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${getStatusStyles(formData.status || '')}`}>
                    {formData.status}
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deal Value</p>
                    <p className="text-xl font-bold text-gray-900">{formatMoney(formData.dealValue || 0)}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                            {formData.assignedTo?.[0]}
                        </div>
                        <span className="font-medium text-gray-900">{formData.assignedTo}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow Up</p>
                    <div className={`flex items-center gap-1.5 font-semibold ${getFollowUpColor(formData.nextFollowUp || '')}`}>
                        <Calendar className="h-4 w-4" />
                        {formatDate(formData.nextFollowUp || '')}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last Contact</p>
                    <p className="text-gray-700 font-medium">{formatDate(formData.lastContact || '')}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col: Contact Info & Socials */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-500" /> Contact Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <a href={`tel:${formData.phone}`} className="text-sm font-medium text-brand-600 hover:underline">
                                    {formData.phone || 'N/A'}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <a href={`mailto:${formData.email}`} className="text-sm font-medium text-brand-600 hover:underline">
                                    {formData.email || 'N/A'}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Lead Source</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formData.leadSources?.[0] || 'Unknown'}
                                </p>
                            </div>
                        </div>
                        {formData.address && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium text-gray-900">{formData.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Socials View */}
                {(formData.socials && Object.values(formData.socials).some(Boolean)) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-brand-500" /> Online Presence
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {formData.socials.website && (
                                <a href={formData.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-brand-600 transition-colors">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-sm font-medium">Website</span>
                                </a>
                            )}
                            {formData.socials.linkedin && (
                                <a href={formData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-700 transition-colors">
                                    <Linkedin className="h-4 w-4" />
                                    <span className="text-sm font-medium">LinkedIn</span>
                                </a>
                            )}
                            {formData.socials.instagram && (
                                <a href={formData.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-pink-600 transition-colors">
                                    <Instagram className="h-4 w-4" />
                                    <span className="text-sm font-medium">Instagram</span>
                                </a>
                            )}
                            {formData.socials.facebook && (
                                <a href={formData.socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors">
                                    <Facebook className="h-4 w-4" />
                                    <span className="text-sm font-medium">Facebook</span>
                                </a>
                            )}
                            {formData.socials.twitter && (
                                <a href={formData.socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-sky-500 transition-colors">
                                    <Twitter className="h-4 w-4" />
                                    <span className="text-sm font-medium">Twitter</span>
                                </a>
                            )}
                             {formData.socials.other && (
                                <a href={formData.socials.other} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors col-span-2">
                                    <LinkIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium truncate">{formData.socials.other}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Scope & Tags */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-brand-500" /> Tags & Work
                </h3>
                
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Scope of Work</p>
                    <div className="space-y-2">
                        {formData.work && formData.work.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {formData.work.map((w: any) => {
                                    // Handle both string and legacy object formats
                                    const label = typeof w === 'object' && w !== null ? w.name : w;
                                    const opt = WORK_OPTIONS.find(o => o.label === label);
                                    return (
                                        <div key={label} className={`px-2.5 py-1 text-sm rounded border font-medium capitalize ${opt ? opt.color : 'bg-gray-100 text-gray-700'}`}>
                                            {label}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : <span className="text-sm text-gray-400 italic">No work items selected</span>}
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags && formData.tags.length > 0 ? (
                            formData.tags.map(t => {
                                const opt = TAG_OPTIONS.find(o => o.label === t);
                                return (
                                    <span key={t} className={`px-2 py-0.5 text-xs rounded border font-medium ${opt ? opt.color : 'bg-gray-100'}`}>
                                        {t}
                                    </span>
                                )
                            })
                        ) : <span className="text-sm text-gray-400 italic">No tags</span>}
                    </div>
                </div>

                {formData.driveLink && (
                    <div className="pt-3 border-t border-gray-100">
                        <a 
                            href={formData.driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 -mx-2 rounded-lg transition-colors"
                        >
                            <HardDrive className="h-4 w-4" />
                            Open Project Assets
                            <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                    </div>
                )}
            </div>
        </div>

        {/* Common Notes Area */}
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Notes
                </h3>
                <button 
                    type="button" 
                    onClick={() => setIsNotesExpanded(true)}
                    className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:bg-amber-100 px-2 py-1 rounded transition-colors"
                >
                    <Maximize2 className="h-3 w-3" /> Expand
                </button>
            </div>
            <div className="prose prose-sm text-gray-800 max-w-none whitespace-pre-wrap">
                {formData.notes || <span className="italic text-gray-400">No notes available.</span>}
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
    </div>
  );

  // --- EDIT FORM RENDERER ---
  const renderEditForm = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Contact Information</h3>
               
               <div className="w-full">
                 <label className="block mb-1.5 text-sm font-medium text-gray-700">Company</label>
                 <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                   value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
               </div>

               <div className="w-full">
                 <label className="block mb-1.5 text-sm font-medium text-gray-700">Contact Person</label>
                 <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                   value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
               </div>

               <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Address</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none h-20"
                        placeholder="Full street address..."
                        value={formData.address || ''} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                    />
               </div>

               {/* Social Media Inputs */}
               <div className="pt-4 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Online Presence</h4>
                    <div className="space-y-3">
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
            </div>

            {/* Deal Info */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Deal Details</h3>
                
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Reference ID</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-gray-50 text-gray-600 font-mono text-sm" 
                    placeholder="Auto-generated or Enter ID"
                    value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Deal Value (₹)</label>
                        <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                        value={formData.dealValue} onChange={e => setFormData({...formData, dealValue: Number(e.target.value)})} />
                    </div>

                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                        >
                            <option value="lead">Lead</option>
                            <option value="on progress">On Progress</option>
                            <option value="Quote Sent">Quote Sent</option>
                            <option value="onboarded">Onboarded</option>
                            <option value="completed">Completed</option>
                            <option value="drop">Drop</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Lead Source</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                            value={formData.leadSources?.[0] || ''} 
                            onChange={e => setFormData({...formData, leadSources: [e.target.value]})}
                        >
                            <option value="">Select Source...</option>
                            {LEAD_SOURCES.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Assigned To</label>
                        <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                            value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                        >
                            <option value="Vallapata">Vallapata</option>
                            <option value="John Doe">John Doe</option>
                            <option value="Demo User">Demo User</option>
                            <option value="Admin User">Admin User</option>
                            <option value="Employee User">Employee User</option>
                        </select>
                    </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Last Contact</label>
                        <CustomDatePicker 
                            value={formData.lastContact || ''} 
                            onChange={val => setFormData({...formData, lastContact: val})}
                            placeholder="Select Date"
                        />
                    </div>

                    <div className="w-full">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Next Follow Up</label>
                        <CustomDatePicker 
                            value={formData.nextFollowUp || ''} 
                            onChange={val => setFormData({...formData, nextFollowUp: val})}
                            placeholder="Select Date"
                        />
                    </div>
               </div>
               
               {/* Drive Link Input */}
               <div className="w-full">
                  <label className="block mb-1.5 text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-gray-500" /> Google Drive Link
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none" 
                    value={formData.driveLink || ''} 
                    onChange={e => setFormData({...formData, driveLink: e.target.value})} 
                  />
               </div>
            </div>
        </div>
        
        <div className="space-y-6 border-t border-gray-100 pt-6">
             <div className="w-full">
                 <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Common Notes</label>
                    <button 
                        type="button" 
                        onClick={() => setIsNotesExpanded(true)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
                    >
                        <Maximize2 className="h-3 w-3" /> Expand Editor
                    </button>
                 </div>
                 <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:outline-none h-32 text-gray-700 leading-relaxed shadow-sm resize-none"
                    placeholder="Enter general notes about the deal here..."
                    value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}
                 ></textarea>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map(option => {
                            const isSelected = formData.tags?.includes(option.label);
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => toggleTag(option.label)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                        isSelected
                                            ? option.color + ' ring-2 ring-offset-1 ring-brand-300'
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full">
                    <label className="block mb-1.5 text-sm font-medium text-gray-700">Work Types</label>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {WORK_OPTIONS.map(option => {
                                // Defensive check against legacy objects
                                const currentWork = (formData.work || []).map((w: any) => typeof w === 'object' ? w.name : w);
                                const isSelected = currentWork.includes(option.label);
                                return (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => toggleWork(option.label)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                            isSelected
                                                ? option.color + ' ring-2 ring-offset-1 ring-brand-300'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );

  return (
    <>
        {/* Expanded Notes Overlay */}
        {isNotesExpanded && (
            <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" /> 
                        Common Notes {mode === 'edit' ? '(Editing)' : ''}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsNotesExpanded(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                        >
                            <Minimize2 className="h-4 w-4" /> Done
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                    {mode === 'edit' ? (
                        <textarea 
                            className="w-full h-full p-4 text-base text-gray-800 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed"
                            placeholder="Enter general notes about the deal here..."
                            value={formData.notes || ''}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            autoFocus
                        />
                    ) : (
                        <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {formData.notes || <span className="text-gray-400 italic">No notes available.</span>}
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">
                {initialData ? (isView ? 'Deal Overview' : 'Edit Deal') : 'Create New Deal'}
            </h2>
            <div className="flex items-center gap-2">
                {isView && (
                    <button onClick={toggleEdit} className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
                        <Edit2 className="h-4 w-4" /> Edit Details
                    </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 flex-1 bg-white custom-scrollbar">
                <form onSubmit={handleSubmit}>
                    {isView ? renderView() : renderEditForm()}
                    
                    {/* Footer Actions (Only for Edit Mode or to Close) */}
                    {!isView && (
                        <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-gray-100">
                            <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-brand-500/30">
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
        </div>
    </>
  );
};
