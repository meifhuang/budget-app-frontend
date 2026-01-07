import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface CreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
  required?: boolean;
}

export default function CreatableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  label,
  required = false 
}: CreatableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCreateOption = searchTerm.trim() !== '' && 
    !options.some(opt => opt.toLowerCase() === searchTerm.toLowerCase());

  const displayOptions = showCreateOption 
    ? [...filteredOptions, `Create "${searchTerm}"`]
    : filteredOptions;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleOptionClick = (option: string) => {
    if (option.startsWith('Create "')) {
      onChange(option.slice(8, -1));
    } else {
      onChange(option);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = value || searchTerm;

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          value={displayValue}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); if (value) setSearchTerm(value); }}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && !isOpen && (
          <button
            type="button"
            onClick={() => { onChange(''); setSearchTerm(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && displayOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {displayOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                option.startsWith('Create "') ? 'text-blue-600 font-medium border-t border-gray-200' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
