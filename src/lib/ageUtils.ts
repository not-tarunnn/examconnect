import { Timestamp } from 'firebase/firestore';

/**
 * Calculate age from a Date of Birth
 * @param dob - Date of Birth as Date, Timestamp, or string (ISO format)
 * @returns Age in years, or undefined if calculation fails
 */
export function calculateAgeFromDOB(dob: any): number | undefined {
  if (!dob) return undefined;

  let dobDate: Date | null = null;

  // Handle Firestore Timestamp
  if (dob instanceof Timestamp) {
    dobDate = dob.toDate();
  }
  // Handle Date object
  else if (dob instanceof Date) {
    dobDate = dob;
  }
  // Handle string (ISO format or other formats)
  else if (typeof dob === 'string') {
    dobDate = new Date(dob);
  }
  // Handle numeric timestamp (milliseconds)
  else if (typeof dob === 'number') {
    dobDate = new Date(dob);
  }

  if (!dobDate || isNaN(dobDate.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDifference = today.getMonth() - dobDate.getMonth();

  // Adjust age if birthday hasn't occurred this year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  // Validate age is reasonable
  if (age < 0 || age > 150) {
    return undefined;
  }

  return age;
}

/**
 * Format DOB to a readable string
 * @param dob - Date of Birth as Date, Timestamp, or string
 * @returns Formatted date string
 */
export function formatDOB(dob: any): string {
  if (!dob) return '';

  let dobDate: Date | null = null;

  if (dob instanceof Timestamp) {
    dobDate = dob.toDate();
  } else if (dob instanceof Date) {
    dobDate = dob;
  } else if (typeof dob === 'string') {
    dobDate = new Date(dob);
  } else if (typeof dob === 'number') {
    dobDate = new Date(dob);
  }

  if (!dobDate || isNaN(dobDate.getTime())) {
    return '';
  }

  return dobDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
