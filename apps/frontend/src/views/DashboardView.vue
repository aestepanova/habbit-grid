<template>
  <div class="dashboard-view">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Кнопка добавления -->
      <BaseButton @click="isModalOpen = true"> + Новая привычка </BaseButton>

      <!-- Список привычек -->
      <div class="habits-container">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :logs="getHabitLogs(habit.id)"
          @edit="onEdit"
          @delete="onDelete"
        />
      </div>

      <!-- Модальное окно -->
      <BaseModal
        title="Добавить привычку"
        :is-open="isModalOpen"
        @close="isModalOpen = false"
      >
        <HabitForm @success="onAddHabit" />
      </BaseModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHabits } from "@/composables/useHabits";
import { habitStorageService as habitStorage } from "@/services/habitStorage";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import HabitCard from "@/components/habits/HabitCard.vue";
import HabitForm from "@/components/habits/HabitForm.vue";
import type { Habit } from "../../../../packages/shared-types/habit.ts";

const { habits, loading, error, addHabit, deleteHabit } = useHabits();
const isModalOpen = ref(false);

const onAddHabit = (habitData: Habit) => {
  addHabit(habitData);
  isModalOpen.value = false;
};

const onDelete = (habitId: string) => {
  deleteHabit(habitId);
};

const onEdit = (habit: Habit) => {
  // Логика редактирования
  console.log("Редактировать:", habit);
};

const getHabitLogs = async (habitId: string) => {
  return await habitStorage.getHabitLogs(habitId);
};
</script>
