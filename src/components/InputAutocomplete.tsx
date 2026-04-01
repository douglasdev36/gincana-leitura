import { useState, useEffect, useRef } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import { Student } from '../types';

export function InputAutocomplete({
  onSelect,
  presetValue
}: {
  onSelect?: (student: Student) => void;
  presetValue?: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (presetValue === undefined) return;
    setQuery(presetValue);
    setIsOpen(false);
  }, [presetValue]);

  useEffect(() => {
    async function fetchStudents() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const data = await api.searchStudents(debouncedQuery);
      setResults(data);
      setIsLoading(false);
      setIsOpen(true);
    }
    fetchStudents();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (student: Student) => {
    if (onSelect) {
      onSelect(student);
    }
    setQuery(student.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        Buscar Aluno
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-200"
          placeholder="Digite o nome do aluno..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-slate-700 overflow-auto focus:outline-none sm:text-sm transition-colors duration-200">
          {results.map((student) => (
            <li
              key={student.id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 group flex items-center justify-between transition-colors duration-200"
              onClick={() => handleSelect(student)}
            >
              <span className="block truncate font-medium">{student.name}</span>
              <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg rounded-md py-3 px-4 text-sm text-slate-500 dark:text-slate-400 ring-1 ring-black ring-opacity-5 dark:ring-slate-700 transition-colors duration-200">
          Nenhum aluno encontrado.
        </div>
      )}
    </div>
  );
}
