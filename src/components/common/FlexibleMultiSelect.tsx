import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCustom?: boolean;
  hasError?: boolean;
}

export function FlexibleMultiSelect({
  options,
  values,
  onChange,
  placeholder = 'Select or type...',
  label,
  required = false,
  allowCustom = true,
  hasError = false,
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on input
  const filteredOptions = options.filter(
    opt => 
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !values.includes(opt.value)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelectOption = (value: string) => {
    if (!values.includes(value)) {
      onChange([...values, value]);
    }
    setInputValue('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (showSuggestions && filteredOptions.length > 0) {
        e.preventDefault();
      }

      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleSelectOption(filteredOptions[highlightedIndex].value);
        return;
      }

      if (inputValue.trim() && allowCustom) {
        const trimmedValue = inputValue.trim();
        if (!values.includes(trimmedValue)) {
          onChange([...values, trimmedValue]);
        }
        setInputValue('');
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        return;
      }

      // Tab without selection should allow normal focus shift
      if (e.key === 'Tab') {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const handleFocus = () => {
    if (filteredOptions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const nextFocused = e.relatedTarget as Node | null;
    const isStillInsideCombobox =
      !!nextFocused &&
      ((inputRef.current && inputRef.current.contains(nextFocused)) ||
        (dropdownRef.current && dropdownRef.current.contains(nextFocused)));

    if (isStillInsideCombobox) {
      return;
    }

    // When user leaves the combobox entirely, accept the custom input value
    if (inputValue.trim() && allowCustom) {
      const trimmedValue = inputValue.trim();
      if (!values.includes(trimmedValue)) {
        onChange([...values, trimmedValue]);
      }
      setInputValue('');
    }
    setShowSuggestions(false);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-error-foreground ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Selected values + Input */}
        <div className={`w-full min-h-10.5 px-3 py-2 border rounded-lg bg-card flex flex-wrap gap-2 items-center focus-within:ring-2 ${
          hasError
            ? 'border-error-border focus-within:ring-error-border/30 focus-within:border-error-border'
            : 'border-input focus-within:ring-primary-500 focus-within:border-transparent'
        }`}>
          {values.map((value) => {
            const option = options.find(opt => opt.value === value);
            const displayLabel = option ? option.label : value;
            
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded"
              >
                {displayLabel}
                <button
                  type="button"
                  onClick={() => handleRemoveValue(value)}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleInputBlur}
            placeholder={values.length === 0 ? placeholder : ''}
            className="flex-1 min-w-30 outline-none bg-transparent text-foreground placeholder-placeholder"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (filteredOptions.length > 0 || (allowCustom && inputValue.trim())) && (
          <ul
            ref={dropdownRef}
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto list-none p-0"
          >
            {/* Suggestions from list */}
            {filteredOptions.map((option, index) => (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelectOption(option.value)}
                  className={`block w-full px-3 py-2 text-left cursor-pointer transition-colors ${
                    highlightedIndex === index
                      ? 'bg-primary-100 dark:bg-primary-900 outline-none'
                      : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-sm text-foreground">{option.label}</span>
                </button>
              </li>
            ))}

            {/* Custom value option */}
            {allowCustom && inputValue.trim() && !options.some(opt => opt.value.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <li role="none">
                <button
                  type="button"
                  role="option"
                  onClick={() => {
                    const trimmedValue = inputValue.trim();
                    if (!values.includes(trimmedValue)) {
                      onChange([...values, trimmedValue]);
                    }
                    setInputValue('');
                    setShowSuggestions(false);
                  }}
                  className="block w-full px-3 py-2 text-left cursor-pointer border-t border-border bg-muted/50 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4 text-green-600" />
                    <span>Add custom: <strong>{inputValue.trim()}</strong></span>
                  </div>
                </button>
              </li>
            )}

            {/* Empty state */}
            {filteredOptions.length === 0 && (!allowCustom || !inputValue.trim()) && (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                No suggestions found
              </li>
            )}
          </ul>
        )}
      </div>

      {allowCustom && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select from list, press Enter, or click outside to add custom name
        </p>
      )}
    </div>
  );
}