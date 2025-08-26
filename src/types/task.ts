export type Task = {
  id: string;
  uid: string;
  title: string;
  subTasks: { title: string; done: boolean }[];
  subject: string;
  priority: "low" | "medium" | "high"; // Updated to match SM-18 format
  dueDate: string;
  createdAt: string;
  completed: boolean;
  status: "pending" | "completed";

  // User feedback (1-5 star rating after completion)
  userRating?: number; // Renamed from difficulty to avoid conflict

  // SM-18 Algorithm fields
  stability?: number;             // days (half-life)
  difficulty?: number;            // 0..1 (1 = very hard) - SM-18 algorithmic difficulty
  retrievability?: number;        // predicted retrievability at next due (0..1)
  priorityWeight?: number;        // numeric: 0.95/0.90/0.85
  lastReviewedAt?: string | null; // ISO string for client compatibility
  dueAt?: string | null;          // ISO string for client compatibility
  lapses?: number;                // number of failures
  sleepFactor?: number;           // cached last factor used
  updatedAt?: string;
};
