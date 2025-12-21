
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean; 
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  className = "",
  required = false,
  disabled = false,
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
      onChange(val);
      setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              {label} {required && <span className="text-red-500">*</span>}
          </label>
      )}
      
      <div
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm transition-all duration-300 outline-none cursor-pointer group ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' :
          isOpen 
            ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' 
            : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 truncate flex-1">
            {selectedOption?.icon && <span className="flex-shrink-0 text-brand-600">{selectedOption.icon}</span>}
            
            {allowCustom ? (
                <input 
                    type="text"
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-gray-700 font-bold placeholder-gray-400"
                    placeholder={placeholder}
                    value={selectedOption ? selectedOption.label : value} 
                    onChange={(e) => onChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()} 
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
            ) : (
                <span className={`truncate font-bold ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
            )}
        </div>
        <ChevronDown 
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 flex-shrink-0 group-hover:text-brand-600 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} 
        />
      </div>

      {/* Dropdown Menu - Increased Z-index and animation */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top min-w-[180px] ring-1 ring-black/5">
          <div className="max-h-64 overflow-y-auto no-scrollbar p-1.5 space-y-0.5">
            {options.length > 0 ? (
                options.filter(opt => (allowCustom && value) ? opt.label.toLowerCase().includes(value.toLowerCase()) : true).map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelect(option.value); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left transition-all group ${
                    option.value === value 
                        ? 'bg-brand-50 text-brand-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <div className="flex items-center gap-2.5 truncate">
                        {option.icon && (
                            <span className={`flex-shrink-0 ${option.value === value ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {option.icon}
                            </span>
                        )}
                        <span className="truncate">{option.label}</span>
                    </div>
                    {option.value === value && <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />}
                </button>
                ))
            ) : (
                <div className="px-3 py-4 text-xs text-gray-400 text-center italic">No options available</div>
            )}
            
            {allowCustom && value && !options.some(o => o.value === value || o.label === value) && (
                 <div className="px-3 py-2 text-[10px] text-brand-600 font-black uppercase tracking-widest border-t border-gray-50 mt-1 bg-brand-50/30">
                    Custom: "{value}"
                 </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
