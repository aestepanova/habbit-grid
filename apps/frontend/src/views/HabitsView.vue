<script setup lang="ts">
import HabitCard from "@/components/habits/HabitCard.vue";
import { onMounted, ref } from "vue";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";
import { useHabits } from "@/composables/useHabits.ts";
import BaseModal from "@/components/common/BaseModal.vue";
import HabitForm from "@/components/habits/HabitForm.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseCard from "@/components/common/BaseCard.vue";

const currentLogs = ref<HabitLog[]>([]);
const isModalOpen = ref(false);
const isConfirmOpen = ref(false);

const {
  habits,
  loading,
  addHabit,
  error,
  loadHabits,
  updateHabit,
  deleteHabit,
} = useHabits();

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

onMounted(() => {});
</script>

<template>
  <h1>Библиотека коммитментов</h1>
  <BaseCard :flat="true" :padding-size="'large'">
    <BaseButton @click="isModalOpen = true"> + Новая практика </BaseButton>
  </BaseCard>

  <!-- Простое модальное окно -->
  <BaseModal
    title="Добавить новую привычку"
    :is-open="isModalOpen"
    @close="isModalOpen = false"
  >
    <HabitForm @success="onAddHabit" />
  </BaseModal>
  <div v-if="loading">Загрузка...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else class="habit-list">
    <HabitCard
      v-for="habit in habits"
      :key="habit.id"
      :habit="habit"
      :completion-today="false"
      :current-streak="4"
      :best-streak="5"
      :completion-count="23"
      :logs="currentLogs"
      @edit="onEdit"
      @delete="onDelete"
    />
  </div>
</template>

<style scoped></style>
