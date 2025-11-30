<template>
  <form class="habit-form" @submit.prevent="handleSubmit">
    <!-- Название привычки -->
    <div class="form-group">
      <label for="habit-name" class="form-label">{{
        t("habitForm.name")
      }}</label>
      <input
        id="habit-name"
        v-model="formData.name"
        type="text"
        class="form-input"
        :placeholder="t('habitForm.namePlaceholder')"
        maxlength="50"
        required
      />
      <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
    </div>

    <!-- Описание -->
    <div class="form-group">
      <label for="habit-description" class="form-label">{{
        t("habitForm.description")
      }}</label>
      <textarea
        id="habit-description"
        v-model="formData.description"
        class="form-textarea"
        :placeholder="t('habitForm.descriptionPlaceholder')"
        maxlength="200"
        rows="3"
      ></textarea>
      <span class="form-hint">{{ formData.description?.length }}/200</span>
    </div>

    <!-- Выбор цвета -->
    <div class="form-group">
      <label class="form-label">{{ t("habitForm.color") }}</label>
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
        ></button>
      </div>
    </div>

    <!-- Частота выполнения -->
    <div class="form-group">
      <label class="form-label">{{ t("habitForm.frequency") }}</label>
      <CustomSelect
        v-model="formData.frequency"
        :options="frequencyOptions"
        :placeholder="t('habitForm.frequencyPlaceholder')"
        :search-placeholder="t('habitForm.frequencySearchPlaceholder')"
        :no-results-text="t('habitForm.noResults')"
      />
    </div>

    <!-- Категория (опционально) -->
    <div class="form-group">
      <label class="form-label">{{ t("habitForm.category") }}</label>
      <CustomSelect
        v-model="formData.category"
        :options="categoryOptions"
        :placeholder="t('habitForm.categoryPlaceholder')"
        :search-placeholder="t('habitForm.categorySearchPlaceholder')"
        :no-results-text="t('habitForm.noResults')"
      />
    </div>

    <!-- Кнопки действия -->
    <div class="form-actions">
      <BaseButton
        type="button"
        variant="secondary"
        size="medium"
        :label="t('habitForm.cancel')"
        @click="handleCancel"
      />
      <BaseButton
        type="submit"
        variant="primary"
        size="medium"
        :label="isEditing ? t('habitForm.saveChanges') : t('habitForm.save')"
        :loading="isSubmitting"
      />
    </div>
  </form>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import CustomSelect from "@/components/common/CustomSelect.vue";
import type { SelectOption } from "@/components/common/CustomSelect.vue";
import type { Habit } from "../../../../../packages/shared-types/habit.ts";
import { useI18n } from "vue-i18n";
import HealthEmoji from "@/assets/emojis/category-health.svg";
import LearningEmoji from "@/assets/emojis/category-learning.svg";
import CreativityEmoji from "@/assets/emojis/category-creativity.svg";
import PersonalGrowthEmoji from "@/assets/emojis/category-personal-growth.svg";
import ProductivityEmoji from "@/assets/emojis/category-productivity.svg";

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

const { t } = useI18n();

const colorOptions = [
  "#ff6600",
  "#ff852b",
  "#ffbc33",
  "#10b957",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

const frequencyOptions = computed<SelectOption[]>(() => [
  { value: "daily", label: t("habitForm.frequencyDaily") },
  { value: "weekly", label: t("habitForm.frequencyWeekly") },
  { value: "monthly", label: t("habitForm.frequencyMonthly") },
]);

const categoryOptions = computed<SelectOption[]>(() => [
  { value: "", label: t("habitForm.categoryPlaceholder") },
  { value: "health", label: t("habitForm.categoryHealth"), icon: HealthEmoji },
  {
    value: "productivity",
    label: t("habitForm.categoryProductivity"),
    icon: ProductivityEmoji,
  },
  {
    value: "learning",
    label: t("habitForm.categoryLearning"),
    icon: LearningEmoji,
  },
  {
    value: "creativity",
    label: t("habitForm.categoryCreativity"),
    icon: CreativityEmoji,
  },
  {
    value: "personal",
    label: t("habitForm.categoryPersonal"),
    icon: PersonalGrowthEmoji,
  },
]);

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
      formData.createdAt = new Date().toISOString();
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
  color: var(--color-text-primary);
}

/* Input */
.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: var(--color-shadow-glow);
  }

  &::placeholder {
    color: var(--color-text-muted);
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
  color: var(--color-text-muted);
  text-align: right;
}

/* Цветовая палитра */
.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  gap: 8px;
  justify-items: center;
  padding-bottom: 12px;
}

.color-option {
  width: 44px;
  height: 44px;
  border: 3px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-clip: padding-box;
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &--active {
    border-color: var(--color-text-primary);
    box-shadow:
      0 0 0 2px var(--color-bg-card),
      0 0 0 4px var(--color-primary);
    transform: scale(1.15);

    &:hover {
      transform: scale(1.2);
    }
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
