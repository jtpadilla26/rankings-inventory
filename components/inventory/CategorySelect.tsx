'use client';

import { useEffect, useRef, useState } from 'react';
import { useCategories } from './useCategories';

type Category = {
  id: string;
  name: string;
};

type Props = {
  name: string;
  defaultValue?: string | null;
  className?: string;
  required?: boolean;
};

export default function CategorySelect({
  name,
  defaultValue,
  className = '',
  required = false
}: Props) {
  const { categories, loading } = useCategories();
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input value when defaultValue prop changes (for Edit modal)
  useEffect(() => {
    setInputValue(defaultValue ?? '');
    setIsFiltering(false);
  }, [defaultValue]);

  // Filter categories based on input
  useEffect(() => {
    if (!isFiltering || inputValue.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [inputValue, categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsFiltering(true);
    setShowDropdown(true);
  };

  const handleCategorySelect = (categoryName: string) => {
    setInputValue(categoryName);
    setIsFiltering(true);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setIsFiltering(false);
    setShowDropdown(true);
  };

  if (loading) {
    return (
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ''}
        className={className}
        placeholder="Loading categories..."
        disabled
      />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={className}
        placeholder="Select or type a category"
        autoComplete="off"
        required={required}
      />

      {showDropdown && filteredCategories.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleCategorySelect(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {showDropdown && filteredCategories.length === 0 && inputValue.trim() !== '' && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500">
          No matching categories. Press Enter to use &quot;{inputValue}&quot; as a new category.
        </div>
      )}
    </div>
  );
}
