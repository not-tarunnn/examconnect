export interface HabitDay {
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string; // hex color for the graph line
  createdAt: string;
  days: HabitDay[]; // 30-day window
}

export interface HabitStats {
  date: string;
  [habitId: string]: number | string; // number represents completion rate
}
