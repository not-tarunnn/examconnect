'use client';

import { useState } from 'react';
import { Question } from '@/types/question';
import { Check, X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  onAnswerSelect?: (optionId: string) => void;
}

const difficultyConfig = {
  easy: { color: 'bg-emerald-500/20 border-emerald-500/50', label: 'Easy', textColor: 'text-emerald-400' },
  medium: { color: 'bg-amber-500/20 border-amber-500/50', label: 'Medium', textColor: 'text-amber-400' },
  hard: { color: 'bg-red-500/20 border-red-500/50', label: 'Hard', textColor: 'text-red-400' },
};

export default function QuestionCard({
  question,
  questionNumber,
  onAnswerSelect,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onAnswerSelect?.(optionId);
  };

  const correctOption = question.options.find((opt) => opt.isCorrect);
  const difficultyInfo = difficultyConfig[question.difficulty];
  const correctnessPercentage = question.correctnessLevel || 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glassmorphism-dark rounded-lg border border-white/10 p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-white/60">
              Question {questionNumber}
            </span>
            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${difficultyInfo.color} ${difficultyInfo.textColor}`}>
              {difficultyInfo.label}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white leading-relaxed">
            {question.text}
          </h3>
        </div>
      </div>

      {/* Correctness Indicator */}
      <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/70">Correctness Level</span>
          <span className="text-sm font-semibold text-white/90">{correctnessPercentage}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${correctnessPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
          />
        </div>
        <p className="text-xs text-white/60 mt-2">
          {correctnessPercentage < 30
            ? 'Tricky question - Most users get this wrong'
            : correctnessPercentage < 70
            ? 'Moderate - Some users find this challenging'
            : 'Most users answer this correctly'}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.isCorrect;
          const showCorrect = selectedOption && isCorrect;
          const showIncorrect = isSelected && !isCorrect;

          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                showCorrect
                  ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/50'
                  : showIncorrect
                  ? 'bg-red-500/20 border-red-500/50 ring-2 ring-red-500/50'
                  : isSelected
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      showCorrect
                        ? 'bg-emerald-500 border-emerald-500'
                        : showIncorrect
                        ? 'bg-red-500 border-red-500'
                        : isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-white/30'
                    }`}
                  >
                    {showCorrect && <Check size={14} className="text-white" />}
                    {showIncorrect && <X size={14} className="text-white" />}
                  </div>
                  <span className="text-white/90 font-medium">
                    {String.fromCharCode(65 + index)}. {option.text}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Answer Feedback */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <AlertCircle size={16} />
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>

          {showExplanation && question.explanation && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-white/80 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Category Tag */}
      {question.category && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="inline-block text-xs px-2 py-1 rounded bg-white/5 text-white/60">
            {question.category}
          </span>
        </div>
      )}
    </motion.div>
  );
}
