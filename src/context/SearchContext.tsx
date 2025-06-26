import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  selectedFormat: string | null;
  setSelectedFormat: (format: string | null) => void;
  selectedAccess: string | null;
  setSelectedAccess: (access: string | null) => void;
  clearFilters: () => void;
}

const SearchContext = createContext<SearchContextType>({
  searchTerm: '',
  setSearchTerm: () => {},
  selectedTags: [],
  toggleTag: () => {},
  selectedFormat: null,
  setSelectedFormat: () => {},
  selectedAccess: null,
  setSelectedAccess: () => {},
  clearFilters: () => {},
});

export const useSearch = () => useContext(SearchContext);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedFormat(null);
    setSelectedAccess(null);
  };

  const value = {
    searchTerm,
    setSearchTerm,
    selectedTags,
    toggleTag,
    selectedFormat,
    setSelectedFormat,
    selectedAccess,
    setSelectedAccess,
    clearFilters,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};