
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const getFollowUpColor = (dateString: string) => {
  if (!dateString) return 'text-gray-500';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate < today) return 'text-red-600 font-semibold';
  if (checkDate.getTime() === today.getTime()) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
};

export const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'onboarded': return 'bg-green-100 text-green-700 border-green-200';
    case 'drop': return 'bg-red-100 text-red-700 border-red-200';
    case 'on progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'quote sent': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'lead': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

// --- COMPANIES MODULE UTILS ---

export const getCompanyStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'running': return 'bg-green-100 text-green-700 ring-green-600/20';
    case 'not_started': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
    case 'discontinued': return 'bg-red-100 text-red-700 ring-red-600/20';
    case 'completed': return 'bg-purple-100 text-purple-700 ring-purple-600/20';
    default: return 'bg-gray-100 text-gray-600 ring-gray-500/10';
  }
};

export const getWorkTypeStyles = (work: string) => {
  const map: Record<string, string> = {
    'Marketing': 'bg-red-100 text-red-700 border-red-200',
    'Website': 'bg-orange-100 text-orange-700 border-orange-200',
    'Poster': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Video': 'bg-green-100 text-green-700 border-green-200',
    'VFX': 'bg-blue-100 text-blue-700 border-blue-200',
    'LinkedIn': 'bg-sky-100 text-sky-700 border-sky-200',
    'Other': 'bg-gray-100 text-gray-700 border-gray-200',
    'Ads': 'bg-purple-100 text-purple-700 border-purple-200',
    'Branding': 'bg-rose-100 text-rose-800 border-rose-200',
    'UI/UX': 'bg-slate-200 text-slate-800 border-slate-300'
  };
  return map[work] || 'bg-gray-100 text-gray-700 border-gray-200';
};
