import { create } from 'zustand';
import { Question, FilterOptions, QuestionQueryResult } from '@/types/question';
import { fetchAllQuestions } from '@/lib/questionService';

interface QuestionState {
  // Data
  allQuestions: Question[];
  filteredQuestions: Question[];
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Status
  loading: boolean;
  error: string | null;
  lastFilters: FilterOptions | null;
  
  // Actions
  fetchQuestions: (filters?: FilterOptions) => Promise<void>;
  setCurrentPage: (page: number) => void;
  resetPagination: () => void;
  
  // Computed values
  getCurrentPageQuestions: () => Question[];
  getTotalPages: () => number;
  getHasNextPage: () => boolean;
  getHasPreviousPage: () => boolean;
  getTotalCount: () => number;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  // Initial state
  allQuestions: [],
  filteredQuestions: [],
  currentPage: 1,
  pageSize: 10,
  loading: false,
  error: null,
  lastFilters: null,

  // Fetch all questions matching filters
  fetchQuestions: async (filters?: FilterOptions) => {
    try {
      set({ loading: true, error: null });
      
      // Fetch all questions from Firebase (no Firebase pagination)
      const questions = await fetchAllQuestions(filters);
      
      set({
        allQuestions: questions,
        filteredQuestions: questions,
        currentPage: 1,
        lastFilters: filters || null,
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch questions';
      set({ 
        error: errorMessage,
        loading: false,
      });
      console.error('Error fetching questions:', error);
    }
  },

  // Set current page number
  setCurrentPage: (page: number) => {
    const state = get();
    const maxPages = state.getTotalPages();
    
    if (page >= 1 && page <= maxPages) {
      set({ currentPage: page });
      // Scroll to top
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },

  // Reset pagination to first page
  resetPagination: () => {
    set({ currentPage: 1 });
  },

  // Get questions for current page
  getCurrentPageQuestions: () => {
    const state = get();
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return state.filteredQuestions.slice(startIndex, endIndex);
  },

  // Get total number of pages
  getTotalPages: () => {
    const state = get();
    return Math.ceil(state.filteredQuestions.length / state.pageSize);
  },

  // Check if there's a next page
  getHasNextPage: () => {
    const state = get();
    return state.currentPage < state.getTotalPages();
  },

  // Check if there's a previous page
  getHasPreviousPage: () => {
    const state = get();
    return state.currentPage > 1;
  },

  // Get total question count
  getTotalCount: () => {
    const state = get();
    return state.filteredQuestions.length;
  },
}));
