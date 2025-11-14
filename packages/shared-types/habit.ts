export interface Habit {
  id: string
  name: string
  emoji: string
  description?: string
  color?: string
  frequency: 'daily' | 'weekly'
  completed: boolean
  streak: number
  category: string
  createdAt: string
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
