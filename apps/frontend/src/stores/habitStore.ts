import { defineStore } from "pinia";
import type { Habit } from "../../../../packages/shared-types/habit.ts";
import { habitStorageService } from "@/services/habitStorage.ts";

export const useHabitsStore = defineStore("habitStore", {
  state: () => ({
    habits: [] as Habit[],
    selectedDate: new Date(),
    filters: {
      showCompleted: true,
      category: "all",
    },
  }),

  getters: {
    dailyHabits: (state) => state.habits.filter((h) => h.frequency === "daily"),

    completionStats: (state) => {
      const completed = state.habits.filter((h) => h.completed).length;
      return {
        total: state.habits.length,
        completed,
        percentage: (completed / state.habits.length) * 100,
      };
    },
  },

  actions: {
    async loadHabits() {
      // Абстракция для перехода от localStorage к API
      this.habits = await habitStorageService.getHabits();
    },

    async toggleHabit(id: string) {
      const habit = this.habits.find((h) => h.id === id);
      if (habit) {
        habit.completed = !habit.completed;
        await habitStorageService.saveHabit(habit);
      }
    },
  },
});
