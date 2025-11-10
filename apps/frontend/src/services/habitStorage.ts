import type {
  Habit,
  UserStats,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";

interface StorageAdapter {
  getHabits(): Promise<Habit[]>;
  saveHabit(habit: Habit): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;
  getLogs(): HabitLog[];
  saveLog(habitId: string, date: string, completed: boolean): Promise<void>;
  deleteHabitLogs(habitId: string): Promise<void>;
  getHabitLogs(habitId: string): HabitLog[];
  getStats(): Promise<UserStats>;
}

const HABITS_KEY = "habits";
const STATS_KEY = "stats";
const LOGS_KEY = "habitLogs";

const defaultStats: UserStats = {
  totalHabits: 0,
  completedToday: 0,
  currentStreak: 0,
  energyLevel: 0,
  sleepQuality: 0,
};

const defaultHabit: Habit = {
  id: "1",
  name: "Test habit",
  emoji: "⚙️",
  frequency: "daily",
  completed: true,
  streak: 0,
  category: "Health",
  createdAt: new Date("2021-07-25"),
};

class LocalStorageAdapter implements StorageAdapter {
  async getHabits(): Promise<Habit[]> {
    try {
      const data = localStorage.getItem(HABITS_KEY);
      return data ? JSON.parse(data) : [defaultHabit];
    } catch (error) {
      console.error("Ошибка при чтении привычек:", error);
      return [];
    }
  }

  async saveHabit(habit: Habit): Promise<void> {
    try {
      const habits = await this.getHabits();
      const index = habits.findIndex((h) => h.id === habit.id);

      if (index >= 0) {
        habits[index] = habit;
      } else {
        habits.push(habit);
      }

      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error("Ошибка при сохранении привычки:", error);
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const habits = await this.getHabits();
      const filtered = habits.filter((h) => h.id !== habitId);
      localStorage.setItem(HABITS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Ошибка при удалении привычки:", error);
    }
  }

  async getStats(): Promise<UserStats> {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : defaultStats;
  }

  clear(): void {
    localStorage.removeItem(HABITS_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(LOGS_KEY);
  }

  getLogs(): HabitLog[] {
    try {
      const data = localStorage.getItem(LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Ошибка при чтении логов:", error);
      return [];
    }
  }

  async saveLog(
    habitId: string,
    date: string,
    completed: boolean,
  ): Promise<void> {
    try {
      const logs = await this.getLogs();
      const existingIndex = logs.findIndex(
        (l) => l.habitId === habitId && l.date === date,
      );

      const log: HabitLog = { habitId, date, completed };

      if (existingIndex >= 0) {
        logs[existingIndex] = log;
      } else {
        logs.push(log);
      }

      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error("Ошибка при сохранении лога:", error);
    }
  }

  async deleteHabitLogs(habitId: string): Promise<void> {
    try {
      const logs = this.getLogs();
      const filtered = logs.filter((l) => l.habitId !== habitId);
      localStorage.setItem(LOGS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Ошибка при удалении логов:", error);
    }
  }

  getHabitLogs(habitId: string): HabitLog[] {
    const logs = this.getLogs();
    return logs.filter((l) => l.habitId === habitId);
  }
}

class APIAdapter implements StorageAdapter {
  async getHabits(): Promise<Habit[]> {
    const response = await fetch("/api/habits");
    return response.json();
  }

  async saveHabit(habits: Habit): Promise<void> {
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habits),
    });
  }

  async getStats(): Promise<UserStats> {
    const response = await fetch("/api/stats");
    return response.json();
  }

  deleteHabit(habitId: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  deleteHabitLogs(habitId: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  getHabitLogs(habitId: string): HabitLog[] {
    return [];
  }

  getLogs(): HabitLog[] {
    return [];
  }

  saveLog(habitId: string, date: string, completed: boolean): Promise<void> {
    return Promise.resolve(undefined);
  }
}

// Экспортируем текущий адаптер
export const habitStorageService: StorageAdapter =
  import.meta.env.VITE_USE_API === "true"
    ? new APIAdapter()
    : new LocalStorageAdapter();
