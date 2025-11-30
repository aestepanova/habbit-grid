<template>
  <div :class="['habit-card']">
    <!-- Цветовой индикатор -->
    <div
      class="habit-card__color-indicator"
      :style="{ backgroundColor: habit.color }"
    />

    <!-- Основное содержимое -->
    <div class="habit-card__content">
      <!-- Заголовок и статус -->
      <div class="habit-card__header">
        <div class="habit-card__title-group">
          <h3 class="habit-card__title">{{ habit.name }}</h3>
          <div v-if="habit.category" class="habit-card__category-badge">
            <img
              :src="getCategoryEmojiSrc(habit.category)"
              class="habit-card__category-icon"
              alt=""
            />
            <span class="habit-card__category-label">
              {{ getCategoryLabel(habit.category) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <p v-if="habit.description" class="habit-card__description">
        {{ habit.description }}
      </p>

      <!-- Статистика -->
      <div class="habit-card__stats">
        <div class="stat">
          <span class="stat__label">{{ t("habitCard.streak") }}:</span>
          <span class="stat__value">{{ currentStreak }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t("habitCard.record") }}:</span>
          <span class="stat__value">{{ bestStreak }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">{{ t("habitCard.completed") }}:</span>
          <span class="stat__value">{{ completionCount }}</span>
        </div>
      </div>

      <!-- Прогресс за месяц (миниатюра) -->
      <div class="habit-card__progress">
        <div class="progress-header">
          <span class="progress-title">{{ t("habitCard.monthProgress") }}</span>
          <div class="progress-header-right">
            <span class="progress-count">{{ monthCompletionCount }}/30</span>
            <button
              class="expand-stats-btn"
              :class="{ 'expand-stats-btn--active': showDetailedStats }"
              @click="toggleDetailedStats"
              :aria-label="
                showDetailedStats
                  ? t('habitCard.hideStats')
                  : t('habitCard.showStats')
              "
            >
              {{ showDetailedStats ? "▼" : "▶" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics with StreakDisplay -->
      <div
        v-if="showDetailedStats"
        class="habit-card__detailed-stats"
        @click.stop
      >
        <StreakDisplay
          :logs="activeLogs"
          :base-color="habit.color"
          :title="t('habitCard.detailedActivity')"
          :habit-id="habit.id"
          @mark-date="handleMarkDate"
          @day-click="handleDayClick"
        />
      </div>
    </div>

    <!-- Действия -->
    <div class="habit-card__actions">
      <button
        class="habit-card__action habit-card__action--calendar"
        aria-label="Отметить за конкретный день"
        @click="openDatePicker"
      >
        📅
      </button>
      <button
        class="habit-card__action habit-card__action--edit"
        aria-label="Редактировать"
        @click="handleEdit"
      >
        ✎
      </button>
      <button
        class="habit-card__action habit-card__action--delete"
        aria-label="Удалить"
        @click="handleDelete"
      >
        ✕
      </button>
    </div>

    <DatePickerModal
      :is-open="isDatePickerOpen"
      :habit-id="habit.id"
      @close="isDatePickerOpen = false"
      @mark-completed="(id, date) => handleMarkCompleted(id, date)"
      @mark-incomplete="(id, date) => handleMarkIncompleted(id, date)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  Habit,
  HabitLog,
} from "../../../../../packages/shared-types/habit.ts";
import DatePickerModal from "@/components/dates/DatePickerModal.vue";
import StreakDisplay from "@/components/analytics/StreakDisplay.vue";
import { habitStorageService } from "@/services/habitStorage";
import HealthEmoji from "@/assets/emojis/category-health.svg";
import LearningEmoji from "@/assets/emojis/category-learning.svg";
import CreativityEmoji from "@/assets/emojis/category-creativity.svg";
import PersonalGrowthEmoji from "@/assets/emojis/category-personal-growth.svg";
import ProductivityEmoji from "@/assets/emojis/category-productivity.svg";

const { t } = useI18n();

interface Props {
  habit: Habit;
  completionToday?: boolean;
  currentStreak?: number;
  bestStreak?: number;
  completionCount?: number;
  logs?: HabitLog[];
}

const props = withDefaults(defineProps<Props>(), {
  completionToday: false,
  currentStreak: 0,
  bestStreak: 0,
  completionCount: 0,
  logs: () => [],
});

const emit = defineEmits<{
  edit: [habit: Habit];
  delete: [habitId: string];
  markDate: [habitId: string, date: string, completed: boolean];
}>();

const isDatePickerOpen = ref(false);
const showDetailedStats = ref(false);

// Реактивные логи - всегда загружаем напрямую из storage
const activeLogs = ref<HabitLog[]>([]);

// Загрузка логов
const loadLogs = () => {
  const logs = habitStorageService.getHabitLogs(props.habit.id);
  activeLogs.value = logs;
};

// Инициализация логов при монтировании
loadLogs();

/**
 * Toggle detailed statistics view
 */
const toggleDetailedStats = () => {
  showDetailedStats.value = !showDetailedStats.value;
};

/**
 * Computed property: Month completion count
 * Counts how many days in the last 30 days the habit was completed
 */
const monthCompletionCount = computed(() => {
  if (!activeLogs.value || activeLogs.value.length === 0) return 0;

  let count = 0;
  for (let i = 1; i <= 30; i++) {
    if (isDayCompleted(i)) {
      count++;
    }
  }
  return count;
});

const openDatePicker = () => {
  isDatePickerOpen.value = true;
};

const handleMarkCompleted = (habitId: string, date: string) => {
  emit("markDate", habitId, date, true);
};

const handleMarkIncompleted = (habitId: string, date: string) => {
  emit("markDate", habitId, date, false);
};

const handleMarkDate = async (habitId: string, date: string, completed: boolean) => {
  emit("markDate", habitId, date, completed);
  // Даем время на сохранение, затем перезагружаем логи
  setTimeout(() => {
    loadLogs();
  }, 300);
  // Не закрываем детальную статистику - пользователь может продолжить отмечать дни
};

const handleDayClick = (): void => {
  showDetailedStats.value = true;
};
const getCategoryLabel = (category: string | undefined): string => {
  if (!category) return "";

  const categoryKey = `habitForm.category${category.charAt(0).toUpperCase() + category.slice(1)}`;
  return t(categoryKey);
};

const getCategoryEmojiSrc = (category: string | undefined): string => {
  if (!category) return "";

  switch (category.toLowerCase()) {
    case "health":
      return HealthEmoji;
    case "creativity":
      return CreativityEmoji;
    case "learning":
      return LearningEmoji;
    case "personal":
      return PersonalGrowthEmoji;
    case "productivity":
      return ProductivityEmoji;
    default:
      return ProductivityEmoji;
  }
};

/**
 * Check if habit was completed on a specific day
 * @param day - Day offset from 1 to 30 (1 = 30 days ago, 30 = today)
 * @returns true if habit was completed on that day
 */
const isDayCompleted = (day: number): boolean => {
  if (!activeLogs.value || activeLogs.value.length === 0) return false;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - (30 - day));
  const dateStr = targetDate.toISOString().split("T")[0];

  return activeLogs.value.some((log) => log.date === dateStr && log.completed);
};

const handleEdit = () => {
  emit("edit", props.habit);
};

const handleDelete = () => {
  if (
    confirm(`Вы уверены, что хотите удалить привычку "${props.habit.name}"?`)
  ) {
    emit("delete", props.habit.id);
  }
};
</script>

<style scoped>
.habit-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.habit-card:hover {
  box-shadow: var(--color-shadow);
  border-color: var(--color-primary);
}

/* Цветовой индикатор */
.habit-card__color-indicator {
  flex-shrink: 0;
  width: 4px;
  border-radius: 4px;
}

/* Основное содержимое */
.habit-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Заголовок */
.habit-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.habit-card__title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.habit-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.habit-card__title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.habit-card__category-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  white-space: nowrap;
}

.habit-card__category-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
/* Статус (значок выполнения) */
.habit-card__status {
  flex-shrink: 0;
}

.habit-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.habit-card__badge--done {
  background: #10b981;
  color: var(--color-text-white);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.habit-card__badge--pending {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  border: 2px solid var(--color-border);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

/* Описание */
.habit-card__description {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Статистика */
.habit-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat__label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat__value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Прогресс за месяц */
.habit-card__progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-title {
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.progress-count {
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 700;
}

.expand-stats-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    transform: scale(1.05);
  }

  &--active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.progress-day {
  aspect-ratio: 1;
  background: var(--color-bg-secondary);
  border-radius: 3px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
    transform: scale(1.15);
    z-index: 1;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &--done {
    background: var(--color-primary);
    border-color: var(--color-primary);

    &:hover {
      background: var(--color-primary);
      filter: brightness(1.1);
    }
  }
}

/* Detailed Statistics */
.habit-card__detailed-stats {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 1000px;
  }
}

/* Действия */
.habit-card__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.habit-card__action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.habit-card__action--edit {
  &:hover {
    background: var(--color-primary);
    color: var(--color-text-white);
  }
}

.habit-card__action--delete {
  &:hover {
    background: #ef4444;
    color: var(--color-text-white);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .habit-card {
    flex-direction: column;
    gap: 12px;
  }

  .habit-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .habit-card__stats {
    grid-template-columns: 1fr;
  }

  .progress-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .habit-card__actions {
    flex-direction: row;
    gap: 6px;
  }

  .habit-card__detailed-stats {
    padding: 12px;
    margin-top: 12px;
  }

  .progress-header-right {
    gap: 8px;
  }
}
</style>
