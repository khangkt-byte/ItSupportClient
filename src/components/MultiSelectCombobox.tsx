import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export function MultiSelectCombobox({ options, values, onChange, placeholder = 'Select...', required = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== value));
  };

  const getSelectedLabels = () => {
    return values.map(v => options.find(o => o.value === v)?.label || v);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white dark:bg-gray-700 min-h-[42px] flex flex-wrap items-center gap-1 ${
          isOpen ? 'ring-2 ring-primary-500 border-primary-500 dark:border-primary-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {values.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        ) : (
          <>
            {getSelectedLabels().map((label, idx) => (
              <span
                key={values[idx]}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => removeValue(values[idx], e)}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-50">{option.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={values.length > 0 ? 'valid' : ''}
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
