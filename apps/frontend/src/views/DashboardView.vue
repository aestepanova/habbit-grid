<template>
  <div class="dashboard-view">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Кнопка добавления -->
      <BaseButton @click="openAddModal"> + Новая привычка </BaseButton>

      <!-- Список привычек -->
      <div class="habits-container">
        <HabitCard
          v-for="habit in habits"
          :key="habit.id"
          :habit="habit"
          :logs="getHabitLogs(habit.id)"
          @edit="openEditModal"
          @delete="onDelete"
        />
      </div>

      <!-- Модальное окно для добавления -->
      <BaseModal
        title="Добавить новую привычку"
        :is-open="isAddModalOpen"
        @close="isAddModalOpen = false"
      >
        <HabitForm @success="onAddHabit" @cancel="isAddModalOpen = false" />
      </BaseModal>

      <!-- Модальное окно для редактирования -->
      <BaseModal
        title="Редактировать привычку"
        :is-open="isEditModalOpen"
        @close="isEditModalOpen = false"
      >
        <HabitForm
          :initial-habit="selectedHabit"
          @success="onUpdateHabit"
          @cancel="isEditModalOpen = false"
        />
      </BaseModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHabits } from "@/composables/useHabits";
import { habitStorageService as habitStorage } from "@/services/habitStorage";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import HabitCard from "@/components/habits/HabitCard.vue";
import HabitForm from "@/components/habits/HabitForm.vue";
import type {
  Habit,
  HabitLog,
} from "../../../../packages/shared-types/habit.ts";

const { habits, loading, error, addHabit, updateHabit, deleteHabit } =
  useHabits();

const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedHabit = ref<Habit | null>(null);

const openAddModal = () => {
  isAddModalOpen.value = true;
};

const openEditModal = (habit: Habit) => {
  selectedHabit.value = habit;
  isEditModalOpen.value = true;
};

const onAddHabit = (habitData: Habit) => {
  addHabit(habitData);
  isAddModalOpen.value = false;
};

const onUpdateHabit = (habitData: Habit) => {
  updateHabit(habitData);
  isEditModalOpen.value = false;
  selectedHabit.value = null;
};

const onDelete = (habitId: string) => {
  if (confirm("Вы уверены, что хотите удалить эту привычку?")) {
    deleteHabit(habitId);
  }
};

const getHabitLogs: (habitId: string) => HabitLog[] = (habitId: string) => {
  return habitStorage.getHabitLogs(habitId);
};
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.error {
  background: #fee;
  color: #c00;
  padding: 16px;
  border-radius: 8px;
}

.habits-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
