export interface Habit {
  id: string
  name: string
  emoji: string
  frequency: 'daily' | 'weekly'
  completed: boolean
  streak: number
  category: string
  createdAt: Date
}

export interface HabitLog {
  habitId: string
  date: string
  completed: boolean
}

export interface UserStats {
  totalHabits: number
  completedToday: number
  currentStreak: number
  energyLevel: number
  sleepQuality: number
}
