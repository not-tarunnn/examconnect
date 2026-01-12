import React from 'react'
import HabitList from './HabitList'
import HabitGrid from './HabitGrid'
import HabitGraphs from './HabitGraphs'

export default function HabitPlanner() {
  return (
    <div className="w-full h-full flex flex-col p-3 md:p-4 gap-2 md:gap-3">
      {/* Top section: Left panel + Right grid */}
      <div className="flex gap-2 md:gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Habit List */}
        <div className="w-40 md:w-48 flex-shrink-0">
          <HabitList />
        </div>

        {/* Right Panel - 30-Day Grid */}
        <div className="flex-1 min-w-0">
          <HabitGrid />
        </div>
      </div>

      {/* Bottom section: Compact Graphs - 112px height (double) */}
      <div style={{ height: '112px' }} className="flex-shrink-0 w-full">
        <HabitGraphs />
      </div>
    </div>
  )
}
