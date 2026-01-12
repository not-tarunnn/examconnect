import React, { useState } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { Check, X, Plus } from 'lucide-react'

export default function HabitList() {
  const { habits, addHabit, removeHabit } = useHabitStore()
  const [newHabitName, setNewHabitName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6')

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName, newHabitColor)
      setNewHabitName('')
      setNewHabitColor('#3b82f6')
      setShowInput(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddHabit()
    } else if (e.key === 'Escape') {
      setShowInput(false)
      setNewHabitName('')
    }
  }

  return (
    <div className="h-full bg-black/40 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-bold text-white">Habits</h2>
        <button
          onClick={() => setShowInput(true)}
          className="p-1.5 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors"
          title="Add new habit"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add New Habit Input */}
      {showInput && (
        <div className="flex gap-1.5 flex-shrink-0">
          <input
            autoFocus
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Name..."
            className="flex-1 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleAddHabit}
            className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition-colors flex-shrink-0"
            title="Confirm"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setShowInput(false)
              setNewHabitName('')
              setNewHabitColor('#3b82f6')
            }}
            className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition-colors flex-shrink-0"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Habit List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {habits.length === 0 ? (
          <p className="text-gray-400 text-xs italic">No habits yet</p>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-white text-xs font-medium truncate">{habit.name}</span>
              </div>
              <button
                onClick={() => removeHabit(habit.id)}
                className="p-0.5 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                title="Delete"
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {habits.length > 0 && (
        <div className="border-t border-white/10 pt-1.5 mt-auto text-xs text-gray-400 flex-shrink-0">
          <p>{habits.length} habit{habits.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
