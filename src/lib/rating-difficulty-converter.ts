// src/lib/rating-difficulty-converter.ts

/**
 * Converts user rating (1-5) to SM-18 algorithmic difficulty (0-1)
 * 
 * Mapping:
 * 5 stars (Easy - Mastered it) → 0.0-0.2 difficulty (very low)
 * 4 stars (Good - Performed well) → 0.2-0.4 difficulty (low) 
 * 3 stars (Challenging - Got it with effort) → 0.4-0.6 difficulty (medium)
 * 2 stars (Struggled - Partial understanding) → 0.6-0.8 difficulty (high)
 * 1 star (Failed - Need to try again) → 0.8-1.0 difficulty (very high)
 */

export function userRatingToDifficulty(userRating: number): number {
  // Clamp rating to valid range
  const rating = Math.max(1, Math.min(5, Math.round(userRating)));
  
  // Convert 1-5 to 0-1 (inverted scale)
  // Formula: (6 - rating) / 5 gives us a nice distribution
  // 5 → (6-5)/5 = 0.2
  // 4 → (6-4)/5 = 0.4  
  // 3 → (6-3)/5 = 0.6
  // 2 → (6-2)/5 = 0.8
  // 1 → (6-1)/5 = 1.0
  
  const baseDifficulty = (6 - rating) / 5;
  
  // Add some variation within each band to avoid exact values
  const variation = (Math.random() - 0.5) * 0.1; // ±0.05 variation
  const difficulty = Math.max(0, Math.min(1, baseDifficulty + variation));
  
  return Number(difficulty.toFixed(3));
}

/**
 * Convert difficulty back to expected user rating range for display
 */
export function difficultyToExpectedRating(difficulty: number): number {
  // Inverse of the conversion formula
  const rating = 6 - (difficulty * 5);
  return Math.max(1, Math.min(5, Math.round(rating)));
}

/**
 * Get difficulty description based on user rating
 */
export function getDifficultyDescription(userRating: number): string {
  switch(userRating) {
    case 5: return "Very Low Difficulty (Mastered)";
    case 4: return "Low Difficulty (Good Performance)";
    case 3: return "Medium Difficulty (Challenging)";
    case 2: return "High Difficulty (Struggled)";
    case 1: return "Very High Difficulty (Failed)";
    default: return "Unknown Difficulty";
  }
}

/**
 * Update SM-18 difficulty using historical user ratings
 * This provides a more nuanced approach by considering multiple ratings
 */
export function calculateAdaptiveDifficulty(
  currentDifficulty: number,
  newUserRating: number,
  previousRatings: number[] = [],
  adaptationRate: number = 0.3
): number {
  const newTargetDifficulty = userRatingToDifficulty(newUserRating);
  
  // If we have no history, use the new rating directly
  if (previousRatings.length === 0) {
    return newTargetDifficulty;
  }
  
  // Calculate weighted average of recent ratings (last 3-5 ratings get more weight)
  const recentRatings = [...previousRatings.slice(-5), newUserRating];
  const weights = recentRatings.map((_, index) => Math.pow(1.2, index)); // Recent ratings get more weight
  
  const weightedSum = recentRatings.reduce((sum, rating, index) => sum + rating * weights[index], 0);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const averageRating = weightedSum / weightSum;
  
  const averageTargetDifficulty = userRatingToDifficulty(averageRating);
  
  // Gradually adapt towards the new target difficulty
  const adaptedDifficulty = currentDifficulty + (averageTargetDifficulty - currentDifficulty) * adaptationRate;
  
  return Number(Math.max(0, Math.min(1, adaptedDifficulty)).toFixed(3));
}

/**
 * Validation function to ensure rating is valid
 */
export function validateUserRating(rating: any): number | null {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return null;
  }
  
  const rounded = Math.round(rating);
  if (rounded < 1 || rounded > 5) {
    return null;
  }
  
  return rounded;
}

/**
 * Debug info for development
 */
export function getConversionDebugInfo(userRating: number) {
  const difficulty = userRatingToDifficulty(userRating);
  const expectedRating = difficultyToExpectedRating(difficulty);
  const description = getDifficultyDescription(userRating);
  
  return {
    userRating,
    difficulty,
    expectedRating,
    description,
    mappingCorrect: Math.abs(userRating - expectedRating) <= 1,
  };
}
