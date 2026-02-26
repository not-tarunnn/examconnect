import { db } from './firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore';
import { Question, QuestionQueryResult, FilterOptions } from '@/types/question';

const QUESTIONS_COLLECTION = 'questions';

/**
 * Fetch all questions matching filters (no pagination - for Zustand client-side handling)
 * Suitable for handling 10k+ questions with client-side pagination
 */
export async function fetchAllQuestions(
  filters?: FilterOptions
): Promise<Question[]> {
  try {
    const constraints: QueryConstraint[] = [];

    // Add filters if provided
    if (filters?.subject) {
      constraints.push(where('subject', '==', filters.subject));
    }

    if (filters?.book) {
      constraints.push(where('book', '==', filters.book));
    }

    if (filters?.chapter) {
      constraints.push(where('chapter', '==', filters.chapter));
    }

    if (filters?.topic) {
      constraints.push(where('topic', '==', filters.topic));
    }

    if (filters?.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }

    if (filters?.questionType) {
      constraints.push(where('questionType', '==', filters.questionType));
    }

    if (filters?.isNcert !== undefined) {
      constraints.push(where('isNcert', '==', filters.isNcert));
    }

    if (filters?.isPreviousYear !== undefined) {
      constraints.push(where('isPreviousYear', '==', filters.isPreviousYear));
    }

    if (filters?.isBookmarked !== undefined) {
      constraints.push(where('isBookmarked', '==', filters.isBookmarked));
    }

    if (filters?.isIncorrect !== undefined) {
      constraints.push(where('isIncorrect', '==', filters.isIncorrect));
    }

    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, QUESTIONS_COLLECTION), ...constraints);

    // Fetch all matching documents at once
    const snapshot = await getDocs(q);

    const questions: Question[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    } as Question));

    return questions;
  } catch (error) {
    console.error('Error fetching all questions:', error);
    throw error;
  }
}

/**
 * Fetch questions from Firestore with pagination and optional filters
 * Fetches all documents that match filters and handles pagination client-side
 * Note: For large datasets, consider implementing cursor-based pagination
 * @deprecated Use fetchAllQuestions with Zustand for better large dataset handling
 */
export async function fetchQuestions(
  page: number = 1,
  pageSize: number = 10,
  filters?: FilterOptions
): Promise<QuestionQueryResult> {
  try {
    const constraints: QueryConstraint[] = [];

    // Add filters if provided
    if (filters?.subject) {
      constraints.push(where('subject', '==', filters.subject));
    }

    if (filters?.book) {
      constraints.push(where('book', '==', filters.book));
    }

    if (filters?.chapter) {
      constraints.push(where('chapter', '==', filters.chapter));
    }

    if (filters?.topic) {
      constraints.push(where('topic', '==', filters.topic));
    }

    if (filters?.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }

    if (filters?.questionType) {
      constraints.push(where('questionType', '==', filters.questionType));
    }

    if (filters?.isNcert !== undefined) {
      constraints.push(where('isNcert', '==', filters.isNcert));
    }

    if (filters?.isPreviousYear !== undefined) {
      constraints.push(where('isPreviousYear', '==', filters.isPreviousYear));
    }

    if (filters?.isBookmarked !== undefined) {
      constraints.push(where('isBookmarked', '==', filters.isBookmarked));
    }

    if (filters?.isIncorrect !== undefined) {
      constraints.push(where('isIncorrect', '==', filters.isIncorrect));
    }

    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, QUESTIONS_COLLECTION), ...constraints);

    // Fetch all matching documents (Firestore has a 1MB limit per query)
    // For production with large datasets, implement cursor-based pagination
    const snapshot = await getDocs(q);
    const allDocuments = snapshot.docs;

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const questionDocs = allDocuments.slice(startIndex, endIndex);

    const hasMore = endIndex < allDocuments.length;

    const questions: Question[] = questionDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    } as Question));

    return {
      questions,
      total: allDocuments.length,
      page,
      pageSize,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  try {
    const docRef = collection(db, QUESTIONS_COLLECTION);
    const q = query(docRef, where('__name__', '==', questionId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    } as Question;
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const q = query(collection(db, QUESTIONS_COLLECTION));
    const snapshot = await getDocs(q);

    const categories = new Set<string>();
    snapshot.docs.forEach((doc) => {
      if (doc.data().category) {
        categories.add(doc.data().category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
