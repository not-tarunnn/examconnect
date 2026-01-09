'use client';

import { useEffect, useMemo } from 'react';
import { FilterOptions } from '@/types/question';
import QuestionCard from './QuestionCard';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuestionStore } from '@/store/useQuestionStore';

interface QuestionAreaProps {
  filters?: FilterOptions;
}

export default function QuestionArea({
  filters,
}: QuestionAreaProps) {
  // Zustand store hooks - use individual selectors to prevent infinite loops
  
// ✅ Zustand selectors — RAW STATE ONLY
const fetchQuestions = useQuestionStore((state) => state.fetchQuestions);
const currentPage = useQuestionStore((state) => state.currentPage);
const pageSize = useQuestionStore((state) => state.pageSize);
const Questions = useQuestionStore((state) => state.allQuestions);
const loading = useQuestionStore((state) => state.loading);
const error = useQuestionStore((state) => state.error);
const setCurrentPage = useQuestionStore((state) => state.setCurrentPage);
const getTotalPages = useQuestionStore((state) => state.getTotalPages);
const getHasNextPage = useQuestionStore((state) => state.getHasNextPage);
const getHasPreviousPage = useQuestionStore((state) => state.getHasPreviousPage);
const getTotalCount = useQuestionStore((state) => state.getTotalCount);

  // Memoize computed pagination values
  const pagination = useMemo(() => {
    const totalCount = getTotalCount();
    const totalPages = getTotalPages();
    const hasNextPage = getHasNextPage();
    const hasPreviousPage = getHasPreviousPage();
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalCount);

    return {
      totalPages,
      hasNextPage,
      hasPreviousPage,
      totalCount,
      startIndex,
      endIndex,
    };
  }, [currentPage, pageSize, getTotalPages, getHasNextPage, getHasPreviousPage, getTotalCount]);

  // Fetch questions when filters change - stable dependency with JSON stringify
  useEffect(() => {
    const filtersKey = JSON.stringify(filters);
    fetchQuestions(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="glassmorphism-dark rounded-lg border border-white/10 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Error Loading Questions</h3>
          </div>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Pagination Controls */}
      <div className="glassmorphism-dark rounded-lg border border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">
            <span className="font-semibold text-white">
              {loading ? '...' : `${pagination.startIndex}-${pagination.endIndex}`}
            </span>
            {' of '}
            <span className="font-semibold text-white">
              {loading ? '...' : pagination.totalCount}
            </span>
            {' questions'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage || loading}
              className={`p-2 rounded-lg border transition-all ${
                !pagination.hasPreviousPage || loading
                  ? 'border-white/10 text-white/40 cursor-not-allowed'
                  : 'border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2 px-3">
              <span className="text-sm font-medium text-white">
                Page {loading ? '...' : currentPage}
              </span>
              <span className="text-white/40">/</span>
              <span className="text-sm text-white/60">
                {loading ? '...' : pagination.totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || loading}
              className={`p-2 rounded-lg border transition-all ${
                !pagination.hasNextPage || loading
                  ? 'border-white/10 text-white/40 cursor-not-allowed'
                  : 'border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30'
              }`}
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Questions Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#202020]/50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
              <p className="text-white/60 text-sm">Loading questions...</p>
            </div>
          </div>
        )}

        {Questions.length > 0 ? (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {Questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={pagination.startIndex + index}
              />
            ))}
          </motion.div>
        ) : !loading && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No questions found</p>
          </div>
        )}
      </div>

      {/* Bottom Pagination Controls */}
      {Questions.length > 0 && (
        <div className="glassmorphism-dark rounded-lg border border-white/10 p-4 mt-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                !pagination.hasPreviousPage || loading
                  ? 'border-white/10 text-white/40 cursor-not-allowed'
                  : 'border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30'
              }`}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">
                Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages}</span>
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                !pagination.hasNextPage || loading
                  ? 'border-white/10 text-white/40 cursor-not-allowed'
                  : 'border-white/20 text-white/80 hover:bg-white/5 hover:border-white/30'
              }`}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
