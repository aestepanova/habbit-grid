<template>
  <h1>Add buttons!</h1>
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <BaseButton label="Primary" variant="primary" />
    <BaseButton label="Secondary" variant="secondary" />
    <BaseButton label="Danger" variant="danger" />
    <BaseButton label="Success" variant="success" />
    <BaseButton label="Ghost" variant="ghost" />
    <BaseButton label="Loading" :loading="true" />
    <BaseButton icon-only icon-left="★" />
  </div>

  <h1>Add cards!</h1>
  <div>
    <!-- Обычная карточка -->
    <BaseCard title="Статистика" padding-size="medium">
      <p>Текущий прогресс: 75%</p>
    </BaseCard>

    <!-- Акцентная карточка с действием -->
    <BaseCard variant="accent" padding-size="large">
      <h2>Добро пожаловать!</h2>
      <p>Начните отслеживать свои привычки уже сегодня.</p>
      <template #footer>
        <BaseButton label="Начать" />
      </template>
    </BaseCard>

    <!-- Hover-эффект карточка -->
    <BaseCard title="Новая практика" hoverable padding-size="medium">
      <p>Нажмите, чтобы добавить</p>
    </BaseCard>

    <!-- Без теней -->
    <BaseCard variant="subtle" flat>
      <span>Минималистичная информация</span>
    </BaseCard>
  </div>

  <h1>Test modals</h1>
  <div>
    <BaseButton @click="isModalOpen = true"> + Новая практика </BaseButton>
    <!-- Простое модальное окно -->
    <BaseModal
      title="Добавить новую привычку"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    >
      <HabitForm @success="onAddHabit" />
    </BaseModal>
  </div>

  <h1>Add habit's card</h1>
  <div class="habit-list">
    <HabitCard
      v-for="habit in habits"
      :key="habit.id"
      :habit="habit"
      :completion-today="false"
      :current-streak="4"
      :best-streak="5"
      :completion-count="23"
      :logs="[]"
      @edit="onEdit"
      @delete="onDelete"
    />
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseCard from "@/components/common/BaseCard.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import HabitForm from "@/components/habits/HabitForm.vue";
import HabitCard from "@/components/habits/HabitCard.vue";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";
import { useHabits } from "@/composables/useHabits.ts";

const isModalOpen = ref(false);
const isConfirmOpen = ref(false);

const { habits, loading, addHabit, updateHabit, deleteHabit } = useHabits();

const onAddHabit = (habit: Habit) => {
  addHabit(habit);
  isModalOpen.value = false;
};

const onEdit = (habit: Habit) => {
  updateHabit(habit);
  isModalOpen.value = false;
};
const onDelete = (habitId: string) => {
  deleteHabit(habitId);
  isConfirmOpen.value = false;
};
</script>
