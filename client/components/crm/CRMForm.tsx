import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, User, Phone, Mail, Calendar, Briefcase, FileText, Tag, DollarSign, CheckCircle, Clock, AlertCircle, History, ExternalLink, HardDrive, Linkedin, Instagram, Facebook, Twitter, Globe, Link as LinkIcon, Maximize2, Minimize2, MapPin, Hash, Building, Megaphone, Plus, Image } from 'lucide-react';
import { CRMEntry, SocialLinks, CRMStatus, User as UserType } from '../../types';
import { getStatusStyles, formatDate, getFollowUpColor, formatMoney, getWorkTypeStyles, formatDateTime } from '../../utils';
import { CustomDatePicker } from '../ui/CustomDatePicker';
import { CustomSelect } from '../ui/CustomSelect';
import { UserSelect } from '../ui/UserSelect';
import { usersApi } from '../../services/api';

interface CRMFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CRMEntry>) => void;
  initialData?: CRMEntry;
}

const STATUS_OPTIONS: { label: string; value: CRMStatus }[] = [
    { label: 'Lead', value: 'lead' },
    { label: 'On Progress', value: 'on progress' },
    { label: 'Quote Sent', value: 'Quote Sent' },
    { label: 'Onboarded', value: 'onboarded' },
    { label: 'Completed', value: 'completed' },
    { label: 'Dropped', value: 'drop' },
];

const SOURCE_OPTIONS = [
    { label: 'Website', value: 'Website' },
    { label: 'Referral', value: 'Referral' },
    { label: 'LinkedIn', value: 'LinkedIn' },
    { label: 'Cold Call', value: 'Cold Call' },
    { label: 'Email Campaign', value: 'Email Campaign' },
    { label: 'Google Ads', value: 'Google Ads' },
    { label: 'Event', value: 'Event' },
];

const PREDEFINED_TAGS = ['Lead', 'Customer', 'VIP', 'Follow-up', 'Cold', 'Hot', 'Inactive', 'Partner'];
const PREDEFINED_WORK = ['branding', 'poster', 'video', 'design', 'ui ux', 'shopify', 'website', 'marketing', 'software', 'consulting', 'development'];

export const CRMForm: React.FC<CRMFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<CRMEntry>>({});
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  
  // Custom input states
  const [customTag, setCustomTag] = useState('');
  const [customWork, setCustomWork] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await usersApi.getAll();
            setUsers(fetchedUsers);
        } catch (e) {
            console.error("Failed to fetch assignees", e);
        }
    };
    if (isOpen) {
        fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
            setMode('view');
        } else {
            setFormData({
                company: '',
                contactName: '',
                email: '',
                phone: '',
                status: 'lead',
                assignedTo: '',
                dealValue: 0,
                tags: [],
                work: [],
                leadSources: [],
                driveLink: '',
                address: '',
                referenceId: '',
                companyImageUrl: '',
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

  const addCustomTag = () => {
      if (!customTag.trim()) return;
      const currentTags = formData.tags || [];
      if (!currentTags.includes(customTag.trim())) {
          setFormData(prev => ({ ...prev, tags: [...currentTags, customTag.trim()] }));
      }
      setCustomTag('');
  };

  const toggleWork = (workLabel: string) => {
      const currentWork = formData.work || [];
      const cleanWork = currentWork.filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
      
      const exists = cleanWork.includes(workLabel);
      
      if (exists) {
          setFormData(prev => ({ ...prev, work: cleanWork.filter(w => w !== workLabel) }));
      } else {
          setFormData(prev => ({ ...prev, work: [...cleanWork, workLabel] }));
      }
  };

  const addCustomWork = () => {
      if (!customWork.trim()) return;
      const currentWork = formData.work || [];
      const cleanWork = currentWork.filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
      if (!cleanWork.includes(customWork.trim())) {
          setFormData(prev => ({ ...prev, work: [...cleanWork, customWork.trim()] }));
      }
      setCustomWork('');
  };

  const updateLeadSource = (source: string) => {
      setFormData(prev => ({ ...prev, leadSources: [source] }));
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

  // --- Render View ---
  const renderView = () => (
    <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                        {formData.companyImageUrl ? (
                            <img src={formData.companyImageUrl} alt={formData.company} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                            <Building className="h-8 w-8 text-gray-300" />
                        )}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900 break-words">{formData.company}</h2>
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
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm capitalize ${getStatusStyles(formData.status || '')}`}>
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
                            {formData.assignedTo?.[0] || '?'}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{formData.assignedTo || 'Unassigned'}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow Up</p>
                    <div className={`flex items-center gap-1.5 font-semibold text-sm ${getFollowUpColor(formData.nextFollowUp || '')}`}>
                        <Calendar className="h-4 w-4" />
                        {formatDate(formData.nextFollowUp || '')}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last Contact</p>
                    <p className="text-gray-700 font-medium text-sm">{formatDate(formData.lastContact || '')}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-600" /> Contact Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{formData.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{formData.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{formData.address || 'No address'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-brand-600" /> Socials & Web
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {formData.socials && Object.entries(formData.socials).map(([key, val]) => {
                            if (!val) return null;
                            return (
                                <a key={key} href={val} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:text-brand-600 hover:border-brand-200 transition-colors capitalize flex items-center gap-1.5">
                                    <ExternalLink className="h-3 w-3" /> {key}
                                </a>
                            );
                        })}
                        {(!formData.socials || !Object.values(formData.socials).some(Boolean)) && (
                            <span className="text-gray-400 text-sm italic">No social links added</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-brand-600" /> Classification
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Lead Source</p>
                            {formData.leadSources && formData.leadSources.length > 0 ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 border border-gray-200 inline-block">
                                    {formData.leadSources[0]}
                                </span>
                            ) : <span className="text-gray-400 text-xs">-</span>}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Work Type</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(formData.work || []).filter(Boolean).map((w: any) => {
                                    const label = (w && typeof w === 'object') ? w.name : w;
                                    return <span key={label} className={`px-2 py-1 text-[10px] font-bold rounded border ${getWorkTypeStyles(label)}`}>{label}</span>;
                                })}
                                {(!formData.work?.length) && <span className="text-gray-400 text-xs">-</span>}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(formData.tags || []).map(t => (
                                    <span key={t} className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded border border-purple-100">{t}</span>
                                ))}
                                {(!formData.tags?.length) && <span className="text-gray-400 text-xs">-</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-600" /> Notes
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap min-h-[80px]">
                        {formData.notes || <span className="text-gray-400 italic">No notes added.</span>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  // --- Render Edit ---
  const renderEdit = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Client / Company <span className="text-red-500">*</span></label>
                <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" required className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                        value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Company Name" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Company Logo URL</label>
                <div className="relative">
                    <Image className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="url" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.companyImageUrl || ''} onChange={e => setFormData({...formData, companyImageUrl: e.target.value})} placeholder="https://example.com/logo.png" />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Contact Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} placeholder="Full Name" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="email" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="tel" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 00000 00000" />
                </div>
            </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomSelect label="Status" value={formData.status || 'lead'} onChange={(val) => setFormData({...formData, status: val as CRMStatus})} options={STATUS_OPTIONS} />
                <UserSelect label="Assigned To" value={formData.assignedTo || ''} onChange={(val) => setFormData({...formData, assignedTo: val})} users={users} />
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Value (₹)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input type="number" className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            value={formData.dealValue || ''} onChange={e => setFormData({...formData, dealValue: parseFloat(e.target.value) || 0})} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="col-span-1">
                    <CustomDatePicker 
                        label="Last Contact Date" 
                        value={formData.lastContact || ''} 
                        onChange={(date) => setFormData({...formData, lastContact: date})} 
                    />
                </div>
                <div className="col-span-1">
                    <CustomDatePicker 
                        label="Next Follow Up" 
                        value={formData.nextFollowUp || ''} 
                        onChange={(date) => setFormData({...formData, nextFollowUp: date})} 
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <CustomSelect 
                    label="Lead Source"
                    value={formData.leadSources && formData.leadSources.length > 0 ? formData.leadSources[0] : ''}
                    onChange={(val) => updateLeadSource(val)}
                    options={SOURCE_OPTIONS}
                    allowCustom={true}
                    placeholder="Select or type source..."
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" /> Work Type
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_WORK.map(opt => {
                        const cleanWork = (formData.work || []).filter(Boolean).map((w: any) => (w && typeof w === 'object') ? w.name : w);
                        const isSelected = cleanWork.includes(opt);
                        return (
                            <button key={opt} type="button" onClick={() => toggleWork(opt)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                                {opt}
                            </button>
                        );
                    })}
                    {(formData.work || []).filter(Boolean).filter((w: any) => {
                        const val = (w && typeof w === 'object') ? w.name : w;
                        return val && !PREDEFINED_WORK.includes(val);
                    }).map((opt: any) => {
                        const label = (opt && typeof opt === 'object') ? opt.name : opt;
                        if (!label) return null;
                        return (
                            <button key={label} type="button" onClick={() => toggleWork(label)}
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg border bg-brand-50 text-brand-700 border-brand-200 ring-2 ring-brand-500">
                                {label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Add custom work..." className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        value={customWork} onChange={e => setCustomWork(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomWork())} />
                    <button type="button" onClick={addCustomWork} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600"><Plus className="h-5 w-5" /></button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" /> Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {PREDEFINED_TAGS.map(opt => {
                        const isSelected = formData.tags?.includes(opt);
                        return (
                            <button key={opt} type="button" onClick={() => toggleTag(opt)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${isSelected ? 'bg-purple-100 text-purple-700 border-purple-200 ring-2 ring-purple-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                                {opt}
                            </button>
                        );
                    })}
                    {(formData.tags || []).filter(t => !PREDEFINED_TAGS.includes(t)).map(opt => (
                        <button key={opt} type="button" onClick={() => toggleTag(opt)}
                            className="px-3 py-1.5 text-[10px] font-bold rounded-lg border bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-500">
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Add custom tag..." className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} />
                    <button type="button" onClick={addCustomTag} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-600"><Plus className="h-5 w-5" /></button>
                </div>
            </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => initialData ? setMode('view') : onClose()} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg shadow-brand-500/30"><Save className="h-4 w-4" /> Save Changes</button>
        </div>
    </form>
  );

  return (
    <>
        {isNotesExpanded && (
            <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500" /> Notes Editor</h3>
                    <button type="button" onClick={() => setIsNotesExpanded(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"><Minimize2 className="h-4 w-4" /> Done</button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
                    {mode === 'edit' ? (
                        <textarea className="w-full h-full p-4 text-base text-gray-800 bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed" placeholder="Type your notes here..." value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} autoFocus />
                    ) : (
                        <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{formData.notes || <span className="text-gray-400 italic">No notes provided.</span>}</div>
                    )}
                </div>
            </div>
        )}

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 truncate pr-4">{mode === 'view' ? 'Deal Details' : (initialData ? 'Edit Deal' : 'New Deal')}</h2>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {mode === 'view' && (
                            <button onClick={() => setMode('edit')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"><Edit2 className="h-4 w-4" /> Edit</button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="overflow-y-auto p-4 md:p-6 flex-1 custom-scrollbar">
                    {mode === 'view' ? renderView() : renderEdit()}
                </div>
            </div>
        </div>
    </>
  );
};