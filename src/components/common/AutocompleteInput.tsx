import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export interface Suggestion {
  id: number; // Changed from string to number to match API
  name: string;
  description?: string;
  usageCount: number;
  metadata?: Record<string, any>;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: Suggestion | null) => void;
  selectedSuggestion: Suggestion | null;
  suggestions: Suggestion[];
  loading?: boolean;
  placeholder?: string;
  label: string;
  required?: boolean;
  showKbIndicator?: boolean;
  suggestionHeader?: string;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  selectedSuggestion,
  suggestions,
  loading = false,
  placeholder,
  label,
  required = false,
  showKbIndicator = true,
  suggestionHeader = "💡 Suggested from Knowledge Base",
  className = ''
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear KB link when user types (manual edit)
    if (selectedSuggestion) {
      onSelect?.(null);
    }
    
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.name);
    onSelect?.(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleClearKbLink = () => {
    onSelect?.(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else {
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex + 1]; // +1 for header
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {selectedSuggestion && showKbIndicator && (
          <span className="ml-2 px-2 py-0.5 bg-success-foreground text-inverse-foreground text-xs rounded">
            From KB
          </span>
        )}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground placeholder-placeholder focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Header - Only show if suggestionHeader is provided and not empty */}
            {suggestionHeader && (
              <div className="px-3 py-2 bg-muted border-b border-border text-xs text-muted-foreground">
                {suggestionHeader}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`px-3 py-2.5 cursor-pointer border-b border-border transition-colors ${
                  highlightedIndex === index
                    ? 'bg-primary-100 dark:bg-primary-900'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="font-medium text-sm text-foreground">
                  {suggestion.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded">
                    {suggestion.usageCount} times used
                  </span>
                  {suggestion.description && (
                    <span className="text-xs text-muted-foreground truncate">
                      {suggestion.description}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="px-3 py-2 bg-muted text-center text-xs text-muted-foreground">
              Press Enter to continue
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* KB Indicator */}
      {selectedSuggestion && showKbIndicator && (
        <div className="mt-2 px-3 py-2 bg-success-background border-l-4 border-success-border rounded">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">
                Linked to KB Issue: <strong>{selectedSuggestion.name}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearKbLink}
              className="text-primary-600 hover:text-primary-700 underline text-xs"
            >
              Clear KB link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}