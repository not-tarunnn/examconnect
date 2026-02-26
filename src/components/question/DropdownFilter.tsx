'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

interface DropdownFilterProps {
  label: string;
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string | undefined) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

export default function DropdownFilter({
  label,
  options,
  selectedValue,
  onSelect,
  icon,
  placeholder = 'Select...',
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      {/* Dropdown Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glassmorphism-dark rounded-xl border border-white/20 px-4 py-3 flex items-center justify-between gap-3 transition-all hover:border-white/30 hover:bg-white/10 group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 text-white/60 group-hover:text-white/80 transition-colors">
              {icon}
            </div>
          )}
          <div className="text-left">
            <div className="text-xs font-semibold text-white/50 group-hover:text-white/60 transition-colors">
              {label}
            </div>
            <div className="text-sm font-medium text-white truncate">
              {selectedLabel}
            </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            size={18}
            strokeWidth={1.5}
            className="text-white/60 group-hover:text-white/80 transition-colors"
          />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 glassmorphism-dark rounded-xl border border-white/20 backdrop-blur-xl overflow-hidden z-50 shadow-2xl"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    onSelect(selectedValue === option.value ? undefined : option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-all flex items-center gap-3 border-b border-white/5 last:border-b-0 hover:bg-white/10 ${
                    selectedValue === option.value
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedValue === option.value
                        ? 'bg-blue-500 ring-2 ring-blue-400/50'
                        : 'bg-white/20'
                    }`}
                  />
                  <span className="flex-1">{option.label}</span>
                  {selectedValue === option.value && (
                    <span className="text-xs bg-blue-500/30 text-blue-400 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
