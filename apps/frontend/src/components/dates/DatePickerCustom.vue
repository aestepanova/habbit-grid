<template>
  <div class="date-picker-custom">
    <div class="date-input-wrapper">
      <input
        v-model="displayDate"
        type="text"
        class="date-input"
        placeholder="Выберите дату"
        readonly
      />
      <button
        class="date-input-icon"
        @click="isCalendarOpen = !isCalendarOpen"
        aria-label="Открыть календарь"
      >
        📅
      </button>
    </div>

    <!-- Календарь -->
    <div v-if="isCalendarOpen" class="calendar-dropdown">
      <!-- Header с месяцем и навигацией -->
      <div class="calendar-header">
        <button
          class="nav-btn"
          @click="prevMonth"
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <h3 class="month-year">{{ formatMonthYear }}</h3>
        <button class="nav-btn" @click="nextMonth" aria-label="Следующий месяц">
          ›
        </button>
      </div>

      <!-- Дни недели -->
      <div class="weekdays">
        <div
          v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <!-- Дни месяца -->
      <div class="days-grid">
        <button
          v-for="day in calendarDays"
          :key="`${day.date}-${day.isCurrentMonth}`"
          :class="[
            'day-btn',
            {
              'day-btn--other-month': !day.isCurrentMonth,
              'day-btn--selected': day.isSelected,
              'day-btn--today': day.isToday,
              'day-btn--disabled': day.isDisabled,
            },
          ]"
          :disabled="day.isDisabled"
          @click="selectDate(day.fullDate)"
        >
          {{ day.date }}
        </button>
      </div>

      <!-- Быстрые выборы -->
      <div class="quick-select">
        <button class="quick-btn" @click="selectToday">Сегодня</button>
        <button class="quick-btn" @click="selectYesterday">Вчера</button>
        <button class="quick-btn" @click="clearDate">Очистить</button>
      </div>
    </div>

    <!-- Overlay для закрытия -->
    <div
      v-if="isCalendarOpen"
      class="calendar-overlay"
      @click="isCalendarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  modelValue?: string; // YYYY-MM-DD
  maxDate?: string; // Максимальная дата
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  maxDate: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isCalendarOpen = ref(false);
const currentMonth = ref(new Date());
const selectedDate = ref(props.modelValue || "");

const today = new Date();
const maxDateObj = computed(() =>
  props.maxDate ? new Date(props.maxDate) : new Date(),
);

// Форматированная дата для отображения
const displayDate = computed(() => {
  if (!selectedDate.value) return "";
  const date = new Date(selectedDate.value + "T00:00:00");
  return date.toLocaleDateString("ru-RU", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Месяц и год
const formatMonthYear = computed(() => {
  return currentMonth.value.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
});

// Массив дней для отображения в календаре
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Начинаем с понедельника

  const days = [];
  let currentDate = new Date(startDate);

  // Генерируем 42 дня (6 недель)
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = dateStr === today.toISOString().split("T")[0];
    const isSelected = dateStr === selectedDate.value;
    const isDisabled = currentDate > maxDateObj.value;

    days.push({
      date: currentDate.getDate(),
      fullDate: dateStr,
      isCurrentMonth,
      isToday,
      isSelected,
      isDisabled,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
});

// Методы
const selectDate = (dateStr?: string) => {
  if (dateStr) {
    selectedDate.value = dateStr;
    emit("update:modelValue", dateStr);
    isCalendarOpen.value = false;
  }
};

const selectToday = () => {
  const today = new Date().toISOString().slice(0, 10);
  selectDate(today);
};

const selectYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  selectDate(yesterday.toISOString().slice(0, 10));
};

const clearDate = () => {
  selectedDate.value = "";
  emit("update:modelValue", "");
};

const prevMonth = () => {
  currentMonth.value.setMonth(currentMonth.value.getMonth() - 1);
  currentMonth.value = new Date(currentMonth.value);
};

const nextMonth = () => {
  currentMonth.value.setMonth(currentMonth.value.getMonth() + 1);
  currentMonth.value = new Date(currentMonth.value);
};

// Синхронизация с props
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) selectedDate.value = newVal;
  },
);
</script>

<style scoped>
.date-picker-custom {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* Input wrapper */
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--fs-base);
  font-family: inherit;
  transition: var(--transition);
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.date-input-icon {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.date-input-icon:hover {
  opacity: 1;
}

/* Calendar */
.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--color-shadow-card);
  z-index: 1001;
  min-width: 280px;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-year {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  margin: 0;
}

.nav-btn {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 18px;
  cursor: pointer;
  transition: var(--transition);
  color: var(--color-primary);
}

.nav-btn:hover {
  background: var(--color-border-light);
  border-color: var(--color-accent);
}

/* Weekdays */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-weight: var(--fw-semibold);
  font-size: var(--fs-xs);
  color: var(--color-text-secondary);
  padding: 4px;
}

/* Days grid */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.day-btn {
  aspect-ratio: 1;
  padding: 0;
  border: 1px solid transparent;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  transition: var(--transition);
}

.day-btn:hover:not(:disabled) {
  background: var(--color-border-light);
  border-color: var(--color-accent);
}

.day-btn--other-month {
  color: var(--color-text-muted);
  background: transparent;
}

.day-btn--today {
  border-color: var(--color-accent);
}

.day-btn--selected {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border-color: transparent;
  font-weight: var(--fw-bold);
}

.day-btn--disabled {
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}

.day-btn--disabled:hover {
  background: var(--color-bg-secondary);
  border-color: transparent;
}

/* Quick select */
.quick-select {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.quick-btn {
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--color-primary);
  cursor: pointer;
  transition: var(--transition);
}

.quick-btn:hover {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-text-white);
}

/* Overlay */
.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* Responsive */
@media (max-width: 480px) {
  .calendar-dropdown {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    margin: 0;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    min-width: unset;
  }

  .days-grid {
    gap: 6px;
  }

  .day-btn {
    font-size: var(--fs-base);
  }
}
</style>
