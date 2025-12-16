
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  // Check for YYYY-MM-DD format (Task Due Dates, CRM Followups) - Treat as plain date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d); // Local midnight construction to preserve date
      return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  // ISO Strings (Timestamps)
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'Asia/Kolkata' 
  }).format(date);
};

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  // Display time in IST (Asia/Kolkata) to match backend data
  return new Intl.DateTimeFormat('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata' 
  }).format(date);
};

export const getFollowUpColor = (dateString: string) => {
  if (!dateString) return 'text-gray-500';
  
  // Get Today in IST as YYYY-MM-DD
  const todayISTStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  
  // Parse Today IST to a local Date object for comparison
  const [ty, tm, td] = todayISTStr.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);
  today.setHours(0, 0, 0, 0);
  
  // Parse input date
  let checkDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [y, m, d] = dateString.split('-').map(Number);
      checkDate = new Date(y, m - 1, d);
  } else {
      // If it's a timestamp, convert to IST date string first then parse
      const istStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(dateString));
      const [y, m, d] = istStr.split('-').map(Number);
      checkDate = new Date(y, m - 1, d);
  }
  checkDate.setHours(0, 0, 0, 0);

  if (checkDate < today) return 'text-red-600 font-semibold';
  if (checkDate.getTime() === today.getTime()) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
};

export const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'onboarded': return 'bg-green-100 text-green-700 border-green-200';
    case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'drop': return 'bg-red-100 text-red-700 border-red-200';
    case 'on progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'quote sent': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'lead': return 'bg-gray-100 text-gray-700 border-gray-200';
    // Default fallback for custom statuses
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// --- COMPANIES MODULE UTILS ---

export const getCompanyStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    // Company Specific
    case 'running': return 'bg-green-100 text-green-700 ring-green-600/20';
    case 'not_started': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
    case 'discontinued': return 'bg-red-100 text-red-700 ring-red-600/20';
    case 'completed': return 'bg-purple-100 text-purple-700 ring-purple-600/20';
    
    // CRM Inherited
    case 'onboarded': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
    case 'drop': return 'bg-rose-100 text-rose-700 ring-rose-600/20';
    case 'on progress': return 'bg-amber-100 text-amber-700 ring-amber-600/20';
    case 'quote sent': return 'bg-sky-100 text-sky-700 ring-sky-600/20';
    case 'lead': return 'bg-slate-100 text-slate-700 ring-slate-600/20';

    // Fallback for custom
    default: return 'bg-slate-50 text-slate-600 ring-slate-500/10';
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

// --- TASKS MODULE UTILS ---

export const getTaskStatusStyles = (status: string) => {
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === 'completed' || lowerStatus === 'done') return 'bg-green-100 text-green-700 border-green-200';
  if (lowerStatus === 'posted') return 'bg-sky-100 text-sky-700 border-sky-200';
  if (lowerStatus === 'in review') return 'bg-purple-100 text-purple-700 border-purple-200';
  if (lowerStatus === 'in progress') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (lowerStatus === 'dropped') return 'bg-red-100 text-red-700 border-red-200';
  if (lowerStatus === 'not started') return 'bg-gray-100 text-gray-700 border-gray-200';
  
  // Custom fallback
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export const getTaskPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-50 text-red-700 border-red-100';
    case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    default: return 'bg-gray-50 text-gray-600';
  }
};

// --- MEETING MODULE UTILS ---

export const getMeetingStatusStyles = (status: string) => {
  switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Postponed': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// --- GENERAL HELPERS ---

export const isRecentlyUpdated = (dateString?: string, seconds: number = 10): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    // Check diff in seconds
    const diff = (now.getTime() - date.getTime()) / 1000;
    return diff < seconds;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        let value = row[fieldName];
        // Handle null/undefined
        if (value === null || value === undefined) value = '';
        // Handle strings with commas or newlines, arrays, objects
        if (typeof value === 'string') {
            value = `"${value.replace(/"/g, '""')}"`; // Escape quotes
        } else if (Array.isArray(value)) {
            value = `"${value.join('; ')}"`;
        } else if (typeof value === 'object' && value !== null) {
            value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
