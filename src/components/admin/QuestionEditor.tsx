'use client';

import React, { useState, useEffect } from 'react';
import {
  addQuestion,
  updateQuestion,
  getChaptersForSubject,
  getTopicsForChapter,
  validateQuestion,
  uploadQuestionImage,
  AdminQuestion
} from '@/lib/adminQuestionService';
import { MCQOption, Subject, QuestionType, Book } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Upload, X } from 'lucide-react';

const SUBJECTS: Subject[] = ['Botany', 'Chemistry', 'Physics', 'Zoology'];
const BOOKS: Book[] = ['NCERT', 'Reference', 'Sample Papers', 'Practice Papers'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_TYPES: QuestionType[] = ['MCQ', 'Assertion-Reason', 'Numerical', 'Fill-in-the-blank'];

interface QuestionEditorProps {
  initialQuestion?: AdminQuestion;
  onSuccess?: (questionId: string) => void;
}

export default function QuestionEditor({ initialQuestion, onSuccess }: QuestionEditorProps) {
  const [formData, setFormData] = useState<AdminQuestion>(
    initialQuestion || {
      id: '',
      text: '',
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false },
      ],
      difficulty: 'medium',
      category: '',
      subject: 'Chemistry',
      book: undefined,
      chapter: '',
      topic: '',
      questionType: 'MCQ',
      explanation: '',
      tags: [],
    }
  );

  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialQuestion?.imageUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Load chapters when subject changes
  useEffect(() => {
    const loadChapters = async () => {
      if (formData.subject) {
        try {
          const chaptersData = await getChaptersForSubject(formData.subject);
          setChapters(chaptersData);
          setFormData(prev => ({ ...prev, chapter: '', topic: '' }));
          setTopics([]);
        } catch (error) {
          console.error('Error loading chapters:', error);
        }
      }
    };
    loadChapters();
  }, [formData.subject]);

  // Load topics when chapter changes
  useEffect(() => {
    const loadTopics = async () => {
      if (formData.chapter) {
        try {
          const topicsData = await getTopicsForChapter(formData.chapter);
          setTopics(topicsData);
          setFormData(prev => ({ ...prev, topic: '' }));
        } catch (error) {
          console.error('Error loading topics:', error);
        }
      }
    };
    loadTopics();
  }, [formData.chapter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imageFile: undefined, imageUrl: undefined }));
    setImagePreview(null);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index].text = text;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = formData.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index,
    }));
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    const newOption: MCQOption = {
      id: `${formData.options.length + 1}`,
      text: '',
      isCorrect: false,
    };
    setFormData(prev => ({ ...prev, options: [...prev.options, newOption] }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      setErrors(['Minimum 2 options required']);
      return;
    }
    const newOptions = formData.options.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage('');

    // Validate
    const validation = validateQuestion(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      if (initialQuestion?.id) {
        await updateQuestion(initialQuestion.id, formData);
        setSuccessMessage('✅ Question updated successfully!');
      } else {
        const questionId = await addQuestion(formData);
        setSuccessMessage('✅ Question added successfully!');
        setFormData({
          id: '',
          text: '',
          options: [
            { id: '1', text: '', isCorrect: false },
            { id: '2', text: '', isCorrect: false },
            { id: '3', text: '', isCorrect: false },
            { id: '4', text: '', isCorrect: false },
          ],
          difficulty: 'medium',
          category: '',
          subject: 'Chemistry',
          book: undefined,
          chapter: '',
          topic: '',
          questionType: 'MCQ',
          explanation: '',
          tags: [],
        });
        setImagePreview(null);
        onSuccess?.(questionId);
      }

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving question:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to save question']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#1a1a1a] text-white p-6 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">
        {initialQuestion?.id ? 'Edit Question' : 'Add New Question'}
      </h2>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <h3 className="font-semibold text-red-400 mb-2">Errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-red-300">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-semibold mb-2">Question Text *</label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Enter the question text..."
            className="w-full h-24 px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs max-h-64 rounded-lg"
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="flex flex-col items-center justify-center py-8">
                <Upload size={32} className="mb-2 text-gray-400" />
                <span className="text-gray-300">Click to upload image</span>
                <span className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Subject, Book, Chapter, Topic, Difficulty */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Subject *</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value as Subject }))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Book</label>
            <select
              value={formData.book || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, book: e.target.value as Book | undefined }))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Book</option>
              {BOOKS.map(book => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Chapter *</label>
            {chapters.length > 0 ? (
              <select
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Chapter</option>
                {chapters.map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.chapter}
                onChange={(e) => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                placeholder="Enter new chapter..."
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Topic *</label>
            {topics.length > 0 ? (
              <select
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Topic</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Enter new topic..."
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Difficulty *</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Question Type *</label>
            <select
              value={formData.questionType}
              onChange={(e) => setFormData(prev => ({ ...prev, questionType: e.target.value as QuestionType }))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., NCERT, JEE, NEET"
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold mb-3">Options * (Mark the correct answer)</label>
          <div className="space-y-3">
            {formData.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(idx)}
                  className="w-5 h-5 cursor-pointer accent-blue-500"
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600 rounded-lg text-red-400 transition-colors"
                  disabled={formData.options.length <= 2}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOption}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600 rounded-lg text-blue-400 transition-colors"
          >
            <Plus size={18} /> Add Option
          </button>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-semibold mb-2">Explanation</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
            placeholder="Enter explanation for the correct answer..."
            className="w-full h-16 px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNcert || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isNcert: e.target.checked }))}
              className="w-4 h-4 accent-blue-500"
            />
            <span>NCERT</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPreviousYear || false}
              onChange={(e) => setFormData(prev => ({ ...prev, isPreviousYear: e.target.checked }))}
              className="w-4 h-4 accent-blue-500"
            />
            <span>Previous Year Paper</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Saving...' : initialQuestion?.id ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
}
