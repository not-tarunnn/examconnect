'use client';

import { useState } from 'react';
import { QuestionType, Subject, Book, FilterOptions } from '@/types/question';
import { Filter, ChevronDown, Bookmark, AlertCircle, BookOpen, Zap, HelpCircle, Library } from 'lucide-react';
import { motion } from 'framer-motion';
import DropdownFilter from './DropdownFilter';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const SUBJECTS: Subject[] = ['Botany', 'Chemistry', 'Physics', 'Zoology'];
const BOOKS: Book[] = ['NCERT', 'Reference', 'Sample Papers', 'Practice Papers'];
const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Assertion-Reason', 'Numerical', 'Fill-in-the-blank'];
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const subjectOptions = SUBJECTS.map((s) => ({ value: s, label: s }));
const bookOptions = BOOKS.map((b) => ({ value: b, label: b }));
const difficultyOptions = DIFFICULTY_LEVELS.map((d) => ({
  value: d,
  label: d.charAt(0).toUpperCase() + d.slice(1),
}));
const questionTypeOptions = QUESTION_TYPES.map((q) => ({ value: q, label: q }));

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.difficulty ||
    filters.questionType ||
    filters.isNcert ||
    filters.isPreviousYear ||
    filters.isBookmarked ||
    filters.isIncorrect;

  return (
    <div className="space-y-4">
      {/* Primary Filters - One Line Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <DropdownFilter
          label="Subject"
          options={subjectOptions}
          selectedValue={filters.subject}
          onSelect={(value) => updateFilter('subject', value)}
          icon={<BookOpen size={18} strokeWidth={1.5} />}
          placeholder="All Subjects"
        />

        <DropdownFilter
          label="Books"
          options={bookOptions}
          selectedValue={filters.book}
          onSelect={(value) => updateFilter('book', value)}
          icon={<Library size={18} strokeWidth={1.5} />}
          placeholder="All Books"
        />

        <DropdownFilter
          label="Difficulty"
          options={difficultyOptions}
          selectedValue={filters.difficulty}
          onSelect={(value) => updateFilter('difficulty', value)}
          icon={<Zap size={18} strokeWidth={1.5} />}
          placeholder="All Levels"
        />

        <DropdownFilter
          label="Question Type"
          options={questionTypeOptions}
          selectedValue={filters.questionType}
          onSelect={(value) => updateFilter('questionType', value)}
          icon={<HelpCircle size={18} strokeWidth={1.5} />}
          placeholder="All Types"
        />
      </div>

      {/* Toggle Secondary Filters Button */}
      <button
        onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium text-sm px-4 py-2"
      >
        <Filter size={16} strokeWidth={1.5} />
        <span>{showSecondaryFilters ? 'Hide More Filters' : 'Show More Filters'}</span>
        <motion.div
          animate={{ rotate: showSecondaryFilters ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} strokeWidth={1.5} />
        </motion.div>
        {hasActiveFilters && (
          <span className="ml-auto text-xs bg-blue-500/30 text-blue-400 px-2 py-1 rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Secondary Filters - Collapsible */}
      {showSecondaryFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="glassmorphism-dark rounded-lg border border-white/10 p-4 space-y-4"
        >
          {/* NCERT Questions Toggle */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-3 uppercase">
              Question Source
            </label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateFilter('isNcert', !filters.isNcert)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                filters.isNcert
                  ? 'bg-indigo-500/20 border-indigo-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  filters.isNcert
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-white/30'
                }`}
              >
                {filters.isNcert && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="text-sm font-medium text-white/80">NCERT Questions Only</span>
            </motion.button>
          </div>

          {/* Previous Year Toggle */}
          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs font-semibold text-white/70 mb-3 uppercase">
              Exam Type
            </label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateFilter('isPreviousYear', !filters.isPreviousYear)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                filters.isPreviousYear
                  ? 'bg-orange-500/20 border-orange-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                  filters.isPreviousYear
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-white/30'
                }`}
              >
                {filters.isPreviousYear && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="text-sm font-medium text-white/80">Previous Year Questions</span>
            </motion.button>
          </div>

          {/* Bookmarks Toggle */}
          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs font-semibold text-white/70 mb-3 uppercase">
              My Questions
            </label>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('isBookmarked', !filters.isBookmarked)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                  filters.isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    filters.isBookmarked
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-white/30'
                  }`}
                >
                  {filters.isBookmarked && (
                    <Bookmark size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-white/80">Bookmarks</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter('isIncorrect', !filters.isIncorrect)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                  filters.isIncorrect
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    filters.isIncorrect
                      ? 'bg-red-500 border-red-500'
                      : 'border-white/30'
                  }`}
                >
                  {filters.isIncorrect && (
                    <AlertCircle size={12} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-white/80">Incorrect Answers</span>
              </motion.button>
            </div>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                onFiltersChange({
                  subject: filters.subject,
                  book: filters.book,
                  chapter: filters.chapter,
                  topic: filters.topic,
                })
              }
              className="w-full mt-2 px-4 py-2 rounded-lg border border-white/10 text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              Clear Secondary Filters
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
