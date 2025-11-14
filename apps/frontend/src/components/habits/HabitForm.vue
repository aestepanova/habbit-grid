<template>
  <form class="habit-form" @submit.prevent="handleSubmit">
    <!-- Название привычки -->
    <div class="form-group">
      <label for="habit-name" class="form-label">Название привычки</label>
      <input
        id="habit-name"
        v-model="formData.name"
        type="text"
        class="form-input"
        placeholder="Например: Медитация, Чтение..."
        maxlength="50"
        required
      />
      <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
    </div>

    <!-- Описание -->
    <div class="form-group">
      <label for="habit-description" class="form-label"
        >Описание (опционально)</label
      >
      <textarea
        id="habit-description"
        v-model="formData.description"
        class="form-textarea"
        placeholder="Опишите вашу привычку..."
        maxlength="200"
        rows="3"
      ></textarea>
      <span class="form-hint">{{ formData.description?.length }}/200</span>
    </div>

    <!-- Выбор цвета -->
    <div class="form-group">
      <label class="form-label">Цвет привычки</label>
      <div class="color-picker">
        <button
          v-for="color in colorOptions"
          :key="color"
          type="button"
          :class="[
            'color-option',
            { 'color-option--active': formData.color === color },
          ]"
          :style="{ backgroundColor: color }"
          @click="formData.color = color"
          :title="color"
        />
      </div>
    </div>

    <!-- Частота выполнения -->
    <div class="form-group">
      <label for="habit-frequency" class="form-label">Частота выполнения</label>
      <select
        id="habit-frequency"
        v-model="formData.frequency"
        class="form-select"
      >
        <option value="daily">Ежедневно</option>
        <option value="weekly">Еженедельно</option>
        <option value="monthly">Ежемесячно</option>
      </select>
    </div>

    <!-- Категория (опционально) -->
    <div class="form-group">
      <label for="habit-category" class="form-label"
        >Категория (опционально)</label
      >
      <select
        id="habit-category"
        v-model="formData.category"
        class="form-select"
      >
        <option value="">Выберите категорию</option>
        <option value="health">Здоровье</option>
        <option value="productivity">Продуктивность</option>
        <option value="learning">Обучение</option>
        <option value="creativity">Творчество</option>
        <option value="personal">Личное развитие</option>
      </select>
    </div>

    <!-- Кнопки действия -->
    <div class="form-actions">
      <BaseButton
        variant="secondary"
        size="medium"
        label="Отмена"
        @click="handleCancel"
      />
      <BaseButton
        variant="primary"
        size="medium"
        :label="isEditing ? 'Сохранить изменения' : 'Добавить'"
        type="submit"
        :loading="isSubmitting"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import type { Habit } from "../../../../../packages/shared-types/habit.ts";

type NewHabit = Omit<Habit, "id" | "createdAt">;

interface Props {
  initialHabit?: Habit | null;
}

interface FormErrors {
  name?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  success: [habit: Habit];
  cancel: [];
}>();

const colorOptions = [
  "#ff6600",
  "#ff852b",
  "#ffbc33",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

const formData = reactive<Habit>({
  createdAt: props.initialHabit?.createdAt || new Date().toISOString(),
  id: props.initialHabit?.id || "",
  name: props.initialHabit?.name || "",
  description: props.initialHabit?.description || "",
  color: props.initialHabit?.color || colorOptions[0],
  frequency: props.initialHabit?.frequency || "daily",
  category: props.initialHabit?.category || "",
  emoji: props.initialHabit?.emoji || "📌",
  completed: false,
  streak: 0,
});

const errors = ref<FormErrors>({});
const isSubmitting = ref(false);

const isEditing = computed(() => !!props.initialHabit);

const validateForm = (): boolean => {
  errors.value = {};

  if (!formData.name.trim()) {
    errors.value.name = "Название привычки обязательно";
    return false;
  }

  if (formData.name.length < 2) {
    errors.value.name = "Название должно быть не менее 2 символов";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    // Имитация задержки сохранения
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Генерируем ID если это новая привычка
    if (!formData.id) {
      formData.id = `habit_${Date.now()}`;
      formData.createdAt = new Date();
    }

    emit("success", { ...formData } as Habit);
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.habit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Форма группы */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Лейблы */
.form-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-main);
}

/* Input */
.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card);
  color: var(--color-text-main);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.1);
  }

  &::placeholder {
    color: var(--color-muted);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Ошибки */
.form-error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

/* Подсказка */
.form-hint {
  font-size: 12px;
  color: var(--color-muted);
  text-align: right;
}

/* Цветовая палитра */
.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  gap: 8px;
}

.color-option {
  width: 44px;
  height: 44px;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-clip: padding-box;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &--active {
    border-color: var(--color-text-main);
    box-shadow:
      0 0 0 2px var(--color-card),
      0 0 0 4px var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* Кнопки действия */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

/* Адаптивность */
@media (max-width: 768px) {
  .habit-form {
    gap: 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .color-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
