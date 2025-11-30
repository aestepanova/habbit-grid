<script setup lang="ts">
/**
 * HabitsTableView Component
 * Table-based view of habits with days of the month as columns
 * Features:
 * - Fixed left column with habit names
 * - Horizontally scrollable days columns
 * - Interactive checkboxes for marking completion
 * - Month navigation
 */
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useHabits } from "../composables/useHabits";
import { habitStorageService } from "../services/habitStorage";
import type { HabitLog } from "../../../../packages/shared-types/habit.ts";

const { t, locale } = useI18n();
const { habits, markHabitDate } = useHabits();

// Current month being displayed
const currentDate = ref(new Date());

// Reactive logs state for real-time updates
const logs = ref<HabitLog[]>([]);

// Load logs on mount and when habits change
const loadLogs = () => {
  logs.value = habitStorageService.getLogs();
};

/**
 * Computed property: Days in the current month
 * Generates array of dates for all days in the selected month
 */
const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let day = 1; day <= daysCount; day++) {
    days.push(new Date(year, month, day));
  }
  return days;
});

/**
 * Computed property: Current month name and year
 * Uses the current i18n locale for proper localization
 */
const monthYear = computed(() => {
  return currentDate.value.toLocaleDateString(locale.value, {
    month: "long",
    year: "numeric",
  });
});

/**
 * Check if habit is completed on a specific date
 */
const isCompleted = (habitId: string, date: Date): boolean => {
  const dateStr = date.toISOString().split("T")[0];
  const log = logs.value.find(
    (l) => l.habitId === habitId && l.date === dateStr,
  );
  return log?.completed || false;
};

/**
 * Toggle habit completion for a specific date
 */
const toggleCompletion = async (habitId: string, date: Date) => {
  const dateStr = date.toISOString().split("T")[0];
  if (!dateStr) return;

  const currentStatus = isCompleted(habitId, date);
  await markHabitDate(habitId, dateStr, !currentStatus);

  // Reload logs immediately to update UI
  loadLogs();
};

/**
 * Navigate to previous month
 */
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  );
};

/**
 * Navigate to next month
 */
const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  );
};

/**
 * Go back to current month
 */
const goToCurrentMonth = () => {
  currentDate.value = new Date();
};

/**
 * Get day of week name
 * Uses the current i18n locale for proper localization
 */
const getDayName = (date: Date): string => {
  return date.toLocaleDateString(locale.value, { weekday: "short" });
};

/**
 * Check if date is today
 */
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Initialize logs on component mount
loadLogs();
</script>

<template>
  <div class="table-view">
    <!-- Header with month navigation -->
    <div class="table-view__header">
      <div class="month-navigation">
        <button
          class="nav-button"
          @click="previousMonth"
          :title="t('table.previousMonth')"
        >
          ‹
        </button>
        <h2 class="month-title">{{ monthYear }}</h2>
        <button
          class="nav-button"
          @click="nextMonth"
          :title="t('table.nextMonth')"
        >
          ›
        </button>
        <button class="today-button" @click="goToCurrentMonth">
          {{ t("table.today") }}
        </button>
      </div>
    </div>

    <!-- Table container -->
    <div class="table-container">
      <!-- Empty state when no habits exist -->
      <div v-if="!habits || habits.length === 0" class="empty-state">
        <p class="empty-state__message">{{ t("table.noHabits") }}</p>
      </div>

      <!-- Habits table -->
      <div v-else class="table-wrapper">
        <!-- Fixed left column: Habit names -->
        <div class="habits-column">
          <div class="habits-column__header">{{ t("table.habits") }}</div>
          <div v-for="habit in habits" :key="habit.id" class="habit-row">
            <div class="habit-name">
              <div
                class="habit-color"
                :style="{ backgroundColor: habit.color }"
              ></div>
              <span class="habit-name__text">{{ habit.name }}</span>
            </div>
          </div>
        </div>

        <!-- Scrollable days grid -->
        <div class="days-container">
          <div class="days-grid">
            <!-- Day headers -->
            <div class="day-header-row">
              <div
                v-for="date in daysInMonth"
                :key="date.toISOString()"
                class="day-header"
                :class="{ 'day-header--today': isToday(date) }"
              >
                <div class="day-header__number">{{ date.getDate() }}</div>
                <div class="day-header__name">{{ getDayName(date) }}</div>
              </div>
            </div>

            <!-- Habit completion rows -->
            <div v-for="habit in habits" :key="habit.id" class="completion-row">
              <div
                v-for="date in daysInMonth"
                :key="`${habit.id}-${date.toISOString()}`"
                class="completion-cell"
                :class="{ 'completion-cell--today': isToday(date) }"
                @click="toggleCompletion(habit.id, date)"
              >
                <div
                  class="completion-checkbox-wrapper"
                  :class="{ 'is-completed': isCompleted(habit.id, date) }"
                  :style="{
                    backgroundColor: isCompleted(habit.id, date)
                      ? habit.color
                      : 'transparent',
                    borderColor: habit.color,
                  }"
                >
                  <svg
                    v-if="isCompleted(habit.id, date)"
                    class="checkmark"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main container */
.table-view {
  max-width: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: hidden;
}

/* Header with month navigation */
.table-view__header {
  margin-bottom: 24px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-button {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.nav-button:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.month-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.today-button {
  padding: 8px 16px;
  border: 2px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-button:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* Table container */
.table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

/* Empty state */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state__message {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Table wrapper */
.table-wrapper {
  display: flex;
  overflow: hidden;
}

/* Fixed left column: Habits */
.habits-column {
  flex-shrink: 0;
  width: 20vw;
  border-right: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.habits-column__header {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-bg-card);
}

.habit-row {
  height: 61px;
  border-bottom: 1px solid var(--color-border);
}

.habit-name {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.habit-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.habit-name__text {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Scrollable days container */
.days-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
}

.days-grid {
  display: inline-block;
  min-width: 100%;
}

/* Day headers row */
.day-header-row {
  display: flex;
  height: 80px;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-bg-card);
}

.day-header {
  width: 60px;
  height: 78px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-right: 1px solid var(--color-border);
  position: relative;
}

.day-header--today {
  background: rgba(59, 130, 246, 0.1);
}

.day-header--today::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
}

.day-header__number {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.day-header__name {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Completion rows */
.completion-row {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.completion-row:last-child {
  border-bottom: none;
}

.completion-cell {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.completion-cell:hover {
  background: var(--color-bg-secondary);
}

.completion-cell--today {
  background: rgba(59, 130, 246, 0.05);
}

.completion-checkbox-wrapper {
  width: 22px;
  height: 22px;
  border: 2px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  pointer-events: none;
}

.completion-checkbox-wrapper.is-completed {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.checkmark {
  width: 16px;
  height: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-view {
    padding: 16px;
  }

  .habits-column {
    width: 150px;
  }

  .month-title {
    font-size: 18px;
  }

  .nav-button {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .today-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .day-header {
    width: 50px;
    height: 80px;
  }

  .completion-cell {
    width: 50px;
    height: 50px;
  }

  .habit-name__text {
    font-size: 13px;
  }
}

/* Scrollbar styling */
.days-container::-webkit-scrollbar {
  height: 8px;
}

.days-container::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.days-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.days-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}
</style>
