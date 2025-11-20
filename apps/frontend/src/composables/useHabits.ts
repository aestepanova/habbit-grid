import { computed, onMounted, ref } from "vue";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";
import { habitStorageService as habitStorage } from "@/services/habitStorage";

export function useHabits() {
  const habits = ref<Habit[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const logs = ref<HabitLog[]>([]);

  const loadHabits = async () => {
    loading.value = true;
    error.value = null;

    try {
      habits.value = await habitStorage.getHabits();
    } catch (err) {
      error.value = "Ошибка при загрузке привычек";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const reloadHabits = async () => {
    console.log("🔄 Перезагрузка привычек...");
    await loadHabits();
  };

  const addHabit = async (habit: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    await habitStorage.saveHabit(newHabit);
    habits.value.push(newHabit);
  };

  const updateHabit = async (habit: Habit) => {
    await habitStorage.saveHabit(habit);
    const index = habits.value.findIndex((h) => h.id === habit.id);
    if (index >= 0) {
      habits.value[index] = habit;
    }
  };

  // Удалить привычку
  const deleteHabit = async (habitId: string) => {
    await habitStorage.deleteHabit(habitId);
    habits.value = habits.value.filter((h) => h.id !== habitId);
  };

  // Отметить выполнение за конкретный день
  const markHabitDate = async (
    habitId: string,
    date: string,
    completed: boolean = true,
  ) => {
    await habitStorage.saveLog(habitId, date, completed);
  };

  // Отметить сегодня
  const markHabitsToday = async (
    habitId: string,
    completed: boolean = true,
  ) => {
    const today = new Date().toISOString().split("T")[0];
    if (today) {
      await habitStorage.saveLog(habitId, today, completed);
    }
  };

  // Отметить неделю дней назад
  const markHabitWeekAgo = async (
    habitId: string,
    daysAgo: number,
    completed: boolean = true,
  ) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr) {
      await habitStorage.saveLog(habitId, dateStr, completed);
    }
  };

  // Получить все логи привычки
  const getHabitLogs = (habitId: string) => {
    return habitStorage.getHabitLogs(habitId);
  };

  // Проверить, выполнена ли привычка в конкретный день
  const isCompletedOn = (habitId: string, date: string): boolean => {
    const logs = habitStorage.getHabitLogs(habitId);
    return logs.some((log) => log.date === date && log.completed);
  };

  // Проверить, выполнена ли привычка сегодня
  const isCompletedToday = (habitId: string): boolean => {
    const today = new Date().toISOString().split("T")[0];
    if (today) {
      return isCompletedOn(habitId, today);
    } else return false;
  };

  const dailyHabits = computed(() =>
    habits.value.filter((h) => h.frequency === "daily"),
  );

  const completionRate = computed(() => {
    const total = habits.value.length;
    const completed = habits.value.filter((h) => h.completed).length;
    return total > 0 ? (completed / total) * 100 : 0;
  });

  onMounted(async () => {
    await loadHabits();
  });

  return {
    habits,
    dailyHabits,
    completionRate,
    loading,
    error,
    addHabit,
    deleteHabit,
    updateHabit,
    markHabitDate,
    markHabitsToday,
    markHabitWeekAgo,
    isCompletedOn,
    isCompletedToday,
    loadHabits,
    reloadHabits,
    onMounted,
  };
}
