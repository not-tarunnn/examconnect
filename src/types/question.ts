export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type Subject = 'Botany' | 'Chemistry' | 'Physics' | 'Zoology';
export type QuestionType = 'MCQ' | 'Assertion-Reason' | 'Numerical' | 'Fill-in-the-blank';
export type Book = 'NCERT' | 'Reference' | 'Sample Papers' | 'Practice Papers';

export interface Question {
  imageUrl: any;
  id: string;
  text: string;
  options: MCQOption[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  subject: Subject;
  book?: Book;
  chapter: string;
  topic: string;
  questionType: QuestionType;
  isNcert?: boolean;
  isPreviousYear?: boolean;
  isBookmarked?: boolean;
  isIncorrect?: boolean;
  correctnessLevel?: number; // 0-100, percentage of users who got it right
  explanation?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
}

export interface Chapter {
  id: string;
  name: string;
  subject: Subject;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  chapterId: string;
}

export interface QuestionQueryResult {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface FilterOptions {
  subject?: Subject;
  book?: Book;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  questionType?: QuestionType;
  isNcert?: boolean;
  isPreviousYear?: boolean;
  isBookmarked?: boolean;
  isIncorrect?: boolean;
}
