import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useHabitStore } from '@/store/useHabitStore'

interface ChartData {
  date: string
  day: number
  [habitId: string]: number | string
}

export default function HabitGraphs() {
  const { habits } = useHabitStore()

  // Calculate completion over time (0 or 1 per day per habit)
  const chartData = useMemo(() => {
    if (habits.length === 0) return []

    const data: ChartData[] = []

    // Get all dates from the first habit (they should all have the same dates)
    if (habits.length > 0) {
      habits[0].days.forEach((dayData, index) => {
        const date = dayData.date
        const d = new Date(date)
        const monthDay = `${d.getMonth() + 1}/${d.getDate()}`

        const chartEntry: ChartData = {
          date: monthDay,
          day: d.getDate(),
        }

        // For each habit: 1 if completed, 0 if not
        habits.forEach((habit) => {
          const dayData = habit.days[index]
          chartEntry[habit.id] = dayData?.completed ? 1 : 0
        })

        // Calculate combined average (0 to 1 scale)
        const totalCompleted =
          Object.values(chartEntry).reduce((sum, val) => {
            if (typeof val === 'number') return sum + val
            return sum
          }, 0)

        chartEntry.average = Number((totalCompleted / habits.length).toFixed(2))

        data.push(chartEntry)
      })
    }

    return data
  }, [habits])

  if (habits.length === 0) {
    return null
  }

  return (
    <div className="w-full h-full bg-black/40 border border-white/10 rounded-lg overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 28, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '9px' }}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
            interval={4}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '9px' }}
            domain={[0, 1]}
            ticks={[0, 0.5, 1]}
            label={{ value: 'Tasks Done', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
            tick={{ fill: 'rgba(255, 255, 255, 0.6)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return value === 1 ? 'Done' : 'Not Done'
              }
              return value
            }}
          />

          {/* Individual habit lines - smooth curves */}
          {habits.map((habit) => (
            <Line
              key={habit.id}
              type="natural"
              dataKey={habit.id}
              stroke={habit.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name={habit.id}
              isMonotone={false}
            />
          ))}

          {/* Combined average line (white) - smooth curve */}
          <Line
            type="natural"
            dataKey="average"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
            isAnimationActive={false}
            name="average"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
