<template>
  <div class="streak-display">
    <!-- Header with period selector -->
    <div class="streak-display__header">
      <h3 class="streak-display__title">
        {{ title || t("streakDisplay.title") }}
      </h3>
      <div class="streak-display__period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="[
            'period-btn',
            { 'period-btn--active': selectedPeriod === period.value },
          ]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Interactive mode hint -->
    <div v-if="habitId" class="streak-display__hint">
      <span class="hint-icon">👆</span>
      <span class="hint-text">{{ t("datePicker.selectDate") }}</span>
    </div>

    <!-- Statistics legend with information -->
    <div class="streak-display__info">
      <div class="info-item">
        <span class="info-label">{{
          t("streakDisplay.stats.currentStreak")
        }}</span>
        <span class="info-value"
          >{{ currentStreak }}
          {{ t(`streakDisplay.days.${getDeclension(currentStreak)}`) }}</span
        >
      </div>
      <div class="info-item">
        <span class="info-label">{{
          t("streakDisplay.stats.longestStreak")
        }}</span>
        <span class="info-value"
          >{{ longestStreak }}
          {{ t(`streakDisplay.days.${getDeclension(longestStreak)}`) }}</span
        >
      </div>
      <div class="info-item">
        <span class="info-label">{{
          t("streakDisplay.stats.totalCompletions")
        }}</span>
        <span class="info-value">{{ totalCompletions }}</span>
      </div>
    </div>

    <!-- Activity grid container -->
    <div class="streak-display__grid-container">
      <!-- Month labels -->
      <div class="month-labels">
        <span
          v-for="(month, index) in monthLabels"
          :key="index"
          class="month-label"
          :style="{ gridColumn: month.column }"
        >
          {{ month.name }}
        </span>
      </div>

      <!-- Grid with squares -->
      <div class="activity-grid">
        <!-- Weekday labels - only show for periods > 7 days -->
        <div v-if="selectedPeriod > 7" class="weekday-labels">
          <span class="weekday-label">{{ t("weekdays.monday") }}</span>
          <span class="weekday-label">{{ t("weekdays.tuesday") }}</span>
          <span class="weekday-label">{{ t("weekdays.wednesday") }}</span>
          <span class="weekday-label">{{ t("weekdays.thursday") }}</span>
          <span class="weekday-label">{{ t("weekdays.friday") }}</span>
          <span class="weekday-label">{{ t("weekdays.saturday") }}</span>
          <span class="weekday-label">{{ t("weekdays.sunday") }}</span>
        </div>

        <!-- Activity cells (squares) -->
        <div
          class="activity-cells"
          :class="{
            'activity-cells--week': selectedPeriod === 7,
            'activity-cells--month': selectedPeriod === 30,
            'activity-cells--half-year': selectedPeriod === 180,
            'activity-cells--year': selectedPeriod === 365,
          }"
        >
          <div
            v-for="(day, index) in activityData"
            :key="index"
            :class="[
              'activity-cell',
              `activity-level-${day.level}`,
              { 'activity-cell--clickable': habitId },
            ]"
            :style="getCellStyle(day.level)"
            :title="getCellTitle(day)"
            @click="handleCellClick(day, $event)"
          >
            <span v-if="day.streak > 1" class="streak-indicator">{{
              day.streak
            }}</span>
          </div>
        </div>
      </div>

      <!-- Intensity legend -->
      <div class="intensity-legend">
        <span class="legend-label">{{ t("streakDisplay.legend.less") }}</span>
        <div
          v-for="level in 5"
          :key="level"
          :class="['legend-cell', `activity-level-${level - 1}`]"
          :style="getCellStyle(level - 1)"
        />
        <span class="legend-label">{{ t("streakDisplay.legend.more") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * StreakDisplay Component
 * GitHub-style contribution graph for habit tracking
 * Shows a heatmap of habit completion over selected time periods
 */
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { HabitLog } from "../../../../../packages/shared-types/habit.ts";

const { t, locale } = useI18n();

/**
 * Interface representing a single day's activity
 */
interface ActivityDay {
  date: string; // ISO date format (YYYY-MM-DD)
  count: number; // Number of habits completed on this day
  level: number; // Intensity level (0-4) for color gradient (based on streak for single habit, count for all habits)
  streak: number; // Current streak count at this day
  dayOfWeek: number; // Day of week (0 = Sunday, 6 = Saturday)
}

/**
 * Component props
 */
interface Props {
  logs?: HabitLog[]; // Array of all habit completion logs
  title?: string; // Component title (optional, uses i18n by default)
  baseColor?: string; // Base color for gradient (hex format, e.g., #10b981)
  habitId?: string; // Habit ID for single habit view (enables date marking)
}

// Default prop values
const props = withDefaults(defineProps<Props>(), {
  logs: () => [],
  title: "",
  baseColor: "#10b981", // Default green color
  habitId: undefined,
});

/**
 * Component events
 */
const emit = defineEmits<{
  "day-click": [day: ActivityDay]; // Triggered when clicking on a day cell
  "mark-date": [habitId: string, date: string, completed: boolean]; // Triggered when toggling date completion
}>();

/**
 * Available time periods for display
 * Labels are localized via i18n
 */
const periods = computed(() => [
  { value: 7, label: t("streakDisplay.periods.week") },
  { value: 30, label: t("streakDisplay.periods.month") },
  { value: 180, label: t("streakDisplay.periods.halfYear") },
  { value: 365, label: t("streakDisplay.periods.year") },
]);

// Currently selected period (default: month)
const selectedPeriod = ref(30);

/**
 * Computed property: Activity data for the selected period
 * Generates an array of ActivityDay objects with completion counts and intensity levels
 */
const activityData = computed(() => {
  const days: ActivityDay[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - selectedPeriod.value + 1);

  // Group logs by date
  const logsByDate = new Map<string, number>();
  props.logs.forEach((log) => {
    if (log.completed) {
      const count = logsByDate.get(log.date) || 0;
      logsByDate.set(log.date, count + 1);
    }
  });

  // Find max count for normalization
  const maxCount = Math.max(...Array.from(logsByDate.values()), 1);

  // Check if this is a single habit view (habitId is provided)
  const isSingleHabit = !!props.habitId;

  // Create data for each day
  let currentStreak = 0;
  for (let i = 0; i < selectedPeriod.value; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    let count = 0;
    if (dateStr) {
      count = logsByDate.get(dateStr) || 0;
    }

    // Update streak counter
    if (count > 0) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }

    // Calculate intensity level (0-4)
    let level = 0;
    if (count > 0) {
      if (isSingleHabit) {
        // For single habit: use streak to determine intensity
        // Level based on current streak length:
        // 1: streak 1, 2: streak 2-3, 3: streak 4-6, 4: streak 7+
        if (currentStreak >= 7) level = 4;
        else if (currentStreak >= 4) level = 3;
        else if (currentStreak >= 2) level = 2;
        else level = 1;
      } else {
        // For all habits: use count normalization
        // Level determines the color saturation:
        // 0: no activity, 1: 1-24%, 2: 25-49%, 3: 50-74%, 4: 75-100%
        const normalized = count / maxCount;
        if (normalized >= 0.75) level = 4;
        else if (normalized >= 0.5) level = 3;
        else if (normalized >= 0.25) level = 2;
        else level = 1;
      }
    }

    days.push({
      date: dateStr || "",
      count,
      level,
      streak: currentStreak,
      dayOfWeek: date.getDay(),
    });
  }

  return days;
});

/**
 * Computed property: Month labels for the grid
 * Returns array of month names with their grid column positions
 * Month names are localized based on current locale
 */
const monthLabels = computed(() => {
  const labels: { name: string; column: number }[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - selectedPeriod.value + 1);

  let currentMonth = -1;

  for (let i = 0; i < selectedPeriod.value; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Add label when month changes
    if (date.getMonth() !== currentMonth) {
      currentMonth = date.getMonth();
      labels.push({
        name: date.toLocaleDateString(locale.value, { month: "short" }),
        column: Math.floor(i / 7) + 1,
      });
    }
  }

  return labels;
});

/**
 * Computed property: Current streak
 * Calculates the number of consecutive days with activity from today backwards
 */
const currentStreak = computed(() => {
  let streak = 0;
  const sortedData = [...activityData.value].reverse();

  for (const day of sortedData) {
    if (day.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
});

/**
 * Computed property: Longest streak
 * Finds the maximum consecutive days with activity in the entire period
 */
const longestStreak = computed(() => {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const day of activityData.value) {
    if (day.count > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
});

/**
 * Computed property: Total completions
 * Sums up all habit completions across the entire period
 */
const totalCompletions = computed(() => {
  return activityData.value.reduce((sum, day) => sum + day.count, 0);
});

/**
 * Function: Get cell style
 * Returns CSS styles for activity cell based on intensity level
 * @param level - Intensity level (0-4)
 * @returns Object with backgroundColor and border styles
 */
const getCellStyle = (level: number) => {
  if (level === 0) {
    return {
      backgroundColor: "var(--color-bg-secondary)",
      border: "1px solid var(--color-border)",
    };
  }

  // Convert hex color to rgb for opacity application
  const hex = props.baseColor;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calculate opacity: level 1=0.4, 2=0.6, 3=0.8, 4=1.0
  const opacity = 0.2 + level * 0.2;

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    border: `1px solid ${props.baseColor}`,
  };
};

/**
 * Function: Get cell title (tooltip text)
 * Generates tooltip text for activity cell showing date and completion count
 * Uses i18n for localization
 * @param day - ActivityDay object
 * @returns Formatted tooltip string
 */
const getCellTitle = (day: ActivityDay) => {
  const date = new Date(day.date);
  const dateStr = date.toLocaleDateString(locale.value, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let baseText;
  if (day.count === 0) {
    baseText = `${dateStr}: ${t("streakDisplay.tooltip.noActivity")}`;
  } else {
    const completionText = t(
      `streakDisplay.tooltip.completions.${getDeclension(day.count)}`,
    );
    baseText = `${dateStr}: ${day.count} ${completionText}`;
  }

  // Add click hint if habitId is provided (single habit view)
  if (props.habitId) {
    const action =
      day.count === 0
        ? t("datePicker.markCompleted")
        : t("datePicker.markIncomplete");
    baseText += `\n${action}`;
  }

  return baseText;
};

/**
 * Function: Get declension key for pluralization
 * Returns the appropriate key for pluralization based on count and current locale
 * @param count - Number to determine pluralization
 * @returns Pluralization key ("one", "few", "many", or "other")
 */
const getDeclension = (count: number): string => {
  // For Russian locale, use complex declension rules
  if (locale.value === "ru") {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ["one", "few", "many"];
    const index =
      count % 100 > 4 && count % 100 < 20
        ? 2
        : (cases[Math.min(count % 10, 5)] ?? 2);
    return titles[index] ?? "other";
  }

  // For Italian locale
  if (locale.value === "it") {
    return count === 1 ? "one" : "other";
  }

  // For English and other locales (default)
  return count === 1 ? "one" : "other";
};

/**
 * Function: Handle cell click
 * When habitId is provided (single habit view), toggles completion for that date
 * Otherwise, just emits the day-click event for information display
 * @param day - ActivityDay object containing date and completion info
 * @param event - Mouse event (used to prevent event bubbling)
 */
const handleCellClick = (day: ActivityDay, event: MouseEvent) => {
  // Prevent event bubbling to avoid closing parent containers
  event.stopPropagation();

  // Always emit day-click event
  emit("day-click", day);

  // If habitId is provided, toggle completion for this date
  if (props.habitId) {
    // Toggle: if count > 0, mark as incomplete, otherwise mark as complete
    const newCompletionState = day.count === 0;
    emit("mark-date", props.habitId, day.date, newCompletionState);
  }
};
</script>

<style scoped>
/* Main container */
.streak-display {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

/* Header section */
.streak-display__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.streak-display__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.streak-display__period-selector {
  display: flex;
  gap: 8px;
  background: var(--color-bg-secondary);
  padding: 4px;
  border-radius: 8px;
}

.period-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-card);
    color: var(--color-text-primary);
  }

  &--active {
    background: var(--color-primary);
    color: white;

    &:hover {
      background: var(--color-primary);
      color: white;
    }
  }
}

/* Interactive mode hint */
.streak-display__hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  animation: fadeIn 0.3s ease-out;
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Statistics information section */
.streak-display__info {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Activity grid container */
.streak-display__grid-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-labels {
  display: none; /* Hidden by default for week view */
  grid-auto-flow: column;
  gap: 4px;
  padding-left: 32px;
  margin-bottom: 4px;
}

/* Show month labels for periods > 7 days */
.streak-display__grid-container:has(.activity-cells--month) .month-labels,
.streak-display__grid-container:has(.activity-cells--half-year) .month-labels,
.streak-display__grid-container:has(.activity-cells--year) .month-labels {
  display: grid;
}

/* Adjust month label columns based on period */
.streak-display__grid-container:has(.activity-cells--month) .month-labels {
  grid-auto-columns: minmax(14px, 1fr);
}

.streak-display__grid-container:has(.activity-cells--half-year) .month-labels {
  grid-auto-columns: minmax(10px, 1fr);
}

.streak-display__grid-container:has(.activity-cells--year) .month-labels {
  grid-auto-columns: minmax(8px, 1fr);
}

.month-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.activity-grid {
  display: flex;
  gap: 8px;
}

.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 24px;
}

.weekday-label {
  height: 14px;
  font-size: 10px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.activity-cells {
  display: grid;
  gap: 4px;
  flex: 1;
  width: 100%;
}

/* Week view: single row */
.activity-cells--week {
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: minmax(40px, 1fr);
}

/* Month view: 7 rows (weekdays) with auto columns */
.activity-cells--month {
  grid-template-rows: repeat(7, minmax(14px, 1fr));
  grid-auto-flow: column;
  grid-auto-columns: minmax(14px, 1fr);
}

/* Half year view: 7 rows with more columns */
.activity-cells--half-year {
  grid-template-rows: repeat(7, minmax(12px, 1fr));
  grid-auto-flow: column;
  grid-auto-columns: minmax(10px, 1fr);
}

/* Year view: 7 rows with many columns */
.activity-cells--year {
  grid-template-rows: repeat(7, minmax(10px, 1fr));
  grid-auto-flow: column;
  grid-auto-columns: minmax(8px, 1fr);
}

.activity-cell {
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8px;
  min-width: 8px;

  &:hover {
    transform: scale(0.95);
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* Enhanced visual feedback when cell is clickable for marking dates */
  &--clickable {
    cursor: pointer;

    &:hover {
      transform: scale(1.3);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
      filter: brightness(1.1);
    }

    &:active {
      transform: scale(1.15);
    }
  }
}

.streak-indicator {
  font-size: 8px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

/* Intensity legend */
.intensity-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  margin-top: 8px;
}

.legend-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.legend-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

/* Responsive design */
@media (max-width: 768px) {
  .streak-display {
    padding: 16px;
  }

  .streak-display__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .streak-display__info {
    flex-direction: column;
    gap: 12px;
  }

  /* Week view on mobile */
  .activity-cells--week {
    grid-template-rows: minmax(32px, 1fr);
  }

  /* Month view on mobile */
  .activity-cells--month {
    grid-template-rows: repeat(7, minmax(12px, 1fr));
    grid-auto-columns: minmax(12px, 1fr);
    gap: 3px;
  }

  /* Half year view on mobile */
  .activity-cells--half-year {
    grid-template-rows: repeat(7, minmax(10px, 1fr));
    grid-auto-columns: minmax(8px, 1fr);
    gap: 2px;
  }

  /* Year view on mobile */
  .activity-cells--year {
    grid-template-rows: repeat(7, minmax(8px, 1fr));
    grid-auto-columns: minmax(6px, 1fr);
    gap: 2px;
  }

  .weekday-labels {
    width: 20px;
  }

  .weekday-label {
    height: 12px;
    font-size: 9px;
  }

  .streak-display__grid-container:has(.activity-cells--month) .month-labels {
    grid-auto-columns: minmax(12px, 1fr);
    gap: 3px;
    padding-left: 24px;
  }

  .streak-display__grid-container:has(.activity-cells--half-year)
    .month-labels {
    grid-auto-columns: minmax(8px, 1fr);
    gap: 2px;
    padding-left: 24px;
  }

  .streak-display__grid-container:has(.activity-cells--year) .month-labels {
    grid-auto-columns: minmax(6px, 1fr);
    gap: 2px;
    padding-left: 24px;
  }

  .legend-cell {
    width: 12px;
    height: 12px;
  }

  .streak-indicator {
    font-size: 6px;
  }
}
</style>
