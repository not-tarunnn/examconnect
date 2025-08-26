// src/lib/test-sm18.ts
/**
 * Test utility for SM-18 integration
 * This can be used to verify the system is working correctly
 */

export interface SM18TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * Test if SM-18 API is working
 */
export async function testSM18API(taskId: string, uid: string, grade: number = 4): Promise<SM18TestResult> {
  try {
    const response = await fetch('/api/tasks/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        uid,
        grade,
      }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      return {
        success: true,
        message: `SM-18 API test successful. Grade ${grade} processed.`,
        data: result,
      };
    } else {
      return {
        success: false,
        message: `SM-18 API test failed: ${result.error || 'Unknown error'}`,
        error: result,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `SM-18 API test failed with exception: ${error}`,
      error,
    };
  }
}

/**
 * Test due tasks API
 */
export async function testDueTasksAPI(uid: string): Promise<SM18TestResult> {
  try {
    const response = await fetch(`/api/tasks/due?uid=${uid}&action=prioritized&limit=5`);
    const result = await response.json();

    if (response.ok && result.ok) {
      return {
        success: true,
        message: `Due tasks API test successful. Found ${result.count} prioritized tasks.`,
        data: result,
      };
    } else {
      return {
        success: false,
        message: `Due tasks API test failed: ${result.error || 'Unknown error'}`,
        error: result,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Due tasks API test failed with exception: ${error}`,
      error,
    };
  }
}

/**
 * Grade mapping for reference
 */
export const SM18_GRADES = {
  1: "Failed - Need to try again",
  2: "Struggled - Partial understanding", 
  3: "Challenging - Got it with effort",
  4: "Good - Performed well",
  5: "Easy - Mastered it"
} as const;

/**
 * Console logger for SM-18 operations
 */
export function logSM18Operation(operation: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SM-18] ${operation}:`, data);
  }
}
