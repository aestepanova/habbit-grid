<template>
  <BaseModal title="Отметить выполнение" :is-open="isOpen" @close="handleClose">
    <div class="date-picker-container">
      <!-- Выбор даты -->
      <!--      <div class="form-group">
        <label for="date-picker">Выберите дату:</label>
        <input
          id="date-picker"
          v-model="selectedDate"
          type="date"
          class="form-input"
          :max="today"
        />
      </div>-->
      <label class="form-label">Выберите дату:</label>
      <DatePickerCustom
        v-model="selectedDate"
        :max-date="maxDate"
        @update:modelValue="handleDateChange"
      />

      <!-- Быстрые кнопки для часто используемых дат -->
      <div class="quick-dates">
        <BaseButton
          v-for="btn in quickDateButtons"
          :key="btn.label"
          :label="btn.label"
          variant="secondary"
          size="small"
          @click="selectQuickDate(btn.daysAgo)"
        />
      </div>

      <!-- Информация о выполнении -->
      <div class="completion-info">
        <p v-if="isAlreadyCompleted" class="info-completed">
          ✓ Привычка уже отмечена на {{ formatDate(selectedDate) }}
        </p>
        <p v-else class="info-not-completed">
          Привычка ещё не отмечена на {{ formatDate(selectedDate) }}
        </p>
      </div>

      <!-- Кнопки действия -->
      <div class="modal-actions">
        <BaseButton label="Отмена" variant="secondary" @click="handleClose" />
        <BaseButton
          v-if="!isAlreadyCompleted"
          label="Отметить выполненной"
          variant="primary"
          @click="handleMarkCompleted"
        />
        <BaseButton
          v-else
          label="Отметить невыполненной"
          variant="secondary"
          @click="handleMarkIncomplete"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import DatePickerCustom from "@/components/dates/DatePickerCustom.vue";
import { habitStorageService as habitStorage } from "@/services/habitStorage.ts";

interface Props {
  isOpen: boolean;
  habitId: string;
  selectedDate?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  markCompleted: [habitId: string, date: string];
  markIncomplete: [habitId: string, date: string];
}>();

const selectedDate = ref(getTodayDate());
const maxDate = ref(new Date().toISOString().split("T")[0]);
const isAlreadyCompleted = computed(() =>
  isCompletedOnDate(props.habitId, selectedDate.value),
);

const today = computed(() => getTodayDate());

const quickDateButtons = [
  { label: "Сегодня", daysAgo: 0 },
  { label: "Вчера", daysAgo: 1 },
  { label: "2 дня назад", daysAgo: 2 },
];

// Вспомогательные функции

function getTodayDate(): string {
  const today = new Date().toISOString().split("T")[0];
  if (today) {
    return today;
  } else return "";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function selectQuickDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const returnDate = date.toISOString().split("T")[0];
  if (returnDate) {
    selectedDate.value = returnDate;
  }
}

const isCompletedOnDate = (habitId: string, date: string): boolean => {
  const logs = habitStorage.getHabitLogs(habitId);
  return logs.some((log) => log.date === date && log.completed);
};

const handleDateChange = (newDate: string) => {
  selectedDate.value = newDate;
};

function handleMarkCompleted() {
  if (!props.habitId) return;
  emit("markCompleted", props.habitId, selectedDate.value);
  handleClose();
}

function handleMarkIncomplete() {
  if (!props.habitId) return;
  emit("markIncomplete", props.habitId, selectedDate.value);
  handleClose();
}

function handleClose() {
  emit("close");
}

// Проверяем статус при изменении даты
watch(selectedDate, (newDate) => {
  if (props.selectedDate) {
    console.log("Выбрана дата:", props.selectedDate);
  } else {
    console.log("Выбрана дата:", newDate);
  }
});

// Проверяем при открытии модали
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedDate.value = getTodayDate();
    }
  },
);
</script>

<style scoped>
.date-picker-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 60vh;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Быстрые кнопки */
.quick-dates {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

/* Информация о статусе */
.completion-info {
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.info-completed {
  color: #10b981;
  font-weight: 600;
  margin: 0;
}

.info-not-completed {
  color: var(--color-text-secondary);
  margin: 0;
}

/* Кнопки действия */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .quick-dates {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
