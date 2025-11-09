<template>
  <h1>Add buttons!</h1>
  <div style="display: flex; gap: 16px; flex-wrap: wrap;">
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
    <BaseCard
      title="Новая практика"
      hoverable
      padding-size="medium"
    >
      <p>Нажмите, чтобы добавить</p>
    </BaseCard>

    <!-- Без теней -->
    <BaseCard variant="subtle" flat>
      <span>Минималистичная информация</span>
    </BaseCard>

  </div>

  <h1>Test modals</h1>
  <div>
    <BaseButton @click="isModalOpen = true">
      + Новая практика
    </BaseButton>
    <!-- Простое модальное окно -->
    <BaseModal
      title="Добавить новую привычку"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    >
      <HabitForm @success="onAddHabit" />
    </BaseModal>

    <!-- Модальное окно с footer -->
    <BaseModal
      title="Подтверждение"
      :is-open="isConfirmOpen"
      @close="isConfirmOpen = false"
    >
      <p>Вы уверены, что хотите удалить эту привычку?</p>
      <template #footer>
        <BaseButton
          variant="secondary"
          @click="isConfirmOpen = false"
        >
          Отмена
        </BaseButton>
        <BaseButton
          variant="danger"
          @click="confirmDelete"
        >
          Удалить
        </BaseButton>
      </template>
    </BaseModal>
  </div>

  <h1>Add habbit card</h1>
  <div class="habit-list">
<!--    <HabitCard
      v-for="habit in habits"
      :key="habit.id"
      :habit="habit"
      :completion-today="isCompletedToday(habit.id)"
      :current-streak="getStreak(habit.id)"
      :best-streak="getBestStreak(habit.id)"
      :completion-count="getCompletionCount(habit.id)"
      :logs="logs"
      @edit="onEdit"
      @delete="onDelete"
    />-->
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import HabitForm from '@/components/habits/HabitForm.vue'
import HabitCard from '@/components/habits/HabitCard.vue'

const isModalOpen = ref(false)
const isConfirmOpen = ref(false)

// const onAddHabit = (habit) => {
//   // логика добавления
//   isModalOpen.value = false
// }

const confirmDelete = () => {
  // логика удаления
  isConfirmOpen.value = false
}
</script>
