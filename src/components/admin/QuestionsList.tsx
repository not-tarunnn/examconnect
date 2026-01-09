'use client';

import React, { useState, useEffect } from 'react';
import {
  getAllQuestions,
  deleteQuestion,
  getChaptersForSubject,
  AdminQuestion
} from '@/lib/adminQuestionService';
import { Question, Subject } from '@/types/question';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit2, Eye, Search } from 'lucide-react';

const SUBJECTS: Subject[] = ['Botany', 'Chemistry', 'Physics', 'Zoology'];

interface QuestionsListProps {
  onEdit?: (question: Question) => void;
  refreshTrigger?: number;
}

export default function QuestionsList({ onEdit, refreshTrigger }: QuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Chemistry');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chapters, setChapters] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, [refreshTrigger]);

  // Load chapters when subject changes
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const chaptersData = await getChaptersForSubject(selectedSubject);
        setChapters(chaptersData);
        setSelectedChapter('');
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };
    loadChapters();
  }, [selectedSubject]);

  // Filter questions
  useEffect(() => {
    let filtered = questions;

    if (selectedSubject) {
      filtered = filtered.filter(q => q.subject === selectedSubject);
    }

    if (selectedChapter) {
      filtered = filtered.filter(q => q.chapter === selectedChapter);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, selectedSubject, selectedChapter, searchTerm]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const allQuestions = await getAllQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      setIsDeleting(true);
      await deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#1a1a1a] text-white p-6 rounded-lg text-center">
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1a1a1a] text-white p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">Manage Questions</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Chapter</label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Chapters</option>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Search</label>
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Questions Count */}
      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>

      {/* Questions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No questions found
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div
              key={question.id}
              className="flex items-start gap-4 p-4 bg-[#2a2a2a] border border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
            >
              {/* Image Thumbnail */}
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              )}

              {/* Question Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs bg-blue-600 rounded">
                    {question.subject}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-700 rounded">
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-700 rounded">
                    {question.questionType}
                  </span>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 mb-1">
                  {question.text}
                </p>

                <div className="text-xs text-gray-500">
                  Chapter: {question.chapter} | Topic: {question.topic}
                </div>

                {question.options && (
                  <div className="mt-2 text-xs text-gray-400">
                    Options: {question.options.length}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit?.(question)}
                  className="p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600 rounded-lg text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600 rounded-lg text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#2a2a2a] border-gray-600">
                    <AlertDialogTitle className="text-white">Delete Question?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This action cannot be undone. The question will be permanently deleted from the database.
                    </AlertDialogDescription>
                    <div className="flex gap-3">
                      <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(question.id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
