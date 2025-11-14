<template>
  <div :class="['habit-card', { 'habit-card--active': isActive }]">
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
          <span v-if="habit.category" class="habit-card__category">
            {{ getCategoryLabel(habit.category) }}
          </span>
        </div>
        <div class="habit-card__status">
          <span
            v-if="completionToday"
            class="habit-card__badge habit-card__badge--done"
          >
            ✓
          </span>
          <span v-else class="habit-card__badge habit-card__badge--pending">
            ○
          </span>
        </div>
      </div>

      <!-- Описание -->
      <p v-if="habit.description" class="habit-card__description">
        {{ habit.description }}
      </p>

      <!-- Статистика -->
      <div class="habit-card__stats">
        <div class="stat">
          <span class="stat__label">Серия:</span>
          <span class="stat__value">{{ currentStreak }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Рекорд:</span>
          <span class="stat__value">{{ bestStreak }}</span>
        </div>
        <div class="stat">
          <span class="stat__label">Выполнено:</span>
          <span class="stat__value">{{ completionCount }}</span>
        </div>
      </div>

      <!-- Прогресс за месяц (миниатюра) -->
      <div class="habit-card__progress">
        <div
          v-for="day in 30"
          :key="day"
          :class="[
            'progress-day',
            { 'progress-day--done': isDayCompleted(day) },
          ]"
        />
      </div>
    </div>

    <!-- Действия -->
    <div class="habit-card__actions">
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
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type {
  Habit,
  HabitLog,
  UserStats,
} from "../../../../../packages/shared-types/habit.ts";

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
  toggle: [habitId: string];
}>();

const isActive = computed(() => props.completionToday);

const categoryLabels: Record<string, string> = {
  health: "🏃 Здоровье",
  productivity: "⚡ Продуктивность",
  learning: "📚 Обучение",
  creativity: "🎨 Творчество",
  personal: "🌱 Личное развитие",
};

const getCategoryLabel = (category: string | undefined): string => {
  return category ? categoryLabels[category] || category : "";
};

const isDayCompleted = (day: number): boolean => {
  // Проверяем, выполнена ли привычка в день X последних 30 дней
  if (!props.logs || props.logs.length === 0) return false;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - (30 - day));
  const dateStr = targetDate.toISOString().split("T")[0];

  return props.logs.some((log) => log.date === dateStr && log.completed);
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
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.habit-card:hover {
  box-shadow: var(--color-shadow);
  border-color: var(--color-primary);
}

.habit-card--active {
  border-color: var(--color-primary);
  background: linear-gradient(
    135deg,
    rgba(255, 102, 0, 0.05),
    rgba(255, 102, 0, 0.02)
  );
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
  color: var(--color-text-main);
}

.habit-card__category {
  font-size: 11px;
  background: var(--color-card-secondary);
  color: var(--color-text-main);
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
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
  background: var(--color-card-secondary);
  color: var(--color-muted);
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
  color: var(--color-muted);
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
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat__value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
}

/* Прогресс за месяц */
.habit-card__progress {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.progress-day {
  aspect-ratio: 1;
  background: var(--color-card-secondary);
  border-radius: 4px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
    transform: scale(1.1);
  }

  &--done {
    background: var(--color-primary);
    border-color: var(--color-primary);
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
  background: var(--color-card-secondary);
  color: var(--color-text-main);
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

  .habit-card__progress {
    grid-template-columns: repeat(5, 1fr);
  }

  .habit-card__actions {
    flex-direction: row;
    gap: 6px;
  }
}
</style>
