import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Habit, HabitDay } from '@/types/habit'

interface HabitState {
  habits: Habit[]
  addHabit: (name: string, color: string) => void
  removeHabit: (id: string) => void
  toggleDay: (habitId: string, date: string) => void
  getHabit: (id: string) => Habit | undefined
  getAllHabits: () => Habit[]
}

// Color palette for habits
const HABIT_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#14b8a6', // teal
]

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],

      addHabit: (name: string, color?: string) => {
        const id = `habit-${Date.now()}`
        const selectedColor = color || HABIT_COLORS[get().habits.length % HABIT_COLORS.length]
        
        // Initialize 30 days of data
        const today = new Date()
        const days: HabitDay[] = []
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - (29 - i))
          days.push({
            date: date.toISOString().split('T')[0],
            completed: false,
          })
        }

        const newHabit: Habit = {
          id,
          name,
          color: selectedColor,
          createdAt: new Date().toISOString(),
          days,
        }

        set((state) => ({
          habits: [...state.habits, newHabit],
        }))
      },

      removeHabit: (id: string) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }))
      },

      toggleDay: (habitId: string, date: string) => {
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id === habitId) {
              return {
                ...habit,
                days: habit.days.map((day) => {
                  if (day.date === date) {
                    return { ...day, completed: !day.completed }
                  }
                  return day
                }),
              }
            }
            return habit
          }),
        }))
      },

      getHabit: (id: string) => {
        return get().habits.find((h) => h.id === id)
      },

      getAllHabits: () => {
        return get().habits
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
    }
  )
)
