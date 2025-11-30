<script setup lang="ts">
/**
 * AnalyticsView Component
 * Full analytics page showing habit completion statistics using GitHub-style contribution graph
 * Displays activity data for all user habits across different time periods
 */
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import StreakDisplay from "../components/analytics/StreakDisplay.vue";
import CustomSelect from "@/components/common/CustomSelect.vue";
import type { SelectOption } from "@/components/common/CustomSelect.vue";
import { habitStorageService } from "../services/habitStorage";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";
import ActiveHabitsEmoji from "@/assets/emojis/Active Habits Emoji.svg";
import CompletedMonthEmoji from "@/assets/emojis/Emoji Completed Month.svg";
import CompletionRateEmoji from "@/assets/emojis/Emoji Completion Rate.svg";

const { t } = useI18n();

// State
const habits = ref<Habit[]>([]);
const logs = ref<HabitLog[]>([]);
const selectedHabitId = ref<string | "all">("all");
const isLoading = ref(true);

/**
 * Computed property: Filtered logs based on selected habit
 * Returns logs for specific habit or all logs if "all" is selected
 */
const filteredLogs = computed(() => {
  if (selectedHabitId.value === "all") {
    return logs.value;
  }
  return logs.value.filter((log) => log.habitId === selectedHabitId.value);
});

/**
 * Computed property: Selected habit details
 * Returns the habit object for the currently selected habit ID
 */
const selectedHabit = computed(() => {
  if (selectedHabitId.value === "all") {
    return null;
  }
  return habits.value.find((h) => h.id === selectedHabitId.value);
});

/**
 * Computed property: Base color for the streak display
 * Uses the selected habit's color or default green for "all habits"
 */
const displayColor = computed(() => {
  return selectedHabit.value?.color || "#10b981";
});

/**
 * Computed property: Title for the streak display
 * Shows habit name or "All Habits" based on selection
 */
const displayTitle = computed(() => {
  if (selectedHabitId.value === "all") {
    return t("analytics.allHabitsActivity");
  }
  return `${selectedHabit.value?.name}: ${t("analytics.activityTitle")}`;
});

/**
 * Computed property: Habit options for select
 * Generates options array with "All habits" option and individual habits with colors
 */
const habitOptions = computed<SelectOption[]>(() => {
  const allOption: SelectOption = {
    value: "all",
    label: t("analytics.allHabits"),
  };

  const habitOptionsList: SelectOption[] = habits.value.map((habit) => ({
    value: habit.id,
    label: habit.name,
    // Можно добавить иконку с цветом привычки, но пока просто название
  }));

  return [allOption, ...habitOptionsList];
});

/**
 * Load habits and logs from storage
 */
const loadData = async () => {
  isLoading.value = true;
  try {
    habits.value = await habitStorageService.getHabits();
    logs.value = habitStorageService.getLogs();
  } catch (error) {
    console.error("Error loading analytics data:", error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handle day click event from StreakDisplay
 * Can be used to show detailed information about a specific day
 */
const handleDayClick = (day: any) => {
  console.log("Day clicked:", day);
  // TODO: Implement day detail modal or tooltip
};

// Load data on component mount
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="analytics-view">
    <!-- Page header -->
    <div class="analytics-view__header">
      <h1 class="analytics-view__title">{{ t("analytics.pageTitle") }}</h1>
      <p class="analytics-view__subtitle">{{ t("analytics.pageSubtitle") }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="analytics-view__loading">
      <div class="loading-spinner"></div>
      <p>{{ t("analytics.loading") }}</p>
    </div>

    <!-- Main content -->
    <div v-else class="analytics-view__content">
      <!-- Habit filter selector -->
      <div class="habit-selector">
        <label class="habit-selector__label">{{
          t("analytics.selectHabit")
        }}</label>
        <CustomSelect
          v-model="selectedHabitId"
          :options="habitOptions"
          :placeholder="t('analytics.selectHabit')"
          :search-placeholder="t('analytics.searchHabit')"
          :no-results-text="t('analytics.noHabitsFound')"
        />
      </div>

      <!-- Streak display component -->
      <StreakDisplay
        v-if="filteredLogs.length > 0 || selectedHabitId === 'all'"
        :logs="filteredLogs"
        :base-color="displayColor"
        :title="displayTitle"
        :habit-id="selectedHabitId"
        @day-click="handleDayClick"
      />

      <!-- Empty state when no logs exist -->
      <div v-else class="analytics-view__empty">
        <div class="empty-state">
          <div class="empty-state__icon">
            <img :src="CompletionRateEmoji" alt="No Data" />
          </div>
          <h3 class="empty-state__title">{{ t("analytics.noData") }}</h3>
          <p class="empty-state__description">
            {{ t("analytics.noDataDescription") }}
          </p>
        </div>
      </div>

      <!-- Additional statistics cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon">
            <img :src="ActiveHabitsEmoji" alt="Total Habits" />
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">
              {{ t("analytics.stats.totalHabits") }}
            </p>
            <p class="stat-card__value">{{ habits.length }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card__icon">
            <img :src="CompletedMonthEmoji" alt="Total Completions" />
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">{{ t("analytics.stats.totalLogs") }}</p>
            <p class="stat-card__value">
              {{ filteredLogs.filter((log) => log.completed).length }}
            </p>
          </div>
        </div>

        <div class="stat-card stat-card--wide">
          <div class="stat-card__icon">
            <img :src="CompletionRateEmoji" alt="Completion Rate" />
          </div>
          <div class="stat-card__content">
            <p class="stat-card__label">
              {{ t("analytics.stats.completionRate") }}
            </p>
            <p class="stat-card__value">
              {{
                filteredLogs.length > 0
                  ? Math.round(
                      (filteredLogs.filter((log) => log.completed).length /
                        filteredLogs.length) *
                        100,
                    )
                  : 0
              }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main container */
.analytics-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Header section */
.analytics-view__header {
  margin-bottom: 32px;
}

.analytics-view__title {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.analytics-view__subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Loading state */
.analytics-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Content section */
.analytics-view__content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Habit selector */
.habit-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.habit-selector__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Empty state */
.analytics-view__empty {
  padding: 60px 20px;
}

.empty-state {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.empty-state__icon {
  font-size: 64px;
  margin-bottom: 16px;
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.empty-state__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.empty-state__description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Statistics grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 8px;
}

/* Третья карточка растягивается, если есть место для всех трех в ряд,
   или занимает всю ширину, если карточки переносятся */
@media (max-width: 850px) {
  .stats-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .stat-card--wide {
    grid-column: span 2;
  }
}

@media (min-width: 851px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-card__icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.stat-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-view {
    padding: 24px 16px;
  }

  .analytics-view__title {
    font-size: 24px;
  }

  .analytics-view__subtitle {
    font-size: 14px;
  }

  .habit-selector {
    padding: 16px;
  }
}
</style>
