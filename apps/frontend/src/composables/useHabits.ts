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

  // Отметить выполнение
  const markHabit = async (
    habitId: string,
    date: string = new Date().toISOString(),
  ) => {
    await habitStorage.saveLog(habitId, date, true);
  };

  // Отметить невыполнение
  const unmarkHabit = async (
    habitId: string,
    date: string = new Date().toISOString(),
  ) => {
    await habitStorage.saveLog(habitId, date, false);
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
    markHabit,
    unmarkHabit,
    loadHabits,
    onMounted,
  };
}
