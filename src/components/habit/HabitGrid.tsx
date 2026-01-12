import React, { useMemo } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { Check } from 'lucide-react'

export default function HabitGrid() {
  const { habits, toggleDay } = useHabitStore()

  // Get the date range for the last 30 days
  const dateRange = useMemo(() => {
    const today = new Date()
    const dates = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }, [])

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>Add a habit to start tracking</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-black/40 border border-white/10 rounded-lg overflow-auto">
      {/* Grid Container */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Habit name column header */}
              <th className="sticky left-0 top-0 z-20 w-28 px-2 py-1.5 bg-black/80 text-left text-white font-semibold text-xs border-b border-white/10">
                Habits
              </th>

              {/* Date headers (30 days) */}
              {dateRange.map((date) => {
                const d = new Date(date)
                const day = d.getDate()

                return (
                  <th
                    key={date}
                    className="sticky top-0 z-10 w-7 px-0.5 py-1.5 bg-black/60 text-center text-gray-300 font-medium text-xs border-b border-white/10"
                    title={date}
                  >
                    <div className="text-xs text-gray-400">{day}</div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                {/* Habit Name Cell */}
                <td className="sticky left-0 z-10 w-28 px-2 py-1.5 bg-black/60 text-white font-medium text-xs border-b border-white/10 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 truncate">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="truncate">{habit.name}</span>
                  </div>
                </td>

                {/* Day Checkboxes */}
                {dateRange.map((date) => {
                  const dayData = habit.days.find((d) => d.date === date)
                  const completed = dayData?.completed ?? false

                  return (
                    <td
                      key={`${habit.id}-${date}`}
                      className="w-7 px-0.5 py-1.5 border-b border-white/10 text-center"
                    >
                      <button
                        onClick={() => toggleDay(habit.id, date)}
                        className={`mx-auto flex items-center justify-center w-6 h-6 rounded transition-all ${
                          completed
                            ? 'bg-green-600/80 text-white shadow-lg shadow-green-600/50'
                            : 'bg-white/5 border border-white/20 hover:bg-white/10 text-gray-400'
                        }`}
                        title={`Toggle ${habit.name} on ${date}`}
                      >
                        {completed && <Check size={12} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
