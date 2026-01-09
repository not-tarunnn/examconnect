// lib/adminQuestionService.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db } from '@/lib/firebase';
import { getStorage } from 'firebase/storage';
import { Question, MCQOption, Subject, QuestionType } from '@/types/question';

const storage = getStorage();

export interface AdminQuestion extends Omit<Question, 'createdAt' | 'updatedAt'> {
  imageUrl?: string;
  imageFile?: File;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadQuestionImage(file: File, questionId?: string): Promise<string> {
  try {
    console.log('[Admin] Uploading image:', file.name);
    
    const fileName = `${questionId || Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `questions/images/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    console.log('[Admin] Image uploaded successfully:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('[Admin] Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Firebase Storage
 */
export async function deleteQuestionImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) return;
    
    console.log('[Admin] Deleting image...');
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    console.log('[Admin] Image deleted successfully');
  } catch (error) {
    console.error('[Admin] Error deleting image:', error);
    // Don't throw - image might already be deleted
  }
}

/**
 * Add new question to Firebase
 */
export async function addQuestion(questionData: AdminQuestion): Promise<string> {
  try {
    console.log('[Admin] Adding new question...');
    
    let imageUrl = questionData.imageUrl;
    
    // Upload image if provided
    if (questionData.imageFile) {
      imageUrl = await uploadQuestionImage(questionData.imageFile);
    }
    
    const questionRef = collection(db, 'questions');
    
    const docData = {
      text: questionData.text,
      options: questionData.options,
      difficulty: questionData.difficulty,
      category: questionData.category,
      subject: questionData.subject,
      chapter: questionData.chapter,
      topic: questionData.topic,
      questionType: questionData.questionType,
      isNcert: questionData.isNcert || false,
      isPreviousYear: questionData.isPreviousYear || false,
      explanation: questionData.explanation || '',
      imageUrl: imageUrl || null,
      tags: questionData.tags || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docSnap = await addDoc(questionRef, docData);
    console.log('[Admin] ✅ Question added with ID:', docSnap.id);
    
    return docSnap.id;
  } catch (error) {
    console.error('[Admin] ❌ Error adding question:', error);
    throw error;
  }
}

/**
 * Update existing question in Firebase
 */
export async function updateQuestion(questionId: string, questionData: AdminQuestion): Promise<void> {
  try {
    console.log('[Admin] Updating question:', questionId);
    
    const questionRef = doc(db, 'questions', questionId);
    
    let imageUrl = questionData.imageUrl;
    
    // If new image file is provided, upload it
    if (questionData.imageFile) {
      // Delete old image if it exists
      if (questionData.imageUrl) {
        await deleteQuestionImage(questionData.imageUrl);
      }
      imageUrl = await uploadQuestionImage(questionData.imageFile, questionId);
    }
    
    const updateData = {
      text: questionData.text,
      options: questionData.options,
      difficulty: questionData.difficulty,
      category: questionData.category,
      subject: questionData.subject,
      chapter: questionData.chapter,
      topic: questionData.topic,
      questionType: questionData.questionType,
      isNcert: questionData.isNcert || false,
      isPreviousYear: questionData.isPreviousYear || false,
      explanation: questionData.explanation || '',
      imageUrl: imageUrl || null,
      tags: questionData.tags || [],
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(questionRef, updateData);
    console.log('[Admin] ✅ Question updated');
  } catch (error) {
    console.error('[Admin] ❌ Error updating question:', error);
    throw error;
  }
}

/**
 * Delete question from Firebase
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    console.log('[Admin] Deleting question:', questionId);
    
    // Get question to find and delete image
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      const imageUrl = questionSnap.data().imageUrl;
      if (imageUrl) {
        await deleteQuestionImage(imageUrl);
      }
    }
    
    // Delete question document
    await deleteDoc(questionRef);
    console.log('[Admin] ✅ Question deleted');
  } catch (error) {
    console.error('[Admin] ❌ Error deleting question:', error);
    throw error;
  }
}

/**
 * Get question by ID
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  try {
    const questionRef = doc(db, 'questions', questionId);
    const questionSnap = await getDoc(questionRef);
    
    if (questionSnap.exists()) {
      return {
        id: questionSnap.id,
        ...questionSnap.data(),
      } as Question;
    }
    
    return null;
  } catch (error) {
    console.error('[Admin] Error fetching question:', error);
    throw error;
  }
}

/**
 * Get all questions with filters
 */
export async function getAllQuestions(filters?: {
  subject?: Subject;
  chapter?: string;
  difficulty?: string;
}): Promise<Question[]> {
  try {
    console.log('[Admin] Fetching questions with filters:', filters);
    
    let questionsQuery = collection(db, 'questions');
    const constraints = [];
    
    if (filters?.subject) {
      constraints.push(where('subject', '==', filters.subject));
    }
    if (filters?.chapter) {
      constraints.push(where('chapter', '==', filters.chapter));
    }
    if (filters?.difficulty) {
      constraints.push(where('difficulty', '==', filters.difficulty));
    }
    
    const q = constraints.length > 0 
      ? query(questionsQuery, ...constraints)
      : questionsQuery;
    
    const snapshot = await getDocs(q);
    const questions: Question[] = [];
    
    snapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        ...doc.data(),
      } as Question);
    });
    
    return questions;
  } catch (error) {
    console.error('[Admin] Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get unique chapters for a subject
 */
export async function getChaptersForSubject(subject: Subject): Promise<string[]> {
  try {
    const q = query(collection(db, 'questions'), where('subject', '==', subject));
    const snapshot = await getDocs(q);
    
    const chapters = new Set<string>();
    snapshot.forEach((doc) => {
      const chapter = doc.data().chapter;
      if (chapter) chapters.add(chapter);
    });
    
    return Array.from(chapters).sort();
  } catch (error) {
    console.error('[Admin] Error fetching chapters:', error);
    return [];
  }
}

/**
 * Get unique topics for a chapter
 */
export async function getTopicsForChapter(chapter: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'questions'), where('chapter', '==', chapter));
    const snapshot = await getDocs(q);
    
    const topics = new Set<string>();
    snapshot.forEach((doc) => {
      const topic = doc.data().topic;
      if (topic) topics.add(topic);
    });
    
    return Array.from(topics).sort();
  } catch (error) {
    console.error('[Admin] Error fetching topics:', error);
    return [];
  }
}

/**
 * Validate question data
 */
export function validateQuestion(question: AdminQuestion): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!question.text?.trim()) {
    errors.push('Question text is required');
  }
  
  if (!question.subject) {
    errors.push('Subject is required');
  }
  
  if (!question.chapter?.trim()) {
    errors.push('Chapter is required');
  }
  
  if (!question.topic?.trim()) {
    errors.push('Topic is required');
  }
  
  if (!question.difficulty) {
    errors.push('Difficulty is required');
  }
  
  if (!question.questionType) {
    errors.push('Question type is required');
  }
  
  if (!question.options || question.options.length === 0) {
    errors.push('At least one option is required');
  }
  
  const hasCorrectAnswer = question.options?.some(opt => opt.isCorrect);
  if (!hasCorrectAnswer) {
    errors.push('At least one option must be marked as correct');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
